import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  MdDelete,
  MdPrint,
  MdSearch,
  MdEdit,
  MdCheckCircle,
  MdAddCircleOutline,
  MdToday,
  MdDateRange,
  MdHistory,
  MdRefresh,
} from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";

import {
  docTreatments,
  allTreatmentsPaged,
  deleteTreatment,
  updateTreatmentPaymentStatus,
} from "../../services/cdiService";
import { getCurrentUser } from "../../services/authService";
import PatientForTreatmentSelectionModal from "../modals/PatientForTreatmentSelectionModal";
import NewTreatmentModal from "../modals/NewTreatmentModal";
import CustomNoDataComponent from "../../components/Common/CustomNoDataComponent";

// --- Reusable UI Components ---
const CustomLoader = () => (
  <div className="py-10 text-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
  </div>
);

const formatDateTime = (isoString) => {
  if (!isoString) return { date: "N/A", time: "" };
  try {
    const dateObj = new Date(isoString);
    if (isNaN(dateObj)) return { date: "Date invalide", time: "" };
    const date = dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = dateObj.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date, time };
  } catch {
    return { date: "Date invalide", time: "" };
  }
};

// --- Expanded Component for Interventions and Insurance ---
const ExpandedComponent = ({ data }) => {
  const nonAssuredValues = ["NA", "NON ASSURE", "NON ASSURÉ", "UNDEFINED"];
  const insurances = [];

  if (
    data.insurance &&
    !nonAssuredValues.includes(data.insurance.toUpperCase()) &&
    data.partinsurance > 0
  ) {
    insurances.push({ name: data.insurance, amount: data.partinsurance });
  }
  if (
    data.insurance2 &&
    !nonAssuredValues.includes(data.insurance2.toUpperCase()) &&
    data.partinsurance2 > 0
  ) {
    insurances.push({ name: data.insurance2, amount: data.partinsurance2 });
  }

  const hasInterventions =
    Array.isArray(data.interventions) && data.interventions.length > 0;
  const hasTeeth = Array.isArray(data.teeth) && data.teeth.length > 0;

  const sortedTeeth = hasTeeth
    ? [...data.teeth].map(String).sort((a, b) => Number(a) - Number(b))
    : [];

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50">
      {/* Interventions Section */}
      <div>
        <h4 className="font-bold text-md text-gray-700 mb-2">
          Détails des Interventions :
        </h4>
        {hasInterventions ? (
          <ul className="list-disc list-inside pl-4 space-y-1 text-gray-600">
            {data.interventions.map((intervention, index) => (
              <li key={index}>{intervention}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Aucune intervention enregistrée.</p>
        )}
      </div>

      {/* Insurance Section */}
      <div>
        <h4 className="font-bold text-md text-gray-700 mb-2">
          Détails des Assurances :
        </h4>
        {insurances.length > 0 ? (
          <div className="space-y-2">
            {insurances.map(({ name, amount }, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm p-2 rounded-md bg-primary-50"
              >
                <span className="font-semibold text-primary-800">{name}:</span>
                <span className="font-mono text-primary-900 font-bold">
                  {amount.toLocaleString("fr-FR")} F CFA
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucune assurance associée.</p>
        )}
      </div>

      {/* Teeth Section */}
      <div className="md:col-span-2">
        <h4 className="font-bold text-md text-gray-700 dark:text-gray-200 mb-2">
          Dents traitées :
        </h4>
        {hasTeeth ? (
          <div className="flex flex-wrap gap-1.5">
            {sortedTeeth.map((t) => (
              <span
                key={t}
                className="inline-flex items-center justify-center w-9 h-9 text-xs font-bold rounded border-2 bg-primary-600 border-primary-700 text-white shadow-sm"
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Aucune dent sélectionnée.
          </p>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---
export default function TreatmentList() {
  const navigate = useNavigate();
  const [currentUser] = useState(getCurrentUser());
  const [treatments, setTreatments] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [selectedPatientForTreatment, setSelectedPatientForTreatment] =
    useState(null);
  const [editingTreatment, setEditingTreatment] = useState(null);
  // No UI control currently sets this (the cashier doctor-picker was removed);
  // kept as `null` so the existing ADMIN/CASHIER fetch branches stay intact.
  const [selectedDoctorForCashier] = useState(null);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const firstOfMonthStr = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  }, []);
  const [dateRange, setDateRange] = useState({
    start: firstOfMonthStr,
    end: todayStr,
  });

  const userRole = useMemo(
    () => currentUser?.body?.roles[0]?.toString(),
    [currentUser],
  );


  const fetchTreatments = () => {
    setLoading(true);

    let apiCall;
    if (userRole === "DOCTOR") {
      apiCall = docTreatments(currentUser.body.email);
    } else if (
      ["CASHIER", "ACCOUNTANT"].includes(userRole) &&
      selectedDoctorForCashier
    ) {
      apiCall = docTreatments(selectedDoctorForCashier.value);
    } else if (
      ["CASHIER", "ACCOUNTANT"].includes(userRole) ||
      userRole === "ADMIN"
    ) {
      apiCall = allTreatmentsPaged(currentPage, 20);
    } else {
      setLoading(false);
      setTreatments([]);
      return;
    }

    apiCall
      .then((res) => {
        const data = res.data;
        let treatmentsData;
        if (data && Array.isArray(data.content)) {
          treatmentsData = data.content;
          setTotalRows(data.totalElements || 0);
        } else {
          treatmentsData = Array.isArray(data) ? data : [];
        }

        // Doctor-isolation filter (client-side safety net)
        if (userRole === "DOCTOR" && currentUser.body.email) {
          const doctorEmail = currentUser.body.email.trim().toLowerCase();
          treatmentsData = treatmentsData.filter(
            (t) => t.doctor?.trim().toLowerCase() === doctorEmail,
          );
        } else if (
          ["CASHIER", "ACCOUNTANT"].includes(userRole) &&
          selectedDoctorForCashier
        ) {
          const doctorEmail = selectedDoctorForCashier.value
            .trim()
            .toLowerCase();
          treatmentsData = treatmentsData.filter(
            (t) => t.doctor?.trim().toLowerCase() === doctorEmail,
          );
        }

        setTreatments(
          [...treatmentsData].sort(
            (a, b) => new Date(b.registeredOn) - new Date(a.registeredOn),
          ),
        );
      })
      .catch(() =>
        toast.error("Erreur lors de la récupération des traitements."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (userRole) {
      fetchTreatments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, selectedDoctorForCashier, currentPage]);

  const filteredRecords = useMemo(() => {
    const start = new Date(dateRange.start + "T00:00:00");
    const end = new Date(dateRange.end + "T23:59:59");
    let result = treatments.filter((row) => {
      const d = new Date(row.registeredOn);
      return d >= start && d <= end;
    });
    const searchTerm = filterText.toLowerCase();
    if (searchTerm) {
      result = result.filter(
        (row) =>
          row.patientname?.toLowerCase().includes(searchTerm) ||
          row.patientno?.toLowerCase().includes(searchTerm) ||
          (Array.isArray(row.interventions) &&
            row.interventions.join(", ").toLowerCase().includes(searchTerm)) ||
          row.treatmentstatus?.toLowerCase().includes(searchTerm) ||
          row.statuspayment?.toLowerCase().includes(searchTerm),
      );
    }
    return result;
  }, [treatments, filterText, dateRange]);

  const handleDelete = (treatmentId) => {
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Cette action est irréversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer!",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTreatment(treatmentId)
          .then(() => {
            toast.success("Traitement supprimé.");
            fetchTreatments();
          })
          .catch(() => toast.error("Erreur de suppression."));
      }
    });
  };

  const handleSearch = (event) => {
    setFilterText(event.target.value);
  };

  const handleUpdatePayment = (treatmentId) => {
    Swal.fire({
      title: "Confirmer le paiement?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui!",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        updateTreatmentPaymentStatus(treatmentId)
          .then(() => {
            toast.success("Statut de paiement mis à jour!");
            setTreatments((prev) =>
              prev.map((rec) =>
                rec.id === treatmentId
                  ? { ...rec, statuspayment: "Payé" }
                  : rec,
              ),
            );
          })
          .catch(() => toast.error("Erreur de mise à jour."));
      }
    });
  };

  const handleTreatmentSuccess = () => {
    setIsTreatmentModalOpen(false);
    setEditingTreatment(null);
    // toast.success("Opération réussie. La liste est en cours de mise à jour...");
    fetchTreatments();
  };

  const handleAddClick = () => {
    setEditingTreatment(null);
    setIsPatientModalOpen(true);
  };
  const handleEditClick = (treatment) => {
    setEditingTreatment(treatment);
    setIsTreatmentModalOpen(true);
  };
  const handlePatientSelected = (patient) => {
    setSelectedPatientForTreatment(patient);
    setIsPatientModalOpen(false);
    setIsTreatmentModalOpen(true);
  };
  const handleCloseTreatmentModal = () => {
    setIsTreatmentModalOpen(false);
    setEditingTreatment(null);
  };

  const tableHeaderstyle = {
    headRow: {
      style: { backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" },
    },
    headCells: {
      style: {
        color: "#4a5568",
        fontWeight: "600",
        fontSize: "0.875rem",
        padding: "1rem",
      },
    },
    rows: {
      style: {
        minHeight: "72px",
        "&:not(:last-of-type)": { borderBottom: "1px solid #edf2f7" },
        "&:hover": { backgroundColor: "#f7fafc" },
      },
    },
    cells: { style: { padding: "0.5rem 1rem", fontSize: "0.875rem" } },
    expanderRow: { style: { backgroundColor: "#f9fafb" } },
  };

  const baseColumns = [
    {
      name: "Patient",
      selector: (row) => row.patientname,
      sortable: true,
      width: "250px",
      cell: (row) => (
        <div>
          <div className="font-md text-gray-800">{row.patientname}</div>
          <div className="text-sm text-gray-500">{row.patientno}</div>
        </div>
      ),
    },
    {
      name: "Interventions",
      width: "150px",
      cell: (row) => (
        <div className="text-sm text-gray-600">
          {Array.isArray(row.interventions) && row.interventions.length > 0
            ? `${row.interventions.length} acte(s)`
            : "Aucun acte"}
        </div>
      ),
    },
    {
      name: "Statut",
      selector: (row) => row.treatmentstatus,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-md ${
            row.treatmentstatus === "Terminé"
              ? "bg-green-50 text-green-900 font-bold"
              : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {row.treatmentstatus}
          <div className="text-xs text-black">N°T - {row.id}</div>
        </span>
      ),
    },
    {
      name: "Date",
      selector: (row) => row.registeredOn,
      sortable: true,
      width: "200px",
      cell: (row) => {
        const created = formatDateTime(row.registeredOn);
        const updated = formatDateTime(row.updatedOn);
        const wasUpdated =
          row.updatedOn &&
          row.registeredOn &&
          new Date(row.updatedOn).getTime() -
            new Date(row.registeredOn).getTime() >
            60000;
        return (
          <div className="flex items-start space-x-2">
            <CiCalendarDate
              size={20}
              className="text-gray-400 mt-0.5 flex-shrink-0"
            />
            <div>
              <div className="font-medium">{created.date}</div>
              <div className="text-xs text-gray-500">à {created.time}</div>
              {wasUpdated && (
                <div className="text-xs text-amber-600 mt-0.5">
                  ↻ {updated.date} à {updated.time}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  const adminCashierColumns = [
    ...baseColumns,
    {
      name: "Paiement",
      selector: (row) => row.statuspayment,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.statuspayment === "Payé"
              ? "bg-primary-100 text-primary-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.statuspayment}
        </span>
      ),
    },
    {
      name: "Part Patient",
      selector: (row) => row.partpatient.toLocaleString("fr-FR"),
      sortable: true,
      cell: (row) => `${(row.partpatient || 0).toLocaleString("fr-FR")} F CFA`,
    },
    {
      name: "Actions",
      width: "140px",
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleEditClick(row)}
            className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer text-yellow-600 hover:bg-yellow-50 hover:text-yellow-800 dark:hover:bg-yellow-900/30 transition-colors"
            title="Modifier"
            aria-label="Modifier le traitement"
          >
            <MdEdit size={18} />
          </button>
          <Link
            to={`/treatment/print/${row.id}?autoprint=1`}
            className="flex items-center justify-center w-8 h-8 rounded-full text-primary-600 hover:bg-primary-50 hover:text-primary-800 dark:hover:bg-primary-900/30 transition-colors"
            title="Imprimer le reçu POS"
            aria-label="Imprimer le reçu"
          >
            <MdPrint size={18} />
          </Link>
          {row.statuspayment !== "Payé" && (
            <button
              onClick={() => handleUpdatePayment(row.id)}
              className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer text-green-600 hover:bg-green-50 hover:text-green-800 dark:hover:bg-green-900/30 transition-colors"
              title="Marquer comme Payé"
              aria-label="Marquer comme payé"
            >
              <MdCheckCircle size={18} />
            </button>
          )}
          <button
            onClick={() => handleDelete(row.id)}
            className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-800 dark:hover:bg-red-900/30 transition-colors"
            title="Supprimer"
            aria-label="Supprimer le traitement"
          >
            <MdDelete size={18} />
          </button>
        </div>
      ),
    },
  ];

  const cashierColumns = [
    ...baseColumns,
    {
      name: "Paiement",
      selector: (row) => row.statuspayment,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.statuspayment === "Payé"
              ? "bg-primary-100 text-primary-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.statuspayment}
        </span>
      ),
    },
    {
      name: "Part Patient",
      selector: (row) => row.partpatient,
      sortable: true,
      cell: (row) => `${(row.partpatient || 0).toLocaleString("fr-FR")} F CFA`,
    },
    {
      name: "Actions",
      width: "170px",
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleEditClick(row)}
            className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer text-yellow-600 hover:bg-yellow-50 hover:text-yellow-800 dark:hover:bg-yellow-900/30 transition-colors"
            title="Modifier"
            aria-label="Modifier le traitement"
          >
            <MdEdit size={18} />
          </button>
          <Link
            to={`/treatment/print/${row.id}?autoprint=1`}
            className="flex items-center justify-center w-8 h-8 rounded-full text-primary-600 hover:bg-primary-50 hover:text-primary-800 dark:hover:bg-primary-900/30 transition-colors"
            title="Imprimer le reçu POS"
            aria-label="Imprimer le reçu"
          >
            <MdPrint size={18} />
          </Link>
          {row.statuspayment !== "Payé" && (
            <button
              onClick={() => handleUpdatePayment(row.id)}
              className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer text-green-600 hover:bg-green-50 hover:text-green-800 dark:hover:bg-green-900/30 transition-colors"
              title="Marquer comme Payé"
              aria-label="Marquer comme payé"
            >
              <MdCheckCircle size={18} />
            </button>
          )}
          <button
            onClick={() =>
              navigate("/treatment/patient-history", {
                state: {
                  patient: {
                    patientno: row.patientno,
                    patientname: row.patientname,
                  },
                },
              })
            }
            className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer text-primary-600 hover:bg-primary-50 hover:text-primary-800 dark:hover:bg-primary-900/30 transition-colors"
            title="Historique du patient"
            aria-label="Historique du patient"
          >
            <MdHistory size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-800 dark:hover:bg-red-900/30 transition-colors"
            title="Supprimer"
            aria-label="Supprimer le traitement"
          >
            <MdDelete size={18} />
          </button>
        </div>
      ),
    },
  ];

  const doctorColumns = [
    ...baseColumns,
    {
      name: "Part Patient",
      selector: (row) => row.partpatient,
      sortable: true,
      cell: (row) => `${(row.partpatient || 0).toLocaleString("fr-FR")} F CFA`,
    },
    {
      name: "Actions",
      width: "160px",
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleEditClick(row)}
            className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer text-yellow-600 hover:bg-yellow-50 hover:text-yellow-800 dark:hover:bg-yellow-900/30 transition-colors"
            title="Modifier"
            aria-label="Modifier le traitement"
          >
            <MdEdit size={18} />
          </button>
          <Link
            to={`/treatment/print/${row.id}?autoprint=1`}
            className="flex items-center justify-center w-8 h-8 rounded-full text-primary-600 hover:bg-primary-50 hover:text-primary-800 dark:hover:bg-primary-900/30 transition-colors"
            title="Imprimer le reçu POS"
            aria-label="Imprimer le reçu"
          >
            <MdPrint size={18} />
          </Link>
          <button
            onClick={() =>
              navigate("/treatment/patient-history", {
                state: {
                  patient: {
                    patientno: row.patientno,
                    patientname: row.patientname,
                  },
                },
              })
            }
            className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer text-primary-600 hover:bg-primary-50 hover:text-primary-800 dark:hover:bg-primary-900/30 transition-colors"
            title="Historique du patient"
            aria-label="Historique du patient"
          >
            <MdHistory size={18} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-800 dark:hover:bg-red-900/30 transition-colors"
            title="Supprimer"
            aria-label="Supprimer le traitement"
          >
            <MdDelete size={18} />
          </button>
        </div>
      ),
    },
  ];

  const renderHeader = () => {
    if (!userRole) return null;
    return (
      <header className="mb-6 space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            Gestion des Traitements
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full md:w-64 p-2 pl-10 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                onChange={handleSearch}
                value={filterText}
              />
            </div>
            {["DOCTOR", "CASHIER", "ACCOUNTANT", "ADMIN"].includes(
              userRole,
            ) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddClick}
                  className="flex-shrink-0 flex cursor-pointer items-center justify-center w-10 h-10 bg-primary-700 text-white rounded-lg shadow-sm hover:bg-primary-800 transition-colors"
                  title="Nouveau Traitement"
                  aria-label="Nouveau traitement"
                >
                  <MdAddCircleOutline size={20} />
                </button>
                <Link
                  to="/treatment/of-the-day"
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  title="Traitements du Jour"
                  aria-label="Traitements du jour"
                >
                  <MdToday size={20} />
                </Link>
                <Link
                  to="/treatment/between"
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  title="Traitements par Période"
                  aria-label="Traitements par période"
                >
                  <MdDateRange size={20} />
                </Link>
                <Link
                  to="/treatment/patient-history"
                  className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  title="Historique par Patient"
                  aria-label="Historique par patient"
                >
                  <MdHistory size={20} />
                </Link>
              </div>
            )}
          </div>
        </div>
        {/* Date range filter bar */}
        <div className="flex items-center gap-3 flex-wrap px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
          <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
            Période :
          </span>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((r) => ({ ...r, start: e.target.value }))
            }
            className="border border-gray-300 dark:border-slate-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
          <span className="text-gray-400 dark:text-slate-500">→</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((r) => ({ ...r, end: e.target.value }))
            }
            className="border border-gray-300 dark:border-slate-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
          <button
            onClick={fetchTreatments}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 cursor-pointer transition-colors"
          >
            <MdRefresh size={16} /> Charger
          </button>
          <span className="text-xs text-gray-500 dark:text-slate-400 ml-auto">
            {treatments.length} traitement(s) chargé(s)
          </span>
        </div>
      </header>
    );
  };

  const renderDataTable = () => {
    const commonProps = {
      pagination: true,
      paginationServer: true,
      paginationTotalRows: totalRows,
      onChangePage: (page) => setCurrentPage(page - 1),
      fixedHeader: true,
      fixedHeaderScrollHeight: "calc(100vh - 300px)",
      customStyles: tableHeaderstyle,
      progressPending: loading,
      progressComponent: <CustomLoader />,
      highlightOnHover: true,
      responsive: true,
      expandableRows: true,
      expandableRowsComponent: ExpandedComponent,
      expandableRowDisabled: (row) =>
        (!Array.isArray(row.interventions) || row.interventions.length === 0) &&
        (row.partinsurance || 0) + (row.partinsurance2 || 0) === 0 &&
        (!Array.isArray(row.teeth) || row.teeth.length === 0),
    };

    switch (userRole) {
      case "DOCTOR":
        return (
          <DataTable
            {...commonProps}
            columns={doctorColumns}
            data={filteredRecords}
            noDataComponent={
              <CustomNoDataComponent
                message="Aucun traitement trouvé"
                suggestion="Créez un nouveau traitement."
              />
            }
          />
        );
      case "ADMIN":
        return (
          <DataTable
            {...commonProps}
            columns={adminCashierColumns}
            data={filteredRecords}
            noDataComponent={
              <CustomNoDataComponent message="Aucun traitement disponible" />
            }
          />
        );
      case "CASHIER":
      case "ACCOUNTANT":
        return (
          <DataTable
            {...commonProps}
            columns={cashierColumns}
            data={filteredRecords}
            noDataComponent={
              <CustomNoDataComponent
                message={
                  selectedDoctorForCashier
                    ? "Aucun traitement pour ce médecin"
                    : "Aucun traitement trouvé"
                }
              />
            }
          />
        );
      // default:
      //   return <CustomNoDataComponent message="Accès non autorisé" />;
    }
  };

  return (
    <>
      <PatientForTreatmentSelectionModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onPatientSelect={handlePatientSelected}
      />
      <NewTreatmentModal
        isOpen={isTreatmentModalOpen}
        onClose={handleCloseTreatmentModal}
        onSuccess={handleTreatmentSuccess}
        patient={selectedPatientForTreatment}
        treatmentToEdit={editingTreatment}
      />
      <div className="p-4 md:p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 md:p-6">
          {renderHeader()}
          <div className="border-t border-gray-200 dark:border-slate-700">
            {renderDataTable()}
          </div>
        </div>
      </div>
    </>
  );
}
