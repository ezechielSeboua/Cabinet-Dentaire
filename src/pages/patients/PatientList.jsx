import React, { useEffect, useState, useCallback, useRef } from "react";
import { MdAdd, MdSearch } from "react-icons/md";
import { GrInfo } from "react-icons/gr";
import { CiEdit } from "react-icons/ci";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { Bounce, toast } from "react-toastify";

// Services
import {
  deletePatient,
  patientListPaged,
  getLatestPatient,
} from "../../services/cdiService";

// Modal Components
import NewPatientModal from "../modals/NewPatientModal";
import ImageUploadModal from "../modals/ImageUploadModal";
import PatientDetailModal from "../modals/PatientDetailModal";

const ExpandedComponent = ({ data }) => {
  // ... (Le code du ExpandedComponent de la réponse précédente reste inchangé)
  const hasValidInsurance1 =
    data.insurance &&
    data.insurance !== "NA" &&
    data.insurance !== "NON ASSURE";
  const hasValidInsurance2 =
    data.insurance2 &&
    data.insurance2 !== "NA" &&
    data.insurance2 !== "NON ASSURE";

  return (
    <div className="p-4 bg-slate-50 border-l-4 border-slate-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasValidInsurance1 && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-base font-bold text-primary-800 mb-3 border-b pb-2">
              Assurance Principale
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Compagnie :</span>
                <span className="font-semibold text-gray-800">
                  {data.insurance}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Matricule :</span>
                <span className="font-semibold text-gray-800">
                  {data.insurance_matricule &&
                  data.insurance_matricule !== "NA" ? (
                    data.insurance_matricule.toUpperCase()
                  ) : (
                    <span className="text-gray-400 italic">Non renseigné</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Couverture :</span>
                <span className="font-semibold text-green-600">
                  {data.insurance_pourcentage ? (
                    `${data.insurance_pourcentage}%`
                  ) : (
                    <span className="text-gray-400 italic">N/A</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
        {hasValidInsurance2 && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-base font-bold text-purple-800 mb-3 border-b pb-2">
              Assurance Secondaire
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Compagnie :</span>
                <span className="font-semibold text-gray-800">
                  {data.insurance2}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Matricule :</span>
                <span className="font-semibold text-gray-800">
                  {data.insurance2_matricule &&
                  data.insurance2_matricule !== "NA" ? (
                    data.insurance2_matricule.toUpperCase()
                  ) : (
                    <span className="text-gray-400 italic">Non renseigné</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Couverture :</span>
                <span className="font-semibold text-green-600">
                  {data.insurance2_pourcentage ? (
                    `${data.insurance2_pourcentage}%`
                  ) : (
                    <span className="text-gray-400 italic">N/A</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastPatient, setLastPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // State for All Modals
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [patientForImageUpload, setPatientForImageUpload] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingPatientId, setViewingPatientId] = useState(null);

  // Modal Trigger Functions
  const handleViewDetails = (patientId) => {
    setViewingPatientId(patientId);
    setIsDetailModalOpen(true);
  };
  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setIsPatientModalOpen(true);
  };
  const handleCreate = () => {
    setEditingPatient(null);
    setIsPatientModalOpen(true);
  };

  // Toast Notifications
  const showSuccessToast = (message) =>
    toast.success(message, {
      transition: Bounce,
      autoClose: 1000,
      position: "top-center",
    });
  const showErrorToast = (message) =>
    toast.error(message, {
      transition: Bounce,
      autoClose: 1000,
      position: "top-center",
    });
  const showInfoToast = (message) =>
    toast.info(message, {
      transition: Bounce,
      autoClose: 1000,
      position: "top-center",
    });

  // Helper function to check if an insurance value is valid
  const isInsuranceValid = (insurance) => {
    return (
      insurance &&
      insurance !== "NA" &&
      insurance !== "NON ASSURE" &&
      insurance !== "NON ASSURÉ"
    );
  };

  const columns = [
    {
      name: <span className="font-semibold">PATIENT</span>,
      selector: (row) => `${row.lastname} ${row.firstname}`,
      sortable: true,
      minWidth: "230px",
      cell: (row) => (
        <span>
          <div className="font-semibold text-primary-600">{`${row.lastname} ${row.firstname}`}</div>
          <div className="text-sm text-gray-500">N° {row.patientno}</div>
        </span>
      ),
    },
    {
      name: <span className="font-semibold">TÉLÉPHONE</span>,
      selector: (row) => row?.telephone || "Non renseigné",
      sortable: true,
      minWidth: "90px",
      cell: (row) => (
        <span className="text-gray-600 text-sm">
          {row?.telephone || (
            <span className="text-gray-400 italic">Non renseigné</span>
          )}
        </span>
      ),
    },
    // =============================================================
    //  NOUVELLE COLONNE POUR LE STATUT D'ASSURANCE
    // =============================================================
    {
      name: <span className="font-semibold">STATUT ASSURANCE</span>,
      sortable: true,
      minWidth: "120px",
      selector: (row) =>
        isInsuranceValid(row.insurance) || isInsuranceValid(row.insurance2)
          ? "Assuré"
          : "Non Assuré",
      cell: (row) => {
        const isInsured =
          isInsuranceValid(row.insurance) || isInsuranceValid(row.insurance2);
        return (
          <span
            className={`px-3 py-1 text-xs font-semibold leading-5 rounded-full ${
              isInsured
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isInsured ? "ASSURÉ" : "NON ASSURÉ"}
          </span>
        );
      },
    },

    {
      name: <span className="font-semibold">ACTIONS</span>,
      width: "140px",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="flex items-center  cursor-pointer justify-center w-8 h-8 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100"
            title="Modifier"
          >
            <CiEdit size={18} />
          </button>
          <button
            onClick={() => handleViewDetails(row.id)}
            className="flex items-center  cursor-pointer justify-center w-8 h-8 bg-gray-100 text-yellow-400 rounded-full hover:bg-gray-200"
            title="Voir les détails"
          >
            <GrInfo size={20} />
          </button>
          {/* <button
            onClick={() => handleDelete(row.id)}
            className="flex items-center cursor-pointer justify-center w-8 h-8 bg-red-50 text-rose-500 rounded-full hover:bg-rose-100"
            title="Supprimer"
          >
            <MdDelete size={18} />
          </button> */}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const fetchPatients = useCallback((pageIndex, size, search) => {
    setLoading(true);
    patientListPaged(pageIndex, size, search)
      .then((res) => {
        setPatients(res.data.content || []);
        setTotalRows(res.data.totalElements || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (patientId) => {
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Vous ne pourrez pas annuler cette opération!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer!",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        deletePatient(patientId)
          .then(() => {
            fetchPatients(page, pageSize, searchTerm);
            showSuccessToast("Patient supprimé avec succès");
          })
          .catch(() =>
            showErrorToast("Erreur lors de la suppression du patient"),
          );
      }
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      fetchPatients(0, pageSize, value);
    }, 400);
  };

  const handlePageChange = (newPage) => {
    const idx = newPage - 1;
    setPage(idx);
    fetchPatients(idx, pageSize, searchTerm);
  };

  const handleRowsPerPageChange = (newSize) => {
    setPageSize(newSize);
    setPage(0);
    fetchPatients(0, newSize, searchTerm);
  };

  useEffect(() => {
    fetchPatients(0, pageSize, "");
    getLatestPatient()
      .then((res) => setLastPatient(res.data))
      .catch(console.error);
  }, [fetchPatients]);

  const handlePatientSaveSuccess = (result) => {
    setIsPatientModalOpen(false);
    fetchPatients(page, pageSize, searchTerm);
    if (result.isNew) {
      showInfoToast("Récupération des informations du nouveau patient...");
      getLatestPatient()
        .then((response) => {
          setLastPatient(response.data);
          setPatientForImageUpload(response.data);
          setIsImageModalOpen(true);
        })
        .catch((error) => {
          console.error("Failed to get latest patient:", error);
          showErrorToast(
            "Erreur critique: impossible de récupérer le nouveau patient.",
          );
        });
    }
  };

  const handleImageUploadSuccess = () => {
    setIsImageModalOpen(false);
    setPatientForImageUpload(null);
    fetchPatients(page, pageSize, searchTerm);
  };

  const handleDetailUpdate = () => {
    fetchPatients(page, pageSize, searchTerm);
  };

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f8fafc",
        borderTop: "1px solid #e2e8f0",
        borderBottom: "2px solid #e2e8f0",
      },
    },
    headCells: {
      style: {
        color: "#4a5568",
        fontWeight: "600",
        fontSize: "0.75rem",
        padding: "0.75rem 1rem",
      },
    },
    cells: { style: { padding: "0.5rem 1rem", fontSize: "0.875rem" } },
    rows: {
      style: {
        minHeight: "60px",
        backgroundColor: "#ffffff",
        "&:not(:last-of-type)": { borderBottom: "1px solid #edf2f7" },
        "&:hover": { backgroundColor: "#f7fafc" },
      },
    },
    pagination: { style: { borderTop: "1px solid #e2e8f0" } },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Liste des Patients
              </h2>
              {lastPatient && (
                <p className="mt-1 text-sm text-gray-500">
                  Dernier ajouté:{" "}
                  <span className="font-semibold text-primary-600">{`${lastPatient.lastname} ${lastPatient.firstname} (${lastPatient.patientno})`}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full sm:w-80 bg-gray-50 border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Rechercher un patient..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <button
                onClick={handleCreate}
                className="inline-flex items-center cursor-pointer justify-center gap-2 px-4 py-2 bg-primary-700 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-primary-800 transition-all focus:outline-none focus:ring-2 focus:ring-gray-100 focus:ring-offset-2"
              >
                <MdAdd size={20} />
                <span>Nouveau Patient</span>
              </button>
            </div>
          </div>
          <div>
            <DataTable
              columns={columns}
              data={patients}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handleRowsPerPageChange}
              paginationPerPage={pageSize}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              paginationComponentOptions={{
                rowsPerPageText: "Lignes par page:",
                rangeSeparatorText: "sur",
              }}
              fixedHeader
              fixedHeaderScrollHeight="calc(100vh - 300px)"
              highlightOnHover
              customStyles={customStyles}
              progressPending={loading}
              progressComponent={
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              }
              noDataComponent={
                <div className="py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    Aucun patient trouvé
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Cliquez sur "Nouveau Patient" pour en ajouter un.
                  </p>
                </div>
              }
              responsive
              expandableRows
              expandableRowsComponent={ExpandedComponent}
              expandableRowDisabled={(row) =>
                !isInsuranceValid(row.insurance) &&
                !isInsuranceValid(row.insurance2)
              }
            />
          </div>
        </div>
      </div>

      {/* --- Render ALL Modals --- */}
      <PatientDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        patientId={viewingPatientId}
        onUpdate={handleDetailUpdate}
      />
      <NewPatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={handlePatientSaveSuccess}
        patientToEdit={editingPatient}
      />
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSuccess={handleImageUploadSuccess}
        patient={patientForImageUpload}
      />
    </div>
  );
}
