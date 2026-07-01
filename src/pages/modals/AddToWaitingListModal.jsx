import { useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { MdClose } from "react-icons/md";
import { FaUserClock } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { toast } from "react-toastify";
import * as cdiService from "../../services/cdiService";

const REASONS = [
  "Consultation",
  "Prothèse",
  "Rendez-vous",
  "Traitement",
  "Urgence",
  "Autre",
];

export default function AddToWaitingListModal({ isOpen, onClose, onSuccess }) {
  const [results, setResults] = useState([]);
  const [waitingNos, setWaitingNos] = useState(new Set());
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("Consultation");
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef(null);

  // On open: only fetch the (small) waiting list to know who's already there
  useEffect(() => {
    if (!isOpen) return;
    setSelected(null);
    setSearch("");
    setResults([]);
    setReason("Consultation");

    cdiService
      .getWaitingList()
      .then((res) => {
        setWaitingNos(new Set((res.data || []).map((w) => w.patientno)));
      })
      .catch(() => {});
  }, [isOpen]);

  // Server-side search triggered after 2+ characters, debounced 300 ms
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    setSelected(null);

    clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setLoadingPatients(false);
      return;
    }

    setLoadingPatients(true);
    debounceRef.current = setTimeout(() => {
      cdiService
        .patientListPaged(0, 30, value.trim())
        .then((res) => {
          const all = res.data?.content || [];
          setResults(all.filter((p) => !waitingNos.has(p.patientno)));
        })
        .catch(() => toast.error("Impossible de charger les patients."))
        .finally(() => setLoadingPatients(false));
    }, 150);
  };

  const handleSave = () => {
    if (!selected) {
      toast.warn("Veuillez sélectionner un patient.");
      return;
    }
    setSaving(true);
    cdiService
      .addToWaitingList({
        patientname: `${selected.lastname} ${selected.firstname}`,
        patientno: selected.patientno,
        reason,
      })
      .then(() => {
        toast.success(
          `${selected.lastname} ${selected.firstname} ajouté à la salle d'attente.`,
        );
        onSuccess();
      })
      .catch(() => toast.error("Erreur lors de l'ajout."))
      .finally(() => setSaving(false));
  };

  const showPrompt = search.trim().length < 2 && !loadingPatients;
  const showEmpty =
    !loadingPatients && search.trim().length >= 2 && results.length === 0;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-600">
            <div className="flex items-center gap-2">
              <FaUserClock className="text-primary-600" size={20} />
              <Dialog.Title className="text-lg font-semibold text-gray-800 dark:text-white">
                Ajouter à la salle d'attente
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Motif de la visite
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Patient search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rechercher un patient
              </label>
              <div className="relative">
                <IoSearch
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Tapez au moins 2 caractères..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Patient list */}
            <div className="border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
              {loadingPatients ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-primary-500" />
                </div>
              ) : showPrompt ? (
                <p className="text-sm text-center text-gray-400 dark:text-gray-500 py-8">
                  Tapez le nom, l'ID ou le téléphone du patient.
                </p>
              ) : showEmpty ? (
                <p className="text-sm text-center text-gray-400 dark:text-gray-500 py-8">
                  Aucun patient trouvé.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-slate-700 max-h-56 overflow-y-auto">
                  {results.map((p) => (
                    <li
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-4 ${
                        selected?.id === p.id
                          ? "bg-primary-50 dark:bg-primary-900/30 border-primary-600"
                          : "hover:bg-gray-50 dark:hover:bg-slate-700 border-transparent"
                      }`}
                    >
                      <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 dark:text-primary-300 text-sm font-semibold">
                          {p.firstname?.[0]}
                          {p.lastname?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          {p.lastname} {p.firstname}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          ID: {p.patientno} · {p.telephone}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Selected confirmation */}
            {selected && (
              <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
                <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {selected.firstname?.[0]}
                    {selected.lastname?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-800 dark:text-primary-200">
                    {selected.lastname} {selected.firstname}
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    ID: {selected.patientno} · Motif: {reason}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-gray-200 dark:border-slate-600 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!selected || saving}
              className="px-4 py-2 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium transition-colors"
            >
              {saving ? "Ajout..." : "Ajouter à la file"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
