import  { useState } from "react";
import { API_URL } from "../../utils/config";
import { Bounce, toast } from "react-toastify";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Spinner from "../Spinner"; // Ensure this path is correct

export default function PasswordResetForm({
  onClose,
  onPreviousStep,
  userEmail,
  otp,
}) {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [repeatPasswordVisible, setRepeatPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordsMatch =
    password && repeatPassword && password === repeatPassword;
  const isButtonDisabled =
    !password || !repeatPassword || !passwordsMatch || isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_URL}/forgotPassword/resetPassword/${userEmail}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            repeatPassword,
            otp,
          }),
        }
      );

      if (res.ok) {
        toast.success("Votre mot de passe a été changé avec succès!", {
          position: "top-center",
          autoClose: 2000,
          theme: "light",
          transition: Bounce,
        });
        onClose(); // Close the modal on success
      } else {
        const data = await res.json();
        const errorMessage =
          data.message || "Une erreur s'est produite! Échec du processus.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch {
      const errorMessage =
        "Erreur de connexion. Veuillez vérifier votre réseau et réessayer.";
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
          Créez votre nouveau mot de passe
        </h1>
        <p className="text-gray-500 text-sm">
          Assurez-vous que vos mots de passe correspondent.
        </p>
      </div>

      <form className="mt-6" onSubmit={handleSubmit}>
        {/* New Password Input */}
        <div className="relative">
          <label htmlFor="password" className="block text-sm text-gray-600">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:ring-primary-500 focus:border-primary-500 focus:outline-none focus:ring focus:ring-opacity-40"
            placeholder="********"
          />
          <span
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </span>
        </div>

        {/* Repeat Password Input */}
        <div className="relative mt-4">
          <label
            htmlFor="repeatPassword"
            className="block text-sm text-gray-600"
          >
            Répétez le mot de passe
          </label>
          <input
            id="repeatPassword"
            name="repeatPassword"
            type={repeatPasswordVisible ? "text" : "password"}
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className={`block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md focus:outline-none focus:ring focus:ring-opacity-40 ${
              repeatPassword && !passwordsMatch
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:border-primary-500 focus:ring-primary-500"
            }`}
            placeholder="********"
          />
          <span
            className="absolute right-3 top-9 cursor-pointer text-gray-500"
            onClick={() => setRepeatPasswordVisible(!repeatPasswordVisible)}
          >
            {repeatPasswordVisible ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </span>
        </div>

        {/* Mismatch Error Message */}
        {repeatPassword && !passwordsMatch && (
          <p className="mt-1 text-xs text-red-500">
            Les mots de passe ne correspondent pas.
          </p>
        )}

        {/* General Error Message */}
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
            {isLoading ? <Spinner /> : "Confirmer le changement"}
          </button>
        </div>
      </form>
    </section>
  );
}
