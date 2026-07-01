import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { IoSearch } from "react-icons/io5";
import { MdSick, MdHistory } from "react-icons/md";
import * as cdiService from "../../services/cdiService";

const CustomLoader = () => (
  <div className="py-20 text-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
    <p className="mt-2 text-sm text-gray-500">Chargement des patients...</p>
  </div>
);

export default function PatientForTreatmentSelectionModal({
  isOpen,
  onClose,
  onPatientSelect,
  subtitle = "Choisissez un patient pour créer une nouvelle fiche de traitement.",
  actionLabel = "Assigner",
  ActionIcon = MdSick,
}) {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      cdiService
        .patientList()
        .then((res) => {
          const sortedData = res.data.sort((a, b) =>
            a.firstname.localeCompare(b.firstname)
          );
          setPatients(sortedData);
          setFilteredPatients(sortedData);
        })
        .catch((err) =>
          toast.error("Erreur: Impossible de charger les patients.")
        )
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      setFilteredPatients(patients);
      return;
    }
    const newData = patients.filter(
      (row) =>
        `${row.lastname} ${row.firstname}`
          .toLowerCase()
          .includes(searchTerm) ||
        row.patientno.toLowerCase().includes(searchTerm) ||
        row.telephone?.toLowerCase().includes(searchTerm) ||
        row.insurance?.toLowerCase().includes(searchTerm),
    );
    setFilteredPatients(newData);
  };

  const handleSelect = (patient) => {
    onPatientSelect(patient);
  };

  const columns = [
    {
      name: "Patient",
      selector: (row) => `${row.lastname} ${row.firstname}`,
      sortable: true,
      minWidth: "250px",
      cell: (row) => (
        <div>
          <div className="font-bold text-gray-800">{`${row.lastname} ${row.firstname}`}</div>
          <div className="text-xs text-gray-500">ID: {row.patientno}</div>
        </div>
      ),
    },
    { name: "Assurance 1", selector: (row) => row.insurance, sortable: true },
    {
      name: "Assurance 2",
      selector: (row) => row.insurance2 || "N/A",
      sortable: true,
    },
    {
      name: actionLabel,
      cell: (row) => (
        <button
          onClick={() => handleSelect(row)}
          className="text-primary-600 hover:text-primary-800 p-2 hover:bg-gray-200 rounded-full transition-colors"
          title={actionLabel}
        >
          <ActionIcon size={22} />
        </button>
      ),
      center: true,
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-transparent bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b dark:border-slate-600">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Sélectionner un Patient
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <DataTable
            columns={columns}
            data={filteredPatients}
            pagination
            progressPending={loading}
            progressComponent={<CustomLoader />}
            highlightOnHover
            subHeader
            subHeaderComponent={
              <div className="relative w-full md:w-1/3">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, ID, téléphone..."
                  className="w-full p-2 pl-10 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
                  onChange={handleSearch}
                />
              </div>
            }
            subHeaderAlign="right"
          />
        </div>
        <div className="p-4 bg-gray-100 dark:bg-slate-700 border-t dark:border-slate-600 text-right">
          <button
            onClick={onClose}
            className="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-500"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
