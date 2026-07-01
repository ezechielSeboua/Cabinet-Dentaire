import { useState } from "react";
import { API_URL } from "../../utils/config";
import { Bounce, toast } from "react-toastify";
import Spinner from "../Spinner";

export default function ForgotPasswordForm({ onNextStep }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTouched, setIsTouched] = useState(false); // Track if the input has been touched

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear previous errors
    try {
      const res = await fetch(`${API_URL}/forgotPassword/verityEmail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        onNextStep(email);
        toast.success(
          "Veuillez saisir le code (mot de passe à usage unique (OTP)) reçu par email",
          {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
            transition: Bounce,
          }
        );
      } else {
        const errorData = await res.json();
        const errorMessage =
          errorData.message || "Adresse électronique introuvable";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          transition: Bounce,
        });
      }
    } catch (err) {
      const errorMessage = "Une erreur de réseau s'est produite.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = () => {
    setIsTouched(true); // Set touched to true when the user clicks away
  };

  const isEmailEmpty = !email && isTouched;

  return (
    <section className="w-full max-w-sm">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          Mot de passe oublié?
        </h1>
        <p className="text-gray-500 text-sm">
          Veuillez entrer votre adresse email pour recevoir un code de
          vérification.
        </p>
      </div>

      <form className="mt-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm text-gray-600">
            Adresse Email / nom d'utilisateur
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleBlur} // Check for touch status on blur
            autoComplete="email"
            placeholder="votre.email@exemple.com"
            className={`block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:ring-primary-500 focus:border-primary-500 focus:outline-none focus:ring focus:ring-opacity-40 ${
              isEmailEmpty ? "border-red-500" : "border-gray-200"
            }`}
          />
          {isEmailEmpty && (
            <p className="mt-1 text-xs text-red-500">
              L'adresse email est requise.
            </p>
          )}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={!email || isLoading}
            className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-primary-700 rounded-md hover:bg-primary-800 focus:outline-none focus:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <Spinner /> : "Envoyer le code de vérification"}
          </button>
        </div>
      </form>
      {error && (
        <p className="mt-4 text-sm text-center text-red-600">{error}</p>
      )}
    </section>
  );
}
