import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bounce, toast } from "react-toastify";

// Import your reusable components
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
// import Modal from "../../components/Modal";
// import Stepper from "../../components/Stepper"; // Make sure the path is correct

// Import your service
import { clinicSettings } from "../../services/cdiService";
import Modal from "../modals/Modal";
import Stepper from "./Stepper";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

// --- Define initial state outside the component to easily reset the form ---
const initialFormData = {
  name: "",
  ownerName: "",
  address: "",
  about: "",
  email: "",
  telephone: "",
  telephonemobile: "",
  telephonemobile2: "",
  vision: "",
  mission: "",
  faceBook: "",
  youTube: "",
  linkedIn: "",
  twitter: "",
  telegram: "",
  welcomeword: "",
  googlelocationurl: "",
};

export default function ClinicSettings() {
  const sidebarMargin = useSidebarMargin();
  const navigate = useNavigate();

  // --- State for Modal visibility ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- State for Stepper ---
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { id: 1, name: "Informations" },
    { id: 2, name: "Contact" },
    { id: 3, name: "Vision & Mission" },
    { id: 4, name: "Réseaux Sociaux" },
    { id: 5, name: "Web & Localisation" },
  ];
  const totalSteps = steps.length;

  // --- A single, clean state object for all form data ---
  const [data, setData] = useState(initialFormData);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const closeModal = () => {
    setIsModalOpen(false);
    // Reset form state when closing the modal
    setCurrentStep(1);
    setData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await clinicSettings(data);
      toast.success("La clinique a été ajoutée avec succès!", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      closeModal(); // Close and reset the modal on success
      navigate("/clinic"); // Or whatever you need to do next
    } catch (error) {
      console.error("Failed to create clinic settings:", error);
      toast.error("Une erreur est survenue lors de la création.");
    }
  };

  // --- Reusable Tailwind Classes ---
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
  const inputClasses =
    "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-indigo-500 sm:text-sm";
  const textAreaClasses = `${inputClasses} min-h-[120px]`;

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <SideBar2 />
      <main className={`h-full mt-14 ml-14 ${sidebarMargin} p-8`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Gestion de la Clinique
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none"
          >
            Ajouter une clinique
          </button>
        </div>

        {/* This is where your list of clinics would go */}
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">
            Le contenu de votre page (par exemple, la liste des cliniques
            existantes) s'affichera ici.
          </p>
        </div>
      </main>

      {/* --- The Modal with Stepper Form --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Ajouter une nouvelle clinique"
      >
        <div className="mb-8">
          <Stepper currentStep={currentStep} steps={steps} />
        </div>
        <form onSubmit={handleSubmit}>
          {/* Conditional Rendering of Form Steps */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-y-6">
                <div>
                  <label htmlFor="name" className={labelClasses}>
                    Nom de la clinique
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={data.name || ""}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Nom de la clinique"
                  />
                </div>
                <div>
                  <label htmlFor="ownerName" className={labelClasses}>
                    Nom du responsable
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    id="ownerName"
                    value={data.ownerName || ""}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Dr. Prénom Nom"
                  />
                </div>
                <div>
                  <label htmlFor="address" className={labelClasses}>
                    Adresse
                  </label>
                  <textarea
                    name="address"
                    id="address"
                    value={data.address || ""}
                    onChange={handleChange}
                    className={textAreaClasses}
                    placeholder="Votre adresse complète"
                  />
                </div>
                <div>
                  <label htmlFor="about" className={labelClasses}>
                    À propos de nous
                  </label>
                  <textarea
                    name="about"
                    id="about"
                    value={data.about || ""}
                    onChange={handleChange}
                    className={textAreaClasses}
                    placeholder="Décrivez brièvement votre clinique"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className={labelClasses}>
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={data.email || ""}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="contact@exemple.com"
                  />
                </div>
                <div>
                  <label htmlFor="telephone" className={labelClasses}>
                    N° Téléphone Fixe
                  </label>
                  <input
                    type="text"
                    name="telephone"
                    id="telephone"
                    value={data.telephone || ""}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="+225 XX XX XX XX"
                  />
                </div>
                <div>
                  <label htmlFor="telephonemobile" className={labelClasses}>
                    N° Téléphone Mobile 1
                  </label>
                  <input
                    type="text"
                    name="telephonemobile"
                    id="telephonemobile"
                    value={data.telephonemobile || ""}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="+225 XX XX XX XX"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="telephonemobile2" className={labelClasses}>
                    N° Téléphone Mobile 2
                  </label>
                  <input
                    type="text"
                    name="telephonemobile2"
                    id="telephonemobile2"
                    value={data.telephonemobile2 || ""}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="+225 XX XX XX XX"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor="vision" className={labelClasses}>
                    Vision
                  </label>
                  <textarea
                    name="vision"
                    id="vision"
                    value={data.vision || ""}
                    onChange={handleChange}
                    className={textAreaClasses}
                    placeholder="Votre vision"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="mission" className={labelClasses}>
                    Mission
                  </label>
                  <textarea
                    name="mission"
                    id="mission"
                    value={data.mission || ""}
                    onChange={handleChange}
                    className={textAreaClasses}
                    placeholder="Votre mission"
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="faceBook" className={labelClasses}>
                    Lien Facebook
                  </label>
                  <input
                    type="url"
                    name="faceBook"
                    id="faceBook"
                    value={data.faceBook || ""}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label htmlFor="youTube" className={labelClasses}>
                    Lien YouTube
                  </label>
                  <input
                    type="url"
                    name="youTube"
                    id="youTube"
                    value={data.youTube || ""}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div>
                  <label htmlFor="linkedIn" className={labelClasses}>
                    Lien LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedIn"
                    id="linkedIn"
                    value={data.linkedIn || ""}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label htmlFor="twitter" className={labelClasses}>
                    Lien Twitter
                  </label>
                  <input
                    type="url"
                    name="twitter"
                    id="twitter"
                    value={data.twitter || ""}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <label htmlFor="telegram" className={labelClasses}>
                    Lien Telegram
                  </label>
                  <input
                    type="url"
                    name="telegram"
                    id="telegram"
                    value={data.telegram || ""}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="https://t.me/..."
                  />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="welcomeword" className={labelClasses}>
                    Message de bienvenue
                  </label>
                  <textarea
                    name="welcomeword"
                    id="welcomeword"
                    value={data.welcomeword || ""}
                    onChange={handleChange}
                    className={textAreaClasses}
                    placeholder="Bienvenue dans notre clinique..."
                  />
                </div>
                <div>
                  <label htmlFor="googlelocationurl" className={labelClasses}>
                    Lien Google Maps
                  </label>
                  <input
                    type="url"
                    name="googlelocationurl"
                    id="googlelocationurl"
                    value={data.googlelocationurl || ""}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
                <p className="text-xs text-gray-400 italic">
                  Les images (logo, favicon, image de fond, QR code) peuvent être ajoutées après la création via la page de détails.
                </p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              className={`inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                currentStep === 1 ? "invisible" : ""
              }`}
            >
              Précédent
            </button>

            {currentStep < totalSteps && (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Suivant
              </button>
            )}

            {currentStep === totalSteps && (
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Sauvegarder
              </button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
