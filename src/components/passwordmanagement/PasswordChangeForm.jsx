import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/config";
import { toast } from "react-toastify";
import * as authService from "../../services/authService";
import { AuthHeader } from "../../utils/authHeader";
import { FaEye, FaEyeSlash, FaLock, FaCheckCircle } from "react-icons/fa";
import { MdCheckCircle, MdCancel } from "react-icons/md";

const REQUIREMENTS = [
  { label: "8 caractères minimum", test: (p) => p.length >= 8 },
  { label: "Une lettre minuscule", test: (p) => /[a-z]/.test(p) },
  { label: "Une lettre majuscule", test: (p) => /[A-Z]/.test(p) },
  { label: "Un chiffre", test: (p) => /[0-9]/.test(p) },
  { label: "Un caractère spécial ($@#&!)", test: (p) => /[$@#&!]/.test(p) },
];

const STRENGTH_LABELS = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];
const STRENGTH_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-primary-500",
  "bg-green-500",
];

export default function PasswordChangeForm() {
  const [currentUser] = useState(authService.getCurrentUser());
  const navigate = useNavigate();
  const userEmail = currentUser?.body?.email;

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      navigate("/login", { replace: true });
    }
  }, [userEmail, navigate]);

  const passedRequirements = REQUIREMENTS.map((r) => r.test(password));
  const passwordStrength = passedRequirements.filter(Boolean).length;
  const repeatTouched = repeatPassword.length > 0;
  const passwordsMatch = repeatTouched && password === repeatPassword;
  const passwordsMismatch = repeatTouched && password !== repeatPassword;
  const isFormValid =
    password && repeatPassword && passwordsMatch && passwordStrength === REQUIREMENTS.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== repeatPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (passwordStrength < REQUIREMENTS.length) {
      setError("Le mot de passe ne respecte pas toutes les exigences ci-dessous.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/forgotPassword/changePassword/${userEmail}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...AuthHeader(),
          },
          body: JSON.stringify({
            password,
            repeatPassword,
          }),
        }
      );
      if (res.ok) {
        toast.success("Mot de passe modifié avec succès !");
        setPassword("");
        setRepeatPassword("");
        setTimeout(() => {
          navigate("/dashboardwelcome");
        }, 1500);
      } else {
        let message = "Une erreur s'est produite. Veuillez réessayer.";
        try {
          const data = await res.json();
          message = data?.message || message;
        } catch {
          // response body wasn't JSON — keep default message
        }
        setError(message);
        toast.error(message);
      }
    } catch {
      const message = "Erreur de connexion. Veuillez vérifier votre réseau et réessayer.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userEmail) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-8 sm:mt-16">
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
            <FaLock className="text-primary-600 dark:text-primary-300" size={16} />
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            Modifier le mot de passe
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 ml-[52px]">
          Connecté en tant que <span className="font-medium">{userEmail}</span>
        </p>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* New password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                className="w-full px-4 py-2.5 pr-11 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {password && (
              <>
                <div className="flex gap-1 mt-2">
                  {REQUIREMENTS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i < passwordStrength
                          ? STRENGTH_COLORS[passwordStrength - 1]
                          : "bg-gray-200 dark:bg-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Robustesse : {STRENGTH_LABELS[passwordStrength - 1] || STRENGTH_LABELS[0]}
                </p>

                <ul className="mt-3 space-y-1">
                  {REQUIREMENTS.map((req, i) => (
                    <li
                      key={req.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        passedRequirements[i]
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {passedRequirements[i] ? (
                        <MdCheckCircle size={14} className="shrink-0" />
                      ) : (
                        <MdCancel size={14} className="shrink-0" />
                      )}
                      {req.label}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label
              htmlFor="repeatPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                id="repeatPassword"
                className={`w-full px-4 py-2.5 pr-11 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-slate-700 border rounded-lg focus:outline-none focus:ring-2 ${
                  passwordsMismatch
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 dark:border-slate-600 focus:ring-primary-500"
                }`}
                placeholder="••••••••"
                name="repeatPassword"
                type={showRepeatPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label={showRepeatPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordsMismatch && (
              <p className="mt-1.5 text-xs text-red-500">
                Les mots de passe ne correspondent pas.
              </p>
            )}
            {passwordsMatch && (
              <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <FaCheckCircle size={12} /> Les mots de passe correspondent.
              </p>
            )}
          </div>

          {error && (
            <div className="text-sm text-center text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 cursor-pointer font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 cursor-pointer font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Modification…
                </>
              ) : (
                "Confirmer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
