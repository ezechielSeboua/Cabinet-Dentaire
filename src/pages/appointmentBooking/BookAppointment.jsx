import { useRef, useState, useEffect } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/themes/material_blue.css";
import { French } from "flatpickr/dist/l10n/fr.js";
import { toast } from "react-toastify";
import axios from "axios";
import Modal from "react-modal";

import { bookAppointment } from "../../services/cdiService";
import { API_URL } from "../../utils/config";
import "../../modal.css";

import { IoClose } from "react-icons/io5";

// --- Helper Icons ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);
const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
);
const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-16 w-16 text-green-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

Modal.setAppElement("#root");

const SpinnerIcon = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export default function BookAppointment() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [patientname, setName] = useState("");
  const [patienttelephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (selectedDate) {
      setSelectedTime(null);
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const resetForm = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setName("");
    setTelephone("");
    setEmail("");
    setAvailableSlots([]);
    isInitialMount.current = true;
  };

  const fetchAvailableSlots = async (rendezvousdate) => {
    setLoading(true);
    try {
      const dateStr = rendezvousdate.toISOString().split("T")[0];
      const response = await axios.get(
        `${API_URL}/appointment-booking/available`,
        { params: { rendezvousdate: dateStr } },
      );
      setAvailableSlots(response.data);
      setModalIsOpen(true);
    } catch (err) {
      toast.error("Échec de la récupération des créneaux. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelection = (slot) => {
    setSelectedTime(slot);
    setModalIsOpen(false);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      patientname,
      patienttelephone,
      email,
      status: "EN SUSPENS",
      rendezvousdate: selectedDate,
      rendezvoustime: selectedTime,
    };

    try {
      await bookAppointment(payload);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        resetForm();
      }, 20000); // 20 seconds
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error(
        <div>
          <div>Une erreur est survenue.</div>
          <div>
            Il n'y a peut-être plus de créneaux disponibles. Veuillez choisir
            une autre date.
          </div>
        </div>,
        { position: "top-center" },
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormComplete =
    patientname.trim() !== "" &&
    patienttelephone.trim() !== "" &&
    email.trim() !== "" &&
    selectedDate !== null &&
    selectedDate !== undefined &&
    selectedTime !== null &&
    selectedTime !== "";

  const steps = [
    { n: "1", title: "Choisissez une date", desc: "Sélectionnez un jour disponible dans le calendrier." },
    { n: "2", title: "Choisissez un créneau", desc: "Les horaires disponibles s'affichent après la date." },
    { n: "3", title: "Vos coordonnées", desc: "Nom, téléphone et email pour vous recontacter." },
    { n: "4", title: "Confirmation", desc: "Nous vous confirmons le rendez-vous rapidement." },
  ];

  return (
    <div className="w-full">
      {/* ── Section header ── */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Réserver une consultation
        </h2>
        <p className="mt-2 text-gray-500 text-sm sm:text-base">
          Prenez rendez-vous en ligne en quelques instants.
        </p>
      </div>

      {/* ── 4-step process ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {steps.map((s) => (
          <div key={s.n} className="flex flex-col items-center text-center gap-2">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600 text-white text-sm font-bold shadow-sm">
              {s.n}
            </span>
            <p className="text-sm font-semibold text-gray-800 leading-tight">{s.title}</p>
            <p className="text-xs text-gray-500 leading-snug hidden sm:block">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Form card ── */}
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {isSuccess ? (
          <div className="p-10 text-center">
            <CheckCircleIcon />
            <h3 className="text-2xl font-bold text-gray-800 mt-4">
              Rendez-vous demandé !
            </h3>
            <p className="mt-2 text-gray-500">
              Votre demande a été envoyée. Nous vous contacterons rapidement pour confirmer.
            </p>
          </div>
        ) : (
          <form className="p-8 space-y-5" onSubmit={handleSubmit}>
            {/* Date + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date souhaitée <span className="text-red-500">*</span>
                </label>
                <Flatpickr
                  value={selectedDate}
                  onChange={(dates) => setSelectedDate(dates[0])}
                  options={{
                    dateFormat: "d/m/Y",
                    locale: French,
                    minDate: new Date().fp_incr(1),
                    disable: [
                      (date) => date.getDay() === 0,
                      (date) => {
                        const now = new Date();
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const threePM = new Date();
                        threePM.setHours(15, 0, 0, 0);
                        return date.getTime() === today.getTime() && now > threePM;
                      },
                    ],
                  }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer text-sm"
                  placeholder="Sélectionner une date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Créneau horaire <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={selectedTime ? selectedTime.substring(0, 5) : ""}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-sm text-gray-700"
                    placeholder="Choisir une date d'abord"
                  />
                  {selectedTime && (
                    <button
                      type="button"
                      onClick={() => { if (selectedDate) setModalIsOpen(true); }}
                      className="absolute inset-y-0 right-0 px-3 text-xs text-primary-600 hover:text-primary-800 font-semibold"
                    >
                      Changer
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom et Prénom <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon /></span>
                <input
                  type="text"
                  value={patientname}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Ex : Jean Dupont"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3"><PhoneIcon /></span>
                  <input
                    type="tel"
                    value={patienttelephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="+225 07 00 00 00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3"><EmailIcon /></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="jean.dupont@email.com"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormComplete || loading}
              className="w-full flex items-center justify-center text-white bg-primary-600 text-base font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2"
            >
              {loading ? (
                <><SpinnerIcon />Réservation en cours…</>
              ) : (
                "Je réserve mon créneau"
              )}
            </button>
          </form>
        )}
      </div>


      {/* Modal for time slots */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Créneaux horaires disponibles"
        className="Modal"
        overlayClassName="Overlay"
      >
        <div className="ModalHeader">
          <h2 className="ModalTitle">
            Créneaux pour le {selectedDate?.toLocaleDateString("fr-FR")}
          </h2>
          <button
            className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={closeModal}
          >
            <IoClose size={24} />
          </button>
        </div>
        <div className="ModalBody">
          {loading ? (
            <p className="text-center">Recherche des créneaux...</p>
          ) : availableSlots.length > 0 ? (
            <div className="SlotsGrid">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleSlotSelection(slot)}
                  className="SlotButton"
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : (
            <p className="NoSlots">
              Désolé, aucun créneau n'est disponible pour cette date. Veuillez
              en choisir une autre.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
// --- End of BookAppointment.jsx ---
