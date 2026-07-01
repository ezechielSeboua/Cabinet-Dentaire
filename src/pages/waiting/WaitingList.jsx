import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { MdAdd, MdRefresh } from "react-icons/md";
import { FaUserClock } from "react-icons/fa";
import Swal from "sweetalert2";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";
import AddToWaitingListModal from "../modals/AddToWaitingListModal";
import { getWaitingList, removeFromWaitingList } from "../../services/cdiService";

const reasonColors = {
  Traitement:    "bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900/40 dark:text-primary-300 dark:border-primary-700",
  "Rendez-vous": "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
  Consultation:  "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  Urgence:       "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700",
  Autre:         "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
};

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}min`;
}

export default function WaitingList() {
  const sidebarMargin = useSidebarMargin();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchList = useCallback(() => {
    getWaitingList()
      .then((res) => setList(res.data || []))
      .catch(() => toast.error("Impossible de charger la salle d'attente."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchList();
    // Refresh every 30 s to reflect changes from other workstations
    const interval = setInterval(fetchList, 30000);
    return () => clearInterval(interval);
  }, [fetchList]);

  const handleCall = (entry) => {
    Swal.fire({
      title: `Appeler ${entry.patientname} ?`,
      text: "Ce patient sera retiré de la salle d'attente.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#be185d",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, appeler",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (!result.isConfirmed) return;
      removeFromWaitingList(entry.id)
        .then(() => {
          toast.success(`${entry.patientname} retiré de la salle d'attente.`);
          fetchList();
        })
        .catch(() => toast.error("Erreur lors du retrait."));
    });
  };

  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white">
      <SideBar2 />
      <div className="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>

      <main className={`h-full ml-0 mt-14 mb-10 ${sidebarMargin} p-4 md:p-8`}>
        {/* Page header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FaUserClock className="text-primary-600" />
              Salle d'attente
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {loading
                ? "Chargement..."
                : list.length === 0
                ? "Aucun patient en attente"
                : `${list.length} patient${list.length > 1 ? "s" : ""} en attente`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchList}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <MdRefresh size={16} />
              Actualiser
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors shadow-sm"
            >
              <MdAdd size={18} />
              Ajouter un patient
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-gray-500">
            <FaUserClock size={64} className="mb-4 opacity-25" />
            <p className="text-lg font-medium">Salle d'attente vide</p>
            <p className="text-sm mt-1">
              Cliquez sur "Ajouter un patient" lorsqu'un patient arrive.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-5 flex gap-4 items-start"
              >
                {/* Queue position badge */}
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold shadow">
                  {entry.position}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name + reason */}
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white truncate">
                        {entry.patientname}
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-500">
                        ID: {entry.patientno}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${
                        reasonColors[entry.reason] || reasonColors["Autre"]
                      }`}
                    >
                      {entry.reason}
                    </span>
                  </div>

                  {/* Arrival time */}
                  <p className="text-xs text-red-500 dark:text-gray-500 mt-1">
                    Arrivée il y a {timeAgo(entry.arrivaltime)}
                    {" · "}
                    {new Date(entry.arrivaltime).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* Call button */}
                  <button
                    onClick={() => handleCall(entry)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
                  >
                    <FaUserClock size={14} />
                    Appeler ce patient
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AddToWaitingListModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchList();
        }}
      />
    </div>
  );
}
