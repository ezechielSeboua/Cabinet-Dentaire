import  { useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

// --- Third-party Libraries ---
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { IoArrowBack, IoSearchOutline } from "react-icons/io5";

// --- Required CSS files ---
import "react-toastify/dist/ReactToastify.css";

// --- Project-specific Imports (Assumed to exist) ---
import { getCurrentUser } from "../../services/authService";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";
import { API_URL } from "../../utils/config";
import { FaFileExcel } from "react-icons/fa6";

// ================================================================================================
// Reusable Helper Component for Statistics Cards
// ================================================================================================
const StatCard = ({ title, value, highlight = false }) => (
  <div
    className={`p-4 rounded-lg ${
      highlight
        ? "bg-primary-100 dark:bg-primary-900/50"
        : "bg-gray-100 dark:bg-gray-800"
    }`}
  >
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
      {title}
    </p>
    <p
      className={`text-xl sm:text-2xl font-bold ${
        highlight
          ? "text-primary-600 dark:text-primary-300"
          : "text-gray-900 dark:text-white"
      }`}
    >
      {value.toLocaleString("fr-FR")} CFA
    </p>
  </div>
);

// ================================================================================================
// Date Formatting Helpers
// ================================================================================================
const toYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDateToDMY = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  return `${date.getUTCDate()}/${
    date.getUTCMonth() + 1
  }/${date.getUTCFullYear()}`;
};

