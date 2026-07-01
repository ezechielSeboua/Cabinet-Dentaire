import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";
import { getPatientTreatments } from "../../services/cdiService";
import { toast } from "react-toastify";
import { IoReturnUpBackSharp } from "react-icons/io5";
import { FaFileExcel } from "react-icons/fa";
import { MdPersonSearch, MdHistory, MdPhone } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import DataTable from "react-data-table-component";
import PatientForTreatmentSelectionModal from "../modals/PatientForTreatmentSelectionModal";
import * as XLSX from "xlsx";

const fmt = (n) => (n || 0).toLocaleString("fr-FR");

const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ExpandedRow = ({ data }) => {
  const nonAssured = ["NA", "NON ASSURE", "NON ASSURÉ", "UNDEFINED"];
  const insurances = [];
  if (data.insurance && !nonAssured.includes(data.insurance.toUpperCase()) && data.partinsurance > 0)
    insurances.push({ name: data.insurance, amount: data.partinsurance });
  if (data.insurance2 && !nonAssured.includes(data.insurance2.toUpperCase()) && data.partinsurance2 > 0)
    insurances.push({ name: data.insurance2, amount: data.partinsurance2 });

  const hasTeeth = Array.isArray(data.teeth) && data.teeth.length > 0;
  const sortedTeeth = hasTeeth
    ? [...data.teeth].map(String).sort((a, b) => Number(a) - Number(b))
    : [];

  return (
    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div>
        <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Interventions</p>
        {Array.isArray(data.interventions) && data.interventions.length > 0 ? (
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-400 space-y-0.5">
            {data.interventions.map((i, idx) => <li key={idx}>{i}</li>)}
          </ul>
        ) : (
          <p className="text-gray-400 italic">Aucune intervention enregistrée.</p>
        )}
      </div>
      <div>
        <p className="font-semibold text-gray-600 dark:text-gray-300 mb-1">Assurances</p>
        {insurances.length > 0 ? (
          insurances.map(({ name, amount }, idx) => (
            <div key={idx} className="flex justify-between text-primary-800 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 rounded px-2 py-1 mb-1">
              <span>{name}</span>
              <span className="font-mono font-bold">{fmt(amount)} F CFA</span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">Aucune assurance associée.</p>
        )}
      </div>

      {/* Teeth */}
      <div className="md:col-span-2">
        <p className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Dents traitées</p>
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
          <p className="text-gray-400 italic">Aucune dent sélectionnée.</p>
        )}
      </div>
    </div>
  );
};

