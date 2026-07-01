import React, { useEffect, useState, useMemo } from "react";
import { MdDelete, MdAdd, MdMedicalServices } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { CgSpinner } from "react-icons/cg";
import { RiFileExcel2Line } from "react-icons/ri";
import { BiSearch } from "react-icons/bi";
import Swal from "sweetalert2";
import { Bounce, toast } from "react-toastify";
import {
  interventionList,
  deleteIntervention,
  addIntervention,
  updateIntervention,
  importInterventions,
} from "../../services/cdiService";
import InterventionModal from "../modals/InterventionModal";

export default function InterventionList() {
  const [interventions, setInterventions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentIntervention, setCurrentIntervention] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchInterventions = async () => {
    setIsLoading(true);
    try {
      const res = await interventionList();
      const sorted = [...res.data].sort((a, b) =>
        a.name.localeCompare(b.name, "fr", { sensitivity: "base" }),
      );
      setInterventions(sorted);
    } catch {
      toast.error("Impossible de charger les données.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setCurrentIntervention(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (intervention) => {
    setModalMode("edit");
    setCurrentIntervention(intervention);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentIntervention(null);
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const res = await importInterventions(file);
      toast.success(res.data.responseMessage, {
        position: "top-center",
        autoClose: 3000,
        theme: "light",
        transition: Bounce,
      });
      fetchInterventions();
    } catch {
      toast.error("Erreur lors de l'importation du fichier Excel.");
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  const handleSave = async (formData) => {
    try {
      if (modalMode === "add") {
        await addIntervention(formData);
        toast.success("Intervention ajoutée avec succès !", {
          position: "top-center",
          autoClose: 1500,
          theme: "light",
          transition: Bounce,
        });
      } else {
        await updateIntervention(currentIntervention.id, formData);
        toast.success("Intervention mise à jour avec succès !", {
          position: "top-center",
          autoClose: 1500,
          theme: "light",
          transition: Bounce,
        });
      }
      fetchInterventions();
      handleCloseModal();
    } catch {
      toast.error("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteIntervention(id)
          .then(() => {
            toast.success("Intervention supprimée avec succès.", {
              position: "top-center",
              autoClose: 2000,
              theme: "light",
              transition: Bounce,
            });
            fetchInterventions();
          })
          .catch(() => toast.error("Échec de la suppression."));
      }
    });
  };

  // Filter then group by first letter
  const grouped = useMemo(() => {
    const filtered = interventions.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return filtered.reduce((acc, item) => {
      const letter = item.name[0].toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(item);
      return acc;
    }, {});
  }, [interventions, searchQuery]);

  const totalFiltered = Object.values(grouped).flat().length;

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page header */}
        <div className="mb-6 bg-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <MdMedicalServices size={28} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  Actes & Interventions
                </h1>
                <p className="text-primary-100 text-sm mt-0.5">
                  {interventions.length} intervention
                  {interventions.length !== 1 ? "s" : ""} enregistrée
                  {interventions.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <label
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer ${
                  isImporting
                    ? "bg-white/70 text-primary-700/60 cursor-not-allowed"
                    : "bg-white text-primary-700 hover:bg-primary-50"
                }`}
                title="Importer depuis Excel"
              >
                {isImporting ? (
                  <CgSpinner className="animate-spin" size={17} />
                ) : (
                  <RiFileExcel2Line size={17} />
                )}
                {isImporting ? "Importation..." : "Importer Excel"}
                <input
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleImportExcel}
                  disabled={isImporting}
                />
              </label>
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white text-primary-700 rounded-xl hover:bg-primary-50 transition-all shadow-sm cursor-pointer"
              >
                <MdAdd size={18} />
                Nouvelle Intervention
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <BiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher une intervention..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {totalFiltered} résultat{totalFiltered !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <CgSpinner className="animate-spin text-primary-500" size={44} />
          </div>
        ) : interventions.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <MdMedicalServices size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">
              Aucune intervention enregistrée
            </p>
            <p className="text-sm mt-1">
              Ajoutez-en une ou importez un fichier Excel.
            </p>
          </div>
        ) : totalFiltered === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">
              Aucun résultat pour « {searchQuery} »
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(grouped)
              .sort()
              .map((letter) => (
                <div key={letter}>
                  {/* Letter divider */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                      {letter}
                    </div>
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {grouped[letter].length}
                    </span>
                  </div>

                  {/* Intervention rows */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {grouped[letter].map((item, idx) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between px-5 py-3.5 group hover:bg-primary-50 transition-colors ${
                          idx !== grouped[letter].length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <span className="text-sm text-gray-700 font-medium group-hover:text-primary-800 transition-colors">
                          {item.name.charAt(0).toUpperCase() +
                            item.name.slice(1)}
                        </span>
                        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <CiEdit size={17} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-rose-500 hover:bg-red-100 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <MdDelete size={17} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <InterventionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        mode={modalMode}
        intervention={currentIntervention}
      />
    </>
  );
}
