import { useState } from "react";
import { API_URL } from "../../utils/config";
import { Bounce, toast } from "react-toastify";
import Spinner from "../Spinner"; // Make sure the path to your Spinner is correct

export default function OtpForm({ onNextStep, onPreviousStep, userEmail }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // The button is disabled if OTP is empty or if it's loading
  const isButtonDisabled = !otp.trim() || isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Reset error on new submission

    try {
      const res = await fetch(`${API_URL}/forgotPassword/verifyOtp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp,
          email: userEmail,
        }),
      });

      if (res.ok) {
        onNextStep(otp);
        toast.success("Code vérifié! Veuillez créer un nouveau mot de passe.", {
          position: "top-center",
          autoClose: 1500,
          theme: "light",
          transition: Bounce,
        });
      } else {
        const data = await res.json();
        const errorMessage = data.message || "Code invalide ou expiré.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 1000,
        });
      }
    } catch {
      const errorMessage = "Erreur de connexion. Veuillez réessayer.";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full max-w-sm">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Vérification par Code
        </h1>
        <p className="text-gray-500 text-sm">
          Un code a été envoyé à{" "}
          <strong className="text-gray-700">{userEmail}</strong>. Veuillez le
          saisir ci-dessous.
        </p>
      </div>

      <form className="mt-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="otp" className="block text-sm text-gray-600">
            Code de vérification (OTP)
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            autoComplete="one-time-code"
            placeholder="Saisir le code à 6 chiffres"
            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:ring-primary-500 focus:border-primary-500 focus:outline-none focus:ring focus:ring-opacity-40"
          />
        </div>

        {/* Display error message here */}
        {error && (
          <p className="mt-4 text-sm text-center text-red-600">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={onPreviousStep}
            className="px-6 py-2 text-sm font-medium tracking-wide text-gray-700 capitalize transition-colors duration-200 transform bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50"
          >
            Précédent
          </button>
          <button
            type="submit"
            disabled={isButtonDisabled}
            className="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <Spinner /> : "Vérifier"}
          </button>
        </div>
      </form>
    </section>
  );
}
