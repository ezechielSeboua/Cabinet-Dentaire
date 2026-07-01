import { useEffect, useState } from "react";
import { insurancePublic } from "../services/cdiService";

const ShieldCheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 flex-shrink-0 text-primary-500"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const EXCLUDED = ["NA", "NON ASSURE", "NON ASSURÉ", "UNDEFINED"];

export default function PublicInsurances() {
  const [all, setAll] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insurancePublic()
      .then((res) => {
        const sorted = (res.data || [])
          .filter((x) => !EXCLUDED.includes((x.insurance || "").trim().toUpperCase()))
          .sort((a, b) => a.insurance.localeCompare(b.insurance, "fr", { sensitivity: "base" }));
        setAll(sorted);
      })
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = query.trim()
    ? all.filter((x) => x.insurance.toLowerCase().includes(query.toLowerCase()))
    : all;

  return (
    <div className="text-center">
      {/* ── Header ── */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Assurances partenaires
      </h2>
      <p className="text-gray-500 text-sm sm:text-base mb-8">
        Nous collaborons avec les compagnies d'assurance suivantes.
      </p>

      {/* ── Search ── */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une assurance…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white text-gray-700 placeholder-gray-400 transition-all"
          />
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <p className="text-gray-400 py-8">
          {query ? `Aucune assurance trouvée pour « ${query} »` : "Aucune assurance disponible."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((item) => (
            <div
              key={item.id ?? item.insurance}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 hover:shadow-sm transition-all duration-200 text-left"
            >
              <ShieldCheckIcon />
              <span className="text-sm font-medium text-gray-700 leading-tight">
                {item.insurance}
              </span>
            </div>
          ))}
        </div>
      )}

      {visible.length > 0 && (
        <p className="mt-6 text-xs text-gray-400">
          {visible.length} assurance{visible.length > 1 ? "s" : ""} partenaire{visible.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
