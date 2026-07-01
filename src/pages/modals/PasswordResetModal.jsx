import React, { useState } from "react";
import OtpForm from "../../components/passwordmanagement/OtpForm";
import PasswordResetForm from "../../components/passwordmanagement/PasswordResetForm";
import ForgotPasswordForm from "../../components/passwordmanagement/ForgotPasswordForm";
import { CgClose } from "react-icons/cg";

const PasswordResetModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // This is crucial: if the modal isn't open, it renders nothing.
  if (!isOpen) {
    return null;
  }

  const handleNextStep = (value) => {
    if (step === 1 && value) {
      setEmail(value);
    } else if (step === 2 && value) {
      setOtp(value);
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleClose = () => {
    onClose();
    // Delay resetting the state to allow for a smooth closing animation
    setTimeout(() => {
      setStep(1);
      setEmail("");
      setOtp("");
    }, 300);
  };

  return (
    // --- THIS IS THE FIX ---
    // These classes create a full-screen overlay that sits on top of all other content.
    <div className="fixed inset-0 bg-transparent bg-opacity-60 flex items-center justify-center z-50">
      {/* This is the white box for the modal content */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-sm relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 dark:hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          title="Fermer le modal"
        >
          <CgClose size={20} />
        </button>

        {/* Render the current step's form */}
        {step === 1 && <ForgotPasswordForm onNextStep={handleNextStep} />}
        {step === 2 && (
          <OtpForm
            onNextStep={handleNextStep}
            onPreviousStep={handlePreviousStep}
            userEmail={email}
          />
        )}
        {step === 3 && (
          <PasswordResetForm
            onClose={handleClose}
            userEmail={email}
            otp={otp}
            onPreviousStep={handlePreviousStep}
          />
        )}
      </div>
    </div>
  );
};

export default PasswordResetModal;
