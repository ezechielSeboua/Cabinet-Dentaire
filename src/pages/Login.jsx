import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Bounce, toast } from "react-toastify";
import PasswordResetModal from "./modals/PasswordResetModal";
import { clinicPublic } from "../services/cdiService";
import { normalizeFileUrl } from "../utils/config";
import backgroundImage from "../assets/dental-clinic-renovation.jpeg";

// ── Mascotte dent interactive ────────────────────────────────────────────────
function ToothMascot({ focus, showPassword, formValid }) {
  // Pupilles : bougent selon le champ actif
  const pupilOffset = focus === "email"
    ? { x: 0, y: 4 }
    : focus === "password"
    ? { x: 1, y: 5 }
    : { x: 0, y: 0 };

  // Yeux : fermés si mot de passe VISIBLE (la dent détourne pudiquement le regard)
  const eyesClosed = showPassword;

  return (
    <svg
      viewBox="0 0 100 130"
      width="110"
      height="130"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 4px 12px rgba(190,24,93,0.18))", overflow: "visible" }}
      aria-hidden="true"
    >
      {/* ── Corps de la dent ── */}
      <path
        d="
          M 28,8
          Q 28,0 36,0
          Q 44,0 44,8
          Q 44,0 56,0
          Q 64,0 64,8
          Q 68,6 72,14
          Q 76,22 74,34
          L 68,82
          Q 66,92 50,92
          Q 34,92 32,82
          L 26,34
          Q 24,22 28,14
          Z
        "
        fill="#ffffff"
        stroke="#fce7f3"
        strokeWidth="1.5"
      />

      {/* Léger trait de séparation des deux cusps */}
      <line x1="50" y1="0" x2="50" y2="18" stroke="#fce7f3" strokeWidth="1" />

      {/* ── Rougeurs (joues) ── */}
      <ellipse cx="36" cy="56" rx="7" ry="4.5" fill="rgba(244,114,182,0.18)" />
      <ellipse cx="64" cy="56" rx="7" ry="4.5" fill="rgba(244,114,182,0.18)" />

      {/* ── Oeil gauche ── */}
      <g>
        {eyesClosed ? (
          /* Oeil fermé : arc/ligne */
          <path
            d="M 36,42 Q 39,45 42,42"
            stroke="#9d174d"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            style={{ transition: "all 0.4s ease" }}
          />
        ) : (
          <>
            <circle cx="39" cy="42" r="5" fill="#9d174d" style={{ transition: "all 0.4s ease" }} />
            <circle
              cx={39 + pupilOffset.x}
              cy={42 + pupilOffset.y}
              r="2.2"
              fill="#fff"
              style={{ transition: "cx 0.5s ease, cy 0.5s ease" }}
            />
          </>
        )}
      </g>

      {/* ── Oeil droit ── */}
      <g>
        {eyesClosed ? (
          <path
            d="M 58,42 Q 61,45 64,42"
            stroke="#9d174d"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            style={{ transition: "all 0.4s ease" }}
          />
        ) : (
          <>
            <circle cx="61" cy="42" r="5" fill="#9d174d" style={{ transition: "all 0.4s ease" }} />
            <circle
              cx={61 + pupilOffset.x}
              cy={42 + pupilOffset.y}
              r="2.2"
              fill="#fff"
              style={{ transition: "cx 0.5s ease, cy 0.5s ease" }}
            />
          </>
        )}
      </g>

      {/* ── Bouche ── */}
      {formValid ? (
        /* Grand sourire */
        <path
          d="M 39,63 Q 50,74 61,63"
          stroke="#be185d"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          style={{ transition: "all 0.4s ease" }}
        />
      ) : (
        /* Sourire neutre */
        <path
          d="M 42,65 Q 50,71 58,65"
          stroke="#be185d"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          style={{ transition: "all 0.4s ease" }}
        />
      )}
    </svg>
  );
}

// ── Page Login ───────────────────────────────────────────────────────────────
export default function Login() {
  const [username, setUsername]       = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focus, setFocus]             = useState(null); // "email" | "password" | null
  const [isLoading, setIsLoading]     = useState(false);
  const [loginError, setLoginError]   = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clinicData, setClinicData]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    clinicPublic().then((res) => { if (res.data) setClinicData(res.data); }).catch(() => {});
  }, []);

  const formValid = username.trim() !== "" && password.trim() !== "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    try {
      await authService.login(username.toLowerCase(), password);
      toast.success("Connexion réussie !", {
        position: "top-right",
        autoClose: 1500,
        theme: "light",
        transition: Bounce,
      });
      navigate("/dashboardwelcome");
    } catch {
      setLoginError("Email ou mot de passe incorrect. Veuillez réessayer.");
      toast.error("Identifiants incorrects.", {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const bgUrl = clinicData?.backgroundimage
    ? normalizeFileUrl(clinicData.backgroundimage)
    : backgroundImage;

  return (
    <>
      {/* ── Fond ── */}
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        <div className="absolute inset-0 bg-black/30" />

        {/* ── Card ── */}
        <div className="relative z-10 w-full max-w-sm">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">

            {/* Bande de couleur en haut */}
            <div className="h-1.5 bg-primary-600" />

            <div className="px-8 pt-8 pb-10">

              {/* ── Mascotte + identité ── */}
              <div className="flex flex-col items-center gap-3 mb-7">
                <ToothMascot
                  focus={focus}
                  showPassword={showPassword}
                  formValid={formValid}
                />
                {/* Logo de la clinique (discret, sous la dent) */}
                {/* {clinicData?.logo && (
                  <img
                    src={normalizeFileUrl(clinicData.logo)}
                    alt="Logo"
                    className="h-8 w-auto object-contain opacity-70"
                  />
                )} */}
                <div className="text-center">
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    Bienvenue de retour&nbsp;!
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {clinicData?.name || "Cabinet Dentaire"} — espace personnel
                  </p>
                </div>
              </div>

              {/* ── Formulaire ── */}
              <form className="space-y-4" onSubmit={handleLogin} noValidate>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="votre@email.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocus("email")}
                    onBlur={() => setFocus(null)}
                    className="w-full px-4 py-2.5 text-sm text-gray-800 bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                    style={{
                      borderColor: focus === "email" ? "#f472b6" : "#e5e7eb",
                    }}
                  />
                </div>

                {/* Mot de passe */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline"
                    >
                      Oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocus("password")}
                      onBlur={() => setFocus(null)}
                      className="w-full px-4 py-2.5 pr-11 text-sm text-gray-800 bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                      style={{
                        borderColor: focus === "password" ? "#f472b6" : "#e5e7eb",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Masquer" : "Afficher"}
                      className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Erreur */}
                {loginError && (
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg">
                    <span className="text-red-500 font-bold text-sm mt-px flex-shrink-0">!</span>
                    <p className="text-xs text-red-600 leading-relaxed">{loginError}</p>
                  </div>
                )}

                {/* Bouton */}
                <button
                  type="submit"
                  disabled={!formValid || isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 shadow-md shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading
                    ? <><Loader2 size={16} className="animate-spin" /> Connexion…</>
                    : "Se connecter"
                  }
                </button>
              </form>

              {/* ── Retour au site public ── */}
              <div className="mt-6 text-center">
                <a
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <ArrowLeft size={13} />
                  Retour au site
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>

      <PasswordResetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
