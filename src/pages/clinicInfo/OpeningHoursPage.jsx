import React, { useEffect, useState } from "react";
import { Bounce, toast } from "react-toastify";
import Swal from "sweetalert2";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import {
  getAllOpeningHours,
  registerOpeningHours,
  updateOpeningHours,
  deleteOpeningHours,
} from "../../services/cdiService";
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline, MdAdd, MdCheck, MdClose } from "react-icons/md";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

const DAY_ORDER = [
  "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE",
];
const DAY_FR = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};

const EMPTY_FORM = { day: "", openTime: "08:00", closeTime: "17:00", isClosed: false };

const JS_TO_ENUM = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];

function getNow() {
  const d = new Date();
  return {
    todayEnum: JS_TO_ENUM[d.getDay()],
    currentTime: d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0"),
  };
}

function isCurrentlyClosed(entry, now) {
  if (entry.isClosed) return true;
  if (entry.day === now.todayEnum && entry.closeTime && now.currentTime >= entry.closeTime) return true;
  return false;
}

export default function OpeningHoursPage() {
  const sidebarMargin = useSidebarMargin();
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(getNow());

  useEffect(() => {
    const id = setInterval(() => setNow(getNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  const fetchHours = () => {
    setLoading(true);
    getAllOpeningHours()
      .then((res) => {
        const sorted = [...(res.data || [])]
          .map((h) => ({ ...h, day: h.day?.toUpperCase() }))
          .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
        setHours(sorted);
      })
      .catch(() => toast.error("Erreur lors du chargement."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHours(); }, []);

  const availableDays = DAY_ORDER.filter(
    (d) => !hours.some((h) => h.day === d)
  );

  // ── Add ────────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!addForm.day) return toast.error("Veuillez sélectionner un jour.");
    setSaving(true);
    try {
      await registerOpeningHours(addForm);
      toast.success("Horaire ajouté.", { position: "top-center", autoClose: 2000, transition: Bounce });
      setShowAddForm(false);
      setAddForm(EMPTY_FORM);
      fetchHours();
    } catch {
      toast.error("Erreur lors de l'ajout.");
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditForm({ day: entry.day, openTime: entry.openTime, closeTime: entry.closeTime, isClosed: entry.isClosed });
  };

  const handleUpdate = async (id) => {
    setSaving(true);
    try {
      await updateOpeningHours(id, editForm);
      toast.success("Horaire mis à jour.", { position: "top-center", autoClose: 2000, transition: Bounce });
      setEditingId(null);
      fetchHours();
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cet horaire sera supprimé définitivement.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteOpeningHours(id);
      toast.success("Horaire supprimé.", { position: "top-center", autoClose: 2000, transition: Bounce });
      fetchHours();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const inputCls = "px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <SideBar2 />
      <div className="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>

      <main className={`h-full mt-14 ml-0 ${sidebarMargin} p-6`}>
        <div className="max-w-4xl mx-auto">
          {/* Page header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Heures d'ouverture</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez les horaires affichés sur le site public.</p>
            </div>
            {availableDays.length > 0 && !showAddForm && (
              <button
                onClick={() => { setShowAddForm(true); setAddForm({ ...EMPTY_FORM, day: availableDays[0] }); }}
                className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white text-sm font-medium rounded-lg hover:bg-primary-800 transition-colors cursor-pointer"
              >
                <MdAdd size={18} /> Ajouter
              </button>
            )}
          </div>

          {/* Add form */}
          {showAddForm && (
            <div className="mb-6 p-5 bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Nouvel horaire</h2>
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Jour</label>
                  <select
                    value={addForm.day}
                    onChange={(e) => setAddForm({ ...addForm, day: e.target.value })}
                    className={inputCls}
                  >
                    {availableDays.map((d) => (
                      <option key={d} value={d}>{DAY_FR[d]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ouverture</label>
                  <input type="time" value={addForm.openTime} onChange={(e) => setAddForm({ ...addForm, openTime: e.target.value })} className={inputCls} disabled={addForm.isClosed} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fermeture</label>
                  <input type="time" value={addForm.closeTime} onChange={(e) => setAddForm({ ...addForm, closeTime: e.target.value })} className={inputCls} disabled={addForm.isClosed} />
                </div>
                <div className="flex items-center gap-2 pb-1">
                  <input
                    type="checkbox"
                    id="add-closed"
                    checked={addForm.isClosed}
                    onChange={(e) => setAddForm({ ...addForm, isClosed: e.target.checked })}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <label htmlFor="add-closed" className="text-sm text-gray-700 dark:text-gray-300">Fermé</label>
                </div>
                <div className="flex gap-2 pb-1">
                  <button onClick={handleAdd} disabled={saving} className="flex items-center gap-1 px-4 py-1.5 bg-primary-700 text-white text-sm rounded-lg hover:bg-primary-800 disabled:opacity-60 cursor-pointer">
                    <MdCheck size={16} /> Enregistrer
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="flex items-center gap-1 px-4 py-1.5 border border-gray-300 dark:border-slate-600 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                    <MdClose size={16} /> Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-slate-700 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Chargement…</div>
            ) : hours.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Aucun horaire configuré.</div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Jour</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Ouverture</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Fermeture</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Statut</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {hours.map((entry) =>
                    editingId === entry.id ? (
                      <tr key={entry.id} className="bg-primary-50/50 dark:bg-primary-900/10">
                        <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
                          {DAY_FR[entry.day]}
                        </td>
                        <td className="px-5 py-3">
                          <input type="time" value={editForm.openTime} onChange={(e) => setEditForm({ ...editForm, openTime: e.target.value })} className={inputCls} disabled={editForm.isClosed} />
                        </td>
                        <td className="px-5 py-3">
                          <input type="time" value={editForm.closeTime} onChange={(e) => setEditForm({ ...editForm, closeTime: e.target.value })} className={inputCls} disabled={editForm.isClosed} />
                        </td>
                        <td className="px-5 py-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editForm.isClosed} onChange={(e) => setEditForm({ ...editForm, isClosed: e.target.checked })} className="w-4 h-4 accent-primary-600" />
                            <span className="text-gray-600 dark:text-gray-400">Fermé</span>
                          </label>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleUpdate(entry.id)} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-primary-700 text-white rounded-lg hover:bg-primary-800 disabled:opacity-60 cursor-pointer">
                              <MdCheck size={15} /> Sauvegarder
                            </button>
                            <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                              <MdClose size={15} /> Annuler
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
                          {DAY_FR[entry.day] || entry.day}
                        </td>
                        <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                          {entry.isClosed ? "—" : entry.openTime}
                        </td>
                        <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                          {entry.isClosed ? "—" : entry.closeTime}
                        </td>
                        <td className="px-5 py-3">
                          {isCurrentlyClosed(entry, now) ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Fermé</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">Ouvert</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => startEdit(entry)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors cursor-pointer">
                              <CiEdit size={18} />
                            </button>
                            <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer">
                              <MdDeleteOutline size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
