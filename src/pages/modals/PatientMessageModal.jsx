// src/components/PatientMessageModal.jsx

import React from "react";
import { IoClose } from "react-icons/io5";

// The modal now accepts 'messageData' directly for a more specialized component
export default function PatientMessageModal({ isOpen, onClose, messageData }) {
  if (!isOpen) {
    return null;
  }

  // Stop click propagation to prevent closing when clicking inside the modal
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Backdrop with fade-in animation
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent  transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Modal Container with scale-in animation */}
      <div
        className="relative w-full max-w-4xl bg-slate-50 dark:bg-slate-800 rounded-lg shadow-xl m-4 transition-transform duration-300 transform scale-100"
        onClick={handleModalContentClick}
      >
        {/* Close Button - positioned absolutely for precise control */}
        <button
          onClick={onClose}
          className="absolute top-3 cursor-pointer right-3 z-10 p-2 text-rose-500 hover:bg-rose-500 dark:hover:bg-gray-700 hover:text-white rounded-full "
          aria-label="Close modal"
        >
          <IoClose size={26} />
        </button>

        {/* Main Grid Layout */}
        <div className="grid md:grid-cols-12">
          {/* Left Column (Patient Details) */}
          <div className="md:col-span-4 bg-primary-500 dark:bg-primary-900 p-6 rounded-l-lg">
            <h3 className="text-lg font-bold text-white dark:text-slate-100 mb-1">
              Patient Details
            </h3>
            <p className="text-sm text-white  mb-6">
              Information de contact et d'identification.
            </p>
            <div className="space-y-4 text-sm">
              <div className="flex flex-col">
                <span className="font-semibold text-white">Prénoms & Nom</span>
                <span className="text-white">{messageData?.patientname}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white">Patient No</span>
                <span className="text-white">{messageData?.patientno}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white">N° Telephone</span>
                <span className="text-white">
                  {messageData?.patienttelephone}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white">Date d'envoi</span>
                <span className="text-white">
                  {new Date(messageData?.createdOn).toLocaleString("fr-FR")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (Message Content) */}
          <div className="md:col-span-8 p-6 md:p-8">
            <h3 className="text-2xl font-bold text-primary-800 dark:text-primary-400 mb-4">
              Contenu du Message
            </h3>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              <p>
                {messageData?.message || "Aucun contenu de message fourni."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
