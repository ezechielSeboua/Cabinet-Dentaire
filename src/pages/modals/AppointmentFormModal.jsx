import { Fragment, useState, useEffect, useCallback } from "react";
import useDarkMode from "../../hooks/useDarkMode";

import { Dialog, Transition } from "@headlessui/react";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import { French } from "flatpickr/dist/l10n/fr.js";
import { format } from "date-fns";
import { FaCalendarCheck } from "react-icons/fa";
import axios from "axios";
import { Bounce, toast } from "react-toastify";

import { getCurrentUser } from "../../services/authService";
import { AuthHeader } from "../../utils/authHeader";
import {
  addAppointment,
  updateAppointment,
  getAllUsers,
} from "../../services/cdiService";

import "flatpickr/dist/themes/airbnb.css";
import "../../datepicker-custom.css";
import { API_URL } from "../../utils/config";

export default function AppointmentFormModal({
  isOpen,
  onClose,
  onSuccess,
  patient,
  existingAppointment,
}) {
  const isDark = useDarkMode();
  const [currentUser] = useState(getCurrentUser());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(existingAppointment);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [timeOptions, setTimeOptions] = useState([]);
  const [isTimeLoading, setIsTimeLoading] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [formData, setFormData] = useState({
    commentaire: "",
    status: "En attente",
  });

  const statusOptions = [
    { value: "En attente", label: "En attente" },
    { value: "Confirmé", label: "Confirmé" },
    { value: "Annulé", label: "Annulé" },
    { value: "Terminé", label: "Terminé" },
  ];

  const isDoctor = currentUser?.body?.roles?.some((r) =>
    typeof r === "string" ? r === "DOCTOR" : r.name === "DOCTOR"
  );

  // Effect to fetch and filter users to get a list of doctors
  useEffect(() => {
    if (isOpen && !isDoctor) {
      const fetchAndFilterUsers = async () => {
        setIsDoctorsLoading(true);
        try {
          const allUsers = await getAllUsers();
          const usersArray = Array.isArray(allUsers) ? allUsers : [];

          const doctorUsers = usersArray.filter((user) => {
            const auth = user.authorisation?.toLowerCase() ?? "";
            const hasDocterRole =
              Array.isArray(user.roles) &&
              user.roles.some((role) => {
                const name = (typeof role === "string" ? role : String(role.name ?? "")).toLowerCase();
                return name === "doctor" || name === "role_doctor";
              });
            return auth === "doctor" || hasDocterRole;
          });

          const doctorOptions = doctorUsers
            .map((doc) => ({
              value: doc.userId,
              label: `Dr. ${doc.lastname} ${doc.firstname}`,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));

          setDoctors(doctorOptions);
        } catch (error) {
          console.error("Failed to fetch doctors:", error);
          toast.error("Impossible de charger la liste des médecins.");
        } finally {
          setIsDoctorsLoading(false);
        }
      };
      fetchAndFilterUsers();
    } else if (currentUser && isDoctor) {
      setSelectedDoctor({
        value: currentUser.body.id,
        label: `Dr. ${currentUser.body.firstname} ${currentUser.body.lastname}`,
      });
    }
  }, [isOpen, isDoctor, currentUser]);

  // Effect to reset or pre-fill form fields
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && existingAppointment) {
      const existingDateTime = new Date(
        `${existingAppointment.rendezvousdate}T${existingAppointment.rendezvoustime}`
      );

      if (!isNaN(existingDateTime)) {
        setSelectedDate(existingDateTime);
        const timeValue = format(existingDateTime, "HH:mm");
        setSelectedTime(timeValue);
        setTimeOptions([timeValue]);
      }

      // --- FIX #1 RE-ADDED: Pre-select the doctor when editing ---
      if (existingAppointment.doctor && existingAppointment.doctorname) {
        setSelectedDoctor({
          value: existingAppointment.doctor,
          label: existingAppointment.doctorname,
        });
      }

      setFormData({
        commentaire: existingAppointment.commentaire || "",
        status: existingAppointment.status || "En attente",
      });
    } else {
      // Reset all fields for "create" mode
      setSelectedDate(null);
      setSelectedTime(null);
      setTimeOptions([]);
      setFormData({ commentaire: "", status: "En attente" });
      if (!isDoctor) {
        setSelectedDoctor(null);
      }
    }
  }, [existingAppointment, isEditMode, isOpen, isDoctor]);

  const handleDateChange = useCallback(async ([date]) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setTimeOptions([]);

    if (date) {
      setIsTimeLoading(true);
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        const response = await axios.get(
          `${API_URL}/appointment-booking/available`,
          { params: { rendezvousdate: dateStr }, headers: AuthHeader() }
        );

        if (Array.isArray(response.data)) {
          setTimeOptions(response.data);
        } else {
          console.warn(
            "API did not return an array for available slots. Received:",
            response.data
          );
          setTimeOptions([]);
        }
      } catch (err) {
        console.error("Échec de la récupération des créneaux disponibles.", err);
        toast.error("Échec de la récupération des créneaux. Veuillez réessayer.");
        setTimeOptions([]);
      } finally {
        setIsTimeLoading(false);
      }
    }
  }, []);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      toast.error("Veuillez sélectionner un médecin.");
      return;
    }
    setIsSubmitting(true);
    const submissionPayload = { ...formData };

    if (selectedDate && selectedTime) {
      const combinedDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      combinedDateTime.setHours(hours, minutes, 0, 0);

      submissionPayload.rendezvousdate = format(combinedDateTime, "yyyy-MM-dd");
      submissionPayload.rendezvoustime = format(combinedDateTime, "HH:mm:ss");
    }

    // --- FIX #2 APPLIED: Restructure data creation to ensure doctor is always updated ---
    // This object contains all data from the current form state
    const currentFormState = {
      ...submissionPayload,
      doctor: selectedDoctor.value,
      doctorname: selectedDoctor.label,
    };

    const finalData = isEditMode
      ? {
          ...existingAppointment, // Start with original data
          ...currentFormState, // Overwrite with current form state
        }
      : {
          ...currentFormState, // Start with current form state
          patient: parseInt(patient.id), // Add patient info for creation
          patientname: `${patient.lastname} ${patient.firstname}`,
          patienttelephone: patient.telephone,
          patientno: patient.patientno,
          patientemail: patient.email,
        };

    try {
      if (isEditMode) {
        await updateAppointment(existingAppointment.id, finalData);
        toast.success("Rendez-vous mis à jour!", { transition: Bounce });
      } else {
        await addAppointment(finalData);
        toast.success("Nouveau rendez-vous créé!", { transition: Bounce });
      }
      onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectDarkStyles = {
    control: (p) => ({ ...p, backgroundColor: isDark ? "#334155" : "#fff", borderColor: isDark ? "#475569" : "#D1D5DB" }),
    menu: (p) => ({ ...p, backgroundColor: isDark ? "#1e293b" : "#fff", zIndex: 50 }),
    option: (p, { isFocused, isSelected }) => ({ ...p, backgroundColor: isSelected ? "#be185d" : isFocused ? (isDark ? "#334155" : "#fdf2f8") : (isDark ? "#1e293b" : "#fff"), color: isSelected ? "#fff" : isDark ? "#e2e8f0" : "#111827" }),
    singleValue: (p) => ({ ...p, color: isDark ? "#e2e8f0" : "#111827" }),
    input: (p) => ({ ...p, color: isDark ? "#e2e8f0" : "#111827" }),
    placeholder: (p) => ({ ...p, color: isDark ? "#94a3b8" : "#9ca3af" }),
    indicatorSeparator: (p) => ({ ...p, backgroundColor: isDark ? "#475569" : "#D1D5DB" }),
    dropdownIndicator: (p) => ({ ...p, color: isDark ? "#94a3b8" : "#6b7280" }),
  };

  const isDoctorMissing = !selectedDoctor;
  const isCommentMissing = !formData.commentaire.trim();
  const areDateTimeMissingInCreateMode =
    !isEditMode && (!selectedDate || !selectedTime);
  const isFormInvalid =
    isDoctorMissing || isCommentMissing || areDateTimeMissingInCreateMode;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* ... The rest of your JSX remains the same and is correct ... */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 md:p-8 text-left align-middle shadow-2xl transition-all">
                <div className="text-center mb-8">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                    <FaCalendarCheck
                      className="h-7 w-7 text-primary-600"
                      aria-hidden="true"
                    />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="mt-4 text-xl font-bold leading-6 text-gray-900 dark:text-white"
                  >
                    {isEditMode
                      ? "Modifier le Rendez-vous"
                      : "Planifier un Rendez-vous"}
                  </Dialog.Title>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Pour{" "}
                    <span className="font-semibold text-primary-700 dark:text-primary-400">
                      {isEditMode
                        ? existingAppointment.patientname
                        : `${patient?.firstname} ${patient?.lastname}`}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isDoctor && (
                    <div>
                      <label
                        htmlFor="doctor"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                      >
                        Médecin <span className="text-red-500">*</span>
                      </label>
                      <Select
                        id="doctor"
                        name="doctor"
                        options={doctors}
                        value={selectedDoctor}
                        onChange={setSelectedDoctor}
                        isLoading={isDoctorsLoading}
                        placeholder="Sélectionner un médecin..."
                        classNamePrefix="react-select"
                        noOptionsMessage={() => "Aucun médecin trouvé."}
                        styles={selectDarkStyles}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        1. Choisissez une date{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Flatpickr
                        value={selectedDate}
                        onChange={handleDateChange}
                        options={{
                          locale: French,
                          minDate: new Date().fp_incr(1),
                          disable: [(date) => date.getDay() === 0],
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                        placeholder="Sélectionner une date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        2. Heure choisie <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={selectedTime || ""}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-gray-100 dark:bg-slate-700 dark:text-gray-400 cursor-not-allowed"
                          placeholder="--:--"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedDate && !selectedTime && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Veuillez choisir un créneau horaire disponible :
                      </label>
                      {isTimeLoading ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Chargement des créneaux...
                        </p>
                      ) : timeOptions.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {timeOptions.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className="px-3 py-2 border dark:border-slate-600 dark:bg-slate-700 dark:text-gray-200 rounded-md text-center text-sm font-medium hover:bg-primary-100 hover:border-primary-500 dark:hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-red-500">
                          Aucun créneau disponible pour cette date.
                        </p>
                      )}
                    </div>
                  )}

                  {isEditMode && (
                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                      >
                        Statut
                      </label>
                      <Select
                        id="status"
                        name="status"
                        options={statusOptions}
                        value={statusOptions.find(
                          (opt) => opt.value === formData.status
                        )}
                        onChange={(opt) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: opt.value,
                          }))
                        }
                        classNamePrefix="react-select"
                        placeholder="Choisir un statut..."
                        styles={selectDarkStyles}
                      />
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="commentaire"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Raison du rendez-vous{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="commentaire"
                        name="commentaire"
                        rows="4"
                        required
                        value={formData.commentaire}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            commentaire: e.target.value,
                          }))
                        }
                        className="block w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 pl-2 shadow-sm focus:border-gray-500 focus:ring-2 focus:ring-gray-500 sm:text-sm"
                        placeholder="Ex: Consultation de suivi, Examen annuel..."
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 dark:border-slate-600 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                    <button
                      type="button"
                      className="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600"
                      onClick={onClose}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isFormInvalid}
                      className="w-full sm:w-auto cursor-pointer inline-flex justify-center rounded-md border border-transparent bg-primary-700 py-2 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? "Sauvegarde..."
                        : isEditMode
                        ? "Sauvegarder"
                        : "Créer le RDV"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