export default function PatientTreatmentHistory() {
  const sidebarMargin = useSidebarMargin();
  const location = useLocation();
  const [patient, setPatient] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterText, setFilterText] = useState("");

  // Auto-load when navigated from TreatmentList with a patient in state
  useEffect(() => {
    const preselected = location.state?.patient;
    if (!preselected?.patientno) return;
    setPatient(preselected);
    setLoading(true);
    getPatientTreatments(preselected.patientno)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const sorted = [...data].sort((a, b) => new Date(b.registeredOn) - new Date(a.registeredOn));
        setTreatments(sorted);
        if (sorted.length > 0 && sorted[0].patienttelephone)
          setPatient((prev) => ({ ...prev, telephone: sorted[0].patienttelephone }));
        if (sorted.length === 0)
          toast.info("Aucun traitement trouvé pour ce patient.");
        else
          toast.success(`${sorted.length} traitement(s) trouvé(s).`, { autoClose: 1500 });
      })
      .catch(() => toast.error("Erreur lors du chargement des traitements."))
      .finally(() => setLoading(false));
  }, []);

  const handlePatientSelected = (p) => {
    const fullName = p.patientname || `${p.lastname || ""} ${p.firstname || ""}`.trim();
    setPatient({ ...p, patientname: fullName });
    setIsModalOpen(false);
    setTreatments([]);
    setFilterText("");
    setLoading(true);
    getPatientTreatments(p.patientno)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const sorted = [...data].sort((a, b) => new Date(b.registeredOn) - new Date(a.registeredOn));
        setTreatments(sorted);
        if (sorted.length > 0 && sorted[0].patienttelephone)
          setPatient((prev) => ({ ...prev, telephone: sorted[0].patienttelephone }));
        if (sorted.length === 0)
          toast.info("Aucun traitement trouvé pour ce patient.");
        else
          toast.success(`${sorted.length} traitement(s) trouvé(s).`, { autoClose: 1500 });
      })
      .catch(() => toast.error("Erreur lors du chargement des traitements."))
      .finally(() => setLoading(false));
  };

  const totals = useMemo(() => ({
    count: treatments.length,
    patient: treatments.reduce((s, t) => s + (t.partpatient || 0), 0),
    insurance: treatments.reduce((s, t) => s + (t.partinsurance || 0) + (t.partinsurance2 || 0), 0),
    paid: treatments.reduce((s, t) => s + (t.amountpaid || 0), 0),
  }), [treatments]);

  const filtered = useMemo(() => {
    const term = filterText.toLowerCase();
    if (!term) return treatments;
    return treatments.filter(
      (t) =>
        formatDate(t.registeredOn).toLowerCase().includes(term) ||
        t.treatmentstatus?.toLowerCase().includes(term) ||
        t.statuspayment?.toLowerCase().includes(term) ||
        (Array.isArray(t.interventions) && t.interventions.join(" ").toLowerCase().includes(term))
    );
  }, [treatments, filterText]);

  const handleExport = () => {
    if (treatments.length === 0) { toast.warn("Aucune donnée à exporter."); return; }
    const rows = treatments.map((t) => ({
      "Date": formatDate(t.registeredOn),
      "Interventions": Array.isArray(t.interventions) ? t.interventions.join(", ") : "",
      "Statut traitement": t.treatmentstatus || "",
      "Statut paiement": t.statuspayment || "",
      "Part Patient (F CFA)": t.partpatient || 0,
      "Assurance 1": t.insurance || "",
      "Part Assurance 1 (F CFA)": t.partinsurance || 0,
      "Assurance 2": t.insurance2 || "",
      "Part Assurance 2 (F CFA)": t.partinsurance2 || 0,
      "Coût Total (F CFA)": t.treatmentamount || 0,
    }));
    rows.push({});
    rows.push({
      "Date": "TOTAL",
      "Interventions": `${totals.count} traitement(s)`,
      "Statut traitement": "",
      "Statut paiement": "",
      "Part Patient (F CFA)": totals.patient,
      "Assurance 1": "",
      "Part Assurance 1 (F CFA)": "",
      "Assurance 2": "",
      "Part Assurance 2 (F CFA)": totals.insurance,
      "Coût Total (F CFA)": totals.patient + totals.insurance,
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Historique");
    XLSX.writeFile(wb, `Historique_${patient?.patientname}_${patient?.patientno}.xlsx`);
  };

  const columns = [
    {
      name: "Date",
      selector: (row) => row.registeredOn,
      sortable: true,
      minWidth: "140px",
      cell: (row) => (
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <CiCalendarDate size={18} className="text-gray-400" />
          {formatDate(row.registeredOn)}
        </div>
      ),
    },
    {
      name: "Interventions",
      minWidth: "160px",
      cell: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {Array.isArray(row.interventions) && row.interventions.length > 0
            ? `${row.interventions.length} acte(s)`
            : <span className="italic text-gray-400">Aucun</span>}
        </span>
      ),
    },
    {
      name: "Statut",
      sortable: true,
      cell: (row) => (
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
          row.treatmentstatus === "Terminé"
            ? "bg-green-50 text-green-800"
            : "bg-yellow-50 text-yellow-700"
        }`}>
          {row.treatmentstatus}
        </span>
      ),
    },
    {
      name: "Paiement",
      sortable: true,
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.statuspayment === "Payé"
            ? "bg-primary-100 text-primary-800"
            : "bg-red-100 text-red-800"
        }`}>
          {row.statuspayment}
        </span>
      ),
    },
    {
      name: "Part Patient",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-sm text-gray-800 dark:text-gray-200">
          {fmt(row.partpatient)} F
        </span>
      ),
    },
    {
      name: "Assurance",
      cell: (row) => {
        const total = (row.partinsurance || 0) + (row.partinsurance2 || 0);
        return total > 0
          ? <span className="font-mono text-sm text-primary-700 dark:text-primary-400">{fmt(total)} F</span>
          : <span className="text-gray-400 text-xs italic">—</span>;
      },
    },
  ];

  const tableStyles = {
    headRow: { style: { backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" } },
    headCells: { style: { color: "#4a5568", fontWeight: "600", fontSize: "0.8rem", textTransform: "uppercase" } },
    rows: { style: { minHeight: "56px", "&:hover": { backgroundColor: "#f7fafc" } } },
  };

  return (
    <>
      <PatientForTreatmentSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPatientSelect={handlePatientSelected}
        subtitle="Sélectionnez un patient pour consulter l'historique complet de ses traitements."
        actionLabel="Voir historique"
        ActionIcon={MdHistory}
      />

      <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
        <SideBar2 />
        <div className="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
          <Header />
        </div>
        <div className={`flex-grow ml-0 mt-14 mb-10 ${sidebarMargin} p-6`}>

          {/* Page header */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
              Historique des Traitements
            </h1>
            <Link
              to="/treatment"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 hover:border-primary-300 transition-all duration-150"
            >
              <IoReturnUpBackSharp size={16} />
              Retour
            </Link>
          </div>

          {/* Patient picker */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-bold py-2 px-5 rounded-md cursor-pointer transition-all"
            >
              <MdPersonSearch size={20} />
              Choisir un patient
            </button>
            {patient ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg flex-shrink-0">
                  {patient.patientname?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{patient.patientname}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">N° {patient.patientno}</p>
                  {patient.telephone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <MdPhone size={14} className="text-primary-500" />
                      {patient.telephone}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">Aucun patient sélectionné</p>
            )}
          </div>

          {/* Results */}
          {patient && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Traitements</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary-600">{totals.count}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Part Patient</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">{fmt(totals.patient)} F</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Part Assurances</p>
                  <p className="text-lg sm:text-xl font-bold text-primary-600">{fmt(totals.insurance)} F</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Coût Total</p>
                  <p className="text-lg sm:text-xl font-bold text-primary-600">{fmt(totals.patient + totals.insurance)} F</p>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
                <div className="px-4 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
                    Patient
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {patient.patientname}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    N° {patient.patientno}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Filtrer par date, statut, intervention..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full sm:max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md cursor-pointer whitespace-nowrap"
                  >
                    <FaFileExcel /> Exporter Excel
                  </button>
                </div>
                <DataTable
                  columns={columns}
                  data={filtered}
                  pagination
                  responsive
                  paginationPerPage={15}
                  paginationRowsPerPageOptions={[15, 30, 50]}
                  paginationComponentOptions={{ rowsPerPageText: "Lignes:", rangeSeparatorText: "sur" }}
                  fixedHeader
                  fixedHeaderScrollHeight="calc(100vh - 380px)"
                  customStyles={tableStyles}
                  progressPending={loading}
                  progressComponent={
                    <div className="py-10 text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500 mx-auto" />
                    </div>
                  }
                  noDataComponent={
                    <div className="py-10 text-center text-gray-500">
                      {filterText ? "Aucun résultat pour ce filtre." : "Aucun traitement trouvé."}
                    </div>
                  }
                  highlightOnHover
                  expandableRows
                  expandableRowsComponent={ExpandedRow}
                  expandableRowDisabled={(row) =>
                    (!Array.isArray(row.interventions) || row.interventions.length === 0) &&
                    (row.partinsurance || 0) + (row.partinsurance2 || 0) === 0 &&
                    (!Array.isArray(row.teeth) || row.teeth.length === 0)
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
