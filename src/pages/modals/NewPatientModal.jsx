import React, { useEffect, useMemo, useState } from "react";
import useDarkMode from "../../hooks/useDarkMode";

import Select from "react-select";
import { toast } from "react-toastify";
import {
  IoArrowBack,
  IoSaveOutline,
  IoArrowForward,
  IoClose,
} from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import { AnimatePresence, motion } from "framer-motion";

// --- REQUIRED FOR CUSTOM DATE FORMAT ---
// ---

// --- NEWLY CREATED MODAL ---
import ProfessionModal from "./ProfessionModal";
// ---

// Services
import {
  addPatient,
  updatePatient,
  insuranceList,
  insurance2List,
} from "../../services/cdiService";

// Helper components
const FormField = ({ label, children, error }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
      {label}
    </label>
    <div className="relative">{children}</div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const ActionButton = ({
  onClick,
  type = "button",
  disabled,
  children,
  variant = "primary",
}) => {
  const baseClasses =
    "w-full md:w-auto flex items-center justify-center gap-2.5 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-sky-800 transition-all duration-150";
  const variants = {
    primary:
      "text-white bg-primary-700 hover:bg-primary-800 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed",
    secondary:
      "text-white bg-primary-700 hover:bg-primary-800 dark:bg-primary-700 dark:text-white dark:hover:bg-primary-600 focus:ring-primary-400",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

const initialFormData = {
  firstname: "",
  lastname: "",
  email: "",
  telephone: "",
  dob: "",
  profession: "",
  gender: "",
  insurance: "NA",
  insurance_pourcentage: 0,
  insurance_matricule: "NA",
  insurance2: "NA",
  insurance2_pourcentage: 0,
  insurance2_matricule: "NA",
};

export default function NewPatientModal({
  isOpen,
  onClose,
  onSuccess,
  patientToEdit,
}) {
  const isDark = useDarkMode();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [record, setRecord] = useState([]);
  const [recordInsurance2, setRecordInsurance2] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfessionModalOpen, setProfessionModalOpen] = useState(false);

  const isEditMode = Boolean(patientToEdit);

  const resetAllState = () => {
    setStep(1);
    setFormData(initialFormData);
    setErrors({});
    setIsSubmitting(false);
    setProfessionModalOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        const initialData = { ...patientToEdit, dob: patientToEdit.dob ?? "" };
        setFormData(initialData);
      } else {
        setFormData(initialFormData);
      }

      if (record.length === 0) {
        setIsLoading(true);
        Promise.all([insuranceList(), insurance2List()])
          .then(([ins1Res, ins2Res]) => {
            setRecord(
              ins1Res.data.sort((a, b) =>
                a.insurance.localeCompare(b.insurance),
              ),
            );
            setRecordInsurance2(
              ins2Res.data.sort((a, b) =>
                a.insurance2.localeCompare(b.insurance2),
              ),
            );
          })
          .catch((error) => {
            console.error("Failed to fetch insurance lists:", error);
            toast.error("Could not load insurance data.");
          })
          .finally(() => setIsLoading(false));
      }
    } else {
      resetAllState();
    }
  }, [isOpen, patientToEdit, isEditMode, record.length]);

  const insuranceOptions = useMemo(
    () =>
      record.map((item) => ({ value: item.insurance, label: item.insurance })),
    [record],
  );
  const insurance2Options = useMemo(
    () =>
      recordInsurance2.map((item) => ({
        value: item.insurance2,
        label: item.insurance2,
      })),
    [recordInsurance2],
  );
  const genderOptions = [
    { value: "MALE", label: "Masculin" },
    { value: "FEMELE", label: "Féminin" },
    { value: "AUTRE", label: "Autre" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleProfessionSelect = (profession) => {
    setFormData((prev) => ({ ...prev, profession: profession.toUpperCase() }));
    setProfessionModalOpen(false);
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstname.trim())
      newErrors.firstname = "Le prénom est requis.";
    if (!formData.lastname.trim())
      newErrors.lastname = "Le nom de famille est requis.";
    if (!formData.dob) newErrors.dob = "La date de naissance est requise.";

    if (!formData.gender) newErrors.gender = "Le genre est requis.";
    if (!formData.profession.trim())
      newErrors.profession = "La profession est requise.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) setStep(2);
    else
      toast.warn("Veuillez remplir tous les champs obligatoires.", {
        position: "top-center",
      });
  };
  const handlePrevStep = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) {
      toast.error("Veuillez corriger les erreurs sur la première page.");
      setStep(1);
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const patientData = {
      ...formData,
      dob: formData.dob || null,
      firstname: formData.firstname.toUpperCase(),
      lastname: formData.lastname.toUpperCase(),
      profession: formData.profession.toUpperCase(),
      email: formData.email.toLowerCase(),
      insurance_pourcentage: Number(formData.insurance_pourcentage) || 0,
      insurance2_pourcentage: Number(formData.insurance2_pourcentage) || 0,
    };

    try {
      if (isEditMode) {
        await updatePatient(patientToEdit.id, patientData);
        toast.success("Patient mis à jour avec succès!", {
          position: "top-center",
          autoClose: 1000,
          theme: "light",
        });
        onSuccess({});
      } else {
        const response = await addPatient(patientData);
        toast.success("Patient créé avec succès!");
        onSuccess({ newPatient: response.data, isNew: true });
      }
    } catch (error) {
      console.error("Error saving patient:", error);
      toast.error("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectStyles = (hasError) => ({
    control: (provided) => ({
      ...provided,
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
      minHeight: "36px",
    }),
    container: (provided) => ({
      ...provided,
      backgroundColor: isDark ? "rgb(51 65 85)" : "rgb(243 244 246)",
      border: `1px solid ${hasError ? "rgb(239 68 68)" : isDark ? "rgb(71 85 105)" : "rgb(209 213 219)"}`,
      borderRadius: "0.5rem",
      transition: "border-color 150ms ease-in-out",
      "&:hover": {
        borderColor: hasError ? "rgb(239 68 68)" : isDark ? "rgb(100 116 139)" : "rgb(99 102 241)",
      },
    }),
    menu: (base) => ({ ...base, backgroundColor: isDark ? "#1e293b" : "#fff", zIndex: 50 }),
    option: (base, { isFocused, isSelected }) => ({ ...base, backgroundColor: isSelected ? "#be185d" : isFocused ? (isDark ? "#334155" : "#fdf2f8") : (isDark ? "#1e293b" : "#fff"), color: isSelected ? "#fff" : isDark ? "#e2e8f0" : "#111827" }),
    input: (base) => ({ ...base, color: isDark ? "#e2e8f0" : "#111827", "input:focus": { boxShadow: "none" } }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? "rgb(148 163 184)" : "rgb(107 114 128)",
      fontSize: "0.875rem",
    }),
    singleValue: (base) => ({ ...base, fontSize: "0.875rem", color: isDark ? "#e2e8f0" : "#111827" }),
  });
  const inputStyle = (hasError) =>
    `w-full h-9 text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all duration-150 ${
      hasError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
    }`;

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-70"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="relative w-full max-w-4xl transform rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all m-4 max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {isEditMode
                ? "Modifier les informations du Patient"
                : "Enregistrer un nouveau patient"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 dark:hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <IoClose size={24} />
            </button>
          </div>
          <div className="p-6 md:p-8 overflow-y-auto">
            <div className="flex items-center justify-center mb-8">
              <div
                className={`flex items-center gap-2 ${
                  step === 1 ? "text-black dark:text-white" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= 1 ? "bg-black text-white" : "bg-gray-200"
                  }`}
                >
                  1
                </div>
                <span className="font-semibold">Informations Personnelles</span>
              </div>
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  step > 1 ? "bg-black" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`flex items-center gap-2 ${
                  step === 2 ? "text-black dark:text-white" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= 2 ? "bg-black text-white" : "bg-gray-200"
                  }`}
                >
                  2
                </div>
                <span className="font-semibold">Assurances du patient</span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <CgSpinner className="animate-spin text-black" size={40} />
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.3 }}
                    >
                      <fieldset>
                        <legend className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
                          Information du Patient
                        </legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          <FormField label="Prénom" error={errors.firstname}>
                            <input
                              type="text"
                              name="firstname"
                              value={formData.firstname}
                              onChange={handleChange}
                              className={`${inputStyle(errors.firstname)} px-3`}
                            />
                          </FormField>
                          <FormField
                            label="Nom de famille"
                            error={errors.lastname}
                          >
                            <input
                              type="text"
                              name="lastname"
                              value={formData.lastname}
                              onChange={handleChange}
                              className={`${inputStyle(errors.lastname)} px-3`}
                            />
                          </FormField>
                          <FormField
                            label="Date de Naissance"
                            error={errors.dob}
                          >
                            <input
                              type="date"
                              name="dob"
                              value={formData.dob}
                              onChange={handleChange}
                              max={new Date().toISOString().split("T")[0]}
                              className={`${inputStyle(errors.dob)} px-3`}
                            />
                          </FormField>
                          <FormField label="Genre" error={errors.gender}>
                            <Select
                              options={genderOptions}
                              styles={selectStyles(errors.gender)}
                              placeholder="Sélectionner le genre..."
                              value={genderOptions.find(
                                (opt) => opt.value === formData.gender,
                              )}
                              onChange={(option) =>
                                handleSelectChange("gender", option)
                              }
                            />
                          </FormField>
                          <FormField
                            label="Profession"
                            error={errors.profession}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                name="profession"
                                value={formData.profession}
                                readOnly
                                placeholder="Sélectionner une profession..."
                                className={`${inputStyle(
                                  errors.profession,
                                )} px-3 cursor-pointer`}
                                onClick={() => setProfessionModalOpen(true)}
                              />
                              <button
                                type="button"
                                onClick={() => setProfessionModalOpen(true)}
                                className="flex-shrink-0 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                Choisir
                              </button>
                            </div>
                          </FormField>
                          <FormField label="Adresse Email">
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`${inputStyle()} px-3 lowercase`}
                              placeholder="patient@example.com"
                            />
                          </FormField>
                          <FormField label="Téléphone">
                            <input
                              type="tel"
                              name="telephone"
                              value={formData.telephone}
                              onChange={handleChange}
                              className={`${inputStyle()} px-3`}
                              placeholder="06 12 34 56 78"
                            />
                          </FormField>
                        </div>
                      </fieldset>
                      <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-end">
                        <ActionButton
                          onClick={handleNextStep}
                          className="cursor-pointer"
                        >
                          Prochaine Etape <IoArrowForward size={18} />
                        </ActionButton>
                      </div>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3 }}
                    >
                      <fieldset>
                        <legend className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
                          Couverture Assurances
                        </legend>
                        <div className="space-y-6">
                          <div className="p-5 border rounded-lg dark:border-gray-700">
                            <h3 className="font-semibold mb-4 text-gray-600 dark:text-gray-300">
                              Assurance Principale
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                              <FormField label="Compagnie d'assurance">
                                <Select
                                  options={insuranceOptions}
                                  styles={selectStyles()}
                                  isClearable
                                  placeholder="Sélectionner..."
                                  value={insuranceOptions.find(
                                    (opt) => opt.value === formData.insurance,
                                  )}
                                  onChange={(option) =>
                                    handleSelectChange("insurance", option)
                                  }
                                />
                              </FormField>
                              <FormField label="Matricule / ID">
                                <input
                                  type="text"
                                  name="insurance_matricule"
                                  value={formData.insurance_matricule}
                                  onChange={handleChange}
                                  placeholder="Matricule / ID"
                                  className={`${inputStyle()} px-3`}
                                />
                              </FormField>
                              <FormField label="Couverture %">
                                <input
                                  type="number"
                                  name="insurance_pourcentage"
                                  value={formData.insurance_pourcentage}
                                  onChange={handleChange}
                                  placeholder="%"
                                  min="0"
                                  max="100"
                                  className={`${inputStyle()} px-3`}
                                />
                              </FormField>
                            </div>
                          </div>
                          <div className="p-5 border rounded-lg dark:border-gray-700">
                            <h3 className="font-semibold mb-4 text-gray-600 dark:text-gray-300">
                              Assurance Secondaire
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                              <FormField label="Compagnie d'assurance">
                                <Select
                                  options={insurance2Options}
                                  styles={selectStyles()}
                                  isClearable
                                  placeholder="Sélectionner..."
                                  value={insurance2Options.find(
                                    (opt) => opt.value === formData.insurance2,
                                  )}
                                  onChange={(option) =>
                                    handleSelectChange("insurance2", option)
                                  }
                                />
                              </FormField>
                              <FormField label="Matricule / ID">
                                <input
                                  type="text"
                                  name="insurance2_matricule"
                                  value={formData.insurance2_matricule}
                                  onChange={handleChange}
                                  placeholder="Matricule / ID"
                                  className={`${inputStyle()} px-3`}
                                />
                              </FormField>
                              <FormField label="Couverture %">
                                <input
                                  type="number"
                                  name="insurance2_pourcentage"
                                  value={formData.insurance2_pourcentage}
                                  onChange={handleChange}
                                  placeholder="%"
                                  min="0"
                                  max="100"
                                  className={`${inputStyle()} px-3`}
                                />
                              </FormField>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                      <div className="mt-8 pt-6 cursor-pointer border-t dark:border-sky-700 flex justify-between">
                        <ActionButton
                          onClick={handlePrevStep}
                          variant="secondary"
                          className="cursor-pointer"
                        >
                          <IoArrowBack size={18} /> Etape Précédente
                        </ActionButton>
                        <ActionButton type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <CgSpinner className="animate-spin" size={20} />{" "}
                              Sauvegarde...
                            </>
                          ) : (
                            <>
                              <IoSaveOutline size={20} />{" "}
                              {isEditMode
                                ? "Mettre à jour"
                                : "Sauvegarder Patient"}
                            </>
                          )}
                        </ActionButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            )}
          </div>
        </div>
      </div>

      <ProfessionModal
        isOpen={isProfessionModalOpen}
        onClose={() => setProfessionModalOpen(false)}
        onProfessionSelect={handleProfessionSelect}
      />
    </>
  );
}
