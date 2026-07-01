import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clinicPublic } from "../services/cdiService";
import { normalizeFileUrl } from "../utils/config";
import logo1 from "../assets/logo1.jpg";
import backgroundImage from "../assets/dental-clinic-renovation.jpeg";
import ForgotPasswordForm from "../components/passwordmanagement/ForgotPasswordForm";
import OtpForm from "../components/passwordmanagement/OtpForm";
import PasswordResetForm from "../components/passwordmanagement/PasswordResetForm";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [clinicData, setClinicData] = useState(null);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    clinicPublic()
      .then((res) => { if (res.data) setClinicData(res.data); })
      .catch(() => {});
  }, []);

  const handleStep1Done = (verifiedEmail) => {
    setEmail(verifiedEmail);
    setStep(2);
  };

  const handleStep2Done = (verifiedOtp) => {
    setOtp(verifiedOtp);
    setStep(3);
  };

  const handleClose = () => {
    navigate("/login");
  };

  const bgUrl = clinicData?.backgroundimage
    ? normalizeFileUrl(clinicData.backgroundimage)
    : backgroundImage;

  const logoUrl = clinicData?.logo
    ? normalizeFileUrl(clinicData.logo)
    : logo1;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgUrl})` }}
    >
      <div className="absolute inset-0 opacity-75" />
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src={logoUrl}
            alt="Logo clinique"
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                s === step
                  ? "bg-primary-600"
                  : s < step
                  ? "bg-primary-300"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {step === 1 && <ForgotPasswordForm onNextStep={handleStep1Done} />}
        {step === 2 && (
          <OtpForm
            onNextStep={handleStep2Done}
            onPreviousStep={() => setStep(1)}
            userEmail={email}
          />
        )}
        {step === 3 && (
          <PasswordResetForm
            onClose={handleClose}
            onPreviousStep={() => setStep(2)}
            userEmail={email}
            otp={otp}
          />
        )}

        {/* Back to login */}
        <p className="text-center text-sm text-gray-500">
          <button
            onClick={handleClose}
            className="text-primary-600 hover:underline font-medium cursor-pointer"
          >
            ← Retour à la connexion
          </button>
        </p>
      </div>
    </div>
  );
}