// ================================================================================================
// Main Component: IntervalTreatments
// ================================================================================================
export default function IntervalTreatments() {
  const sidebarMargin = useSidebarMargin();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const t = new Date();
    return toYMD(new Date(t.getFullYear(), t.getMonth(), 1));
  });
  const [endDate, setEndDate] = useState(() => toYMD(new Date()));
  const [currentUser] = useState(getCurrentUser());
  const [showInsurances, setShowInsurances] = useState(false);
  const componentToPrint = useRef();

  // --- Form Submission Handler ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.warn("Veuillez sélectionner une date de début et de fin.", {
        theme: "colored",
      });
      return;
    }

    // 1. Set loading state immediately
    setIsLoading(true);

    try {
      const url = `${API_URL}/treatment/${startDate}/${endDate}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`La requête a échoué: ${response.statusText}`);
      }

      const resultData = await response.json();

      // 2. Determine which data to display (the core logic)
      let dataToDisplay = resultData;

      const role = currentUser?.body?.roles[0]?.toString().toLowerCase();
      const doctorEmail = currentUser?.body?.email?.trim().toLowerCase();

      // Check if the user is a doctor and has a valid email
      if (role === "doctor" && doctorEmail) {
        // console.log(`Applying filter for doctor: ${doctorEmail}`);

        dataToDisplay = resultData.filter(
          (treatment) => treatment.doctor?.trim().toLowerCase() === doctorEmail
        );
      } else if (role !== "doctor") {
        dataToDisplay = resultData;
      } else {
        console.log("Not a doctor or no email, showing all data.");
      }

      // 3. Set the final data state
      setData(dataToDisplay);
      // console.log("objects to display:", dataToDisplay);

      // 4. Show toast message based on the *final* data
      if (dataToDisplay.length === 0) {
        toast.info("Aucun traitement trouvé pour la période sélectionnée.", {
          theme: "colored",
          position: "top-center",
        });
      }
    } catch (err) {
      console.error("Une erreur s'est produite : ", err);
      toast.error("Erreur lors de la récupération des données.", {
        theme: "dark",
      });
      // Ensure data is cleared on error
      setData([]);
    } finally {
      // 5. Turn off loading state at the very end
      setIsLoading(false);
    }
  };
  // --- Memoized Calculations ---
  const { totals, allInsurances } = useMemo(() => {
    const initialTotals = {
      total: 0,
      totalpatient: 0,
      totalinsurance: 0,
      insuranceTotals: {},
    };

    const aggregated = data.reduce((acc, treatment) => {
      acc.total += treatment.treatmentamount || 0;
      acc.totalpatient += treatment.partpatient || 0;
      const insuranceTotal =
        (treatment.partinsurance || 0) + (treatment.partinsurance2 || 0);
      acc.totalinsurance += insuranceTotal;

      if (treatment.insurance && treatment.partinsurance > 0) {
        acc.insuranceTotals[treatment.insurance] =
          (acc.insuranceTotals[treatment.insurance] || 0) +
          treatment.partinsurance;
      }
      if (treatment.insurance2 && treatment.partinsurance2 > 0) {
        acc.insuranceTotals[treatment.insurance2] =
          (acc.insuranceTotals[treatment.insurance2] || 0) +
          treatment.partinsurance2;
      }

      return acc;
    }, initialTotals);

    const sorted = Object.entries(aggregated.insuranceTotals).sort(
      ([, a], [, b]) => b - a
    );

    return {
      totals: aggregated,
      allInsurances: sorted,
    };
  }, [data]);

  // --- Table Columns ---
  const columns = useMemo(
    () => [
      {
        name: "Docteur",
        selector: (row) => row.doctorname,
        sortable: true,
        grow: 2,
      },
      {
        name: "Montant Total",
        selector: (row) => row.treatmentamount,
        sortable: true,
        format: (row) => `${row.treatmentamount.toLocaleString("fr-FR")} CFA`,
      },
      {
        name: "Part Patient",
        selector: (row) => row.partpatient,
        sortable: true,
        format: (row) => `${row.partpatient.toLocaleString("fr-FR")} CFA`,
      },
      {
        name: "Part Assurance(s)",
        selector: (row) => (row.partinsurance || 0) + (row.partinsurance2 || 0),
        sortable: true,
        format: (row) =>
          `${(
            (row.partinsurance || 0) + (row.partinsurance2 || 0)
          ).toLocaleString("fr-FR")} CFA`,
      },
      {
        name: "Facture",
        selector: (row) => row.statuspayment,
        sortable: true,
      },
      {
        name: "Date",
        selector: (row) => row.registeredOn,
        sortable: true,
        format: (row) => formatDateToDMY(row.registeredOn),
        sortFunction: (a, b) =>
          new Date(a.registeredOn) - new Date(b.registeredOn),
      },
    ],
    []
  );

  // --- Expanded Row Component ---
  const ExpandedComponent = ({ data }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
      <h4 className="font-bold text-md mb-2">
        Détail des assurances pour ce traitement :
      </h4>
      {data.partinsurance > 0 || data.partinsurance2 > 0 ? (
        <ul className="list-disc list-inside">
          {data.insurance && data.partinsurance > 0 && (
            <li>
              {data.insurance}:{" "}
              <strong>
                {data.partinsurance.toLocaleString("fr-FR")} F CFA
              </strong>
            </li>
          )}
          {data.insurance2 && data.partinsurance2 > 0 && (
            <li>
              {data.insurance2}:{" "}
              <strong>
                {data.partinsurance2.toLocaleString("fr-FR")} F CFA
              </strong>
            </li>
          )}
        </ul>
      ) : (
        <p>Aucune part assurance pour ce traitement.</p>
      )}
    </div>
  );

  // --- Export Logic ---
  const getExportData = () => {
    const headers = [
      "Date",
      "Docteur",
      "Montant Total",
      "Part Patient",
      "Part Assurance 1",
      "Montant 1",
      "Part Assurance 2",
      "Montant 2",
      "Status Facture",
    ];

    const rows = data.map((row) => ({
      Date: formatDateToDMY(row.registeredOn),
      Docteur: row.doctorname,
      "Montant Total": row.treatmentamount,
      "Part Patient": row.partpatient,
      "Part Assurance 1": row.insurance || "",
      "Montant 1": row.partinsurance || 0,
      "Part Assurance 2": row.insurance2 || "",
      "Montant 2": row.partinsurance2 || 0,
      "Status Facture": row.statuspayment,
    }));

    return [headers, rows];
  };

  const exportToFile = (fileType) => {
    const [headers, rows] = getExportData();

    const summary = [
      ["Résumé de la Période"],
      [""],
      ["Total Global Soins hors assurance", totals.total],
      ["Total Part Patient", totals.totalpatient],
      ["Total Global Assurances", totals.totalinsurance],
      [""],
      ["Détail Assurances:"],
      ...allInsurances.map(([name, value]) => [name, value]),
    ];

    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 });
    XLSX.utils.sheet_add_aoa(ws, summary, { origin: -1 });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rapport");
    const fileName = `Rapport_Traitements_${startDate}_au_${endDate}.${fileType}`;
    XLSX.writeFile(wb, fileName);
  };

  const customTableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        color: "white",
        backgroundColor: "#1f2937",
      },
    },
  };

  // --- JSX Render ---
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-700 text-black dark:text-white">
      <SideBar2 />
      <div className="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>
      <div className={`h-full mt-14 mb-10 ${sidebarMargin} p-4 sm:p-6 lg:p-8`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Rapport des Traitements</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Générer un rapport financier par intervalle de dates.
            </p>
          </div>
          <Link
            to="/treatment"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 hover:border-primary-300 transition-all duration-150"
          >
            <IoArrowBack size={16} />
            Retour
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex cursor-pointer justify-center items-center gap-2 bg-primary-600 text-white font-bold py-2.5 px-4 rounded-md shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:bg-primary-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  "Chargement..."
                ) : (
                  <>
                    <IoSearchOutline size={18} /> Afficher
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {data.length > 0 && (
          <div ref={componentToPrint} className="space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Résumé de la Période
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                  title="Total des Soins sans assurance"
                  value={totals.total}
                  highlight
                />
                <StatCard
                  title="Total Part Patients assurés"
                  value={totals.totalpatient}
                />
                <StatCard
                  title="Total Global des Assurances"
                  value={totals.totalinsurance}
                />
              </div>

              {allInsurances.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowInsurances((prev) => !prev)}
                    className="flex items-center justify-between w-full text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <span>Détail par Assurance ({allInsurances.length})</span>
                    <span className="text-xl leading-none font-bold">
                      {showInsurances ? "−" : "+"}
                    </span>
                  </button>
                  {showInsurances && (
                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
                              Assurance
                            </th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">
                              Montant (FCFA)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {allInsurances.map(([name, value]) => (
                            <tr
                              key={name}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                {name}
                              </td>
                              <td className="px-4 py-2 text-right font-mono font-medium text-gray-900 dark:text-white">
                                {value.toLocaleString("fr-FR")} FCFA
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <td className="px-4 py-2 font-bold text-gray-700 dark:text-gray-200">
                              Total
                            </td>
                            <td className="px-4 py-2 text-right font-mono font-bold text-gray-900 dark:text-white">
                              {totals.totalinsurance.toLocaleString("fr-FR")}{" "}
                              FCFA
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 flex flex-wrap justify-between items-center gap-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">
                  Détail des Traitements
                </h3>
                <button
                  onClick={() => exportToFile("xlsx")}
                  className="flex cursor-pointer items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  <FaFileExcel />
                  Exporter Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <DataTable
                  columns={columns}
                  data={data}
                  pagination
                  responsive
                  fixedHeader
                  fixedHeaderScrollHeight="450px"
                  highlightOnHover
                  customStyles={customTableStyles}
                  progressPending={isLoading}
                  expandableRows
                  expandableRowsComponent={ExpandedComponent}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
