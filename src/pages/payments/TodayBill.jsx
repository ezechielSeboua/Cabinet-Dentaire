import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as cdiService from "../../services/cdiService"; // Your data fetching service
import {
  MdDownload,
  MdPeople,
  MdCreditCard,
  MdBusiness,
  MdPrint,
} from "react-icons/md";
import { useReactToPrint } from "react-to-print";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { GiTakeMyMoney } from "react-icons/gi";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

// --- Helper Component 1: For simple stat cards ---
const StatCard = ({ icon, title, value, color }) => (
  <div
    className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4 border-l-4 ${color}`}
  >
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString("fr-FR")} CFA
      </p>
    </div>
  </div>
);

// --- Helper Component 2: The new consolidated insurance card ---
const InsuranceBreakdownCard = ({ title, totals, color }) => {
  // Calculate the grand total of all insurance parts
  const grandTotal = Object.values(totals).reduce(
    (sum, current) => sum + current,
    0
  );

  return (
    <div
      className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col space-y-3 border-l-4 ${color}`}
    >
      <div className="flex items-center space-x-4">
        <div className="text-3xl">
          <MdBusiness className="text-yellow-500" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {grandTotal.toLocaleString("fr-FR")} CFA
          </p>
        </div>
      </div>
      {/* Scrollable list for the breakdown. max-h-48 allows for ~7 items before scrolling */}
      <div className="border-t dark:border-gray-600 pt-3 max-h-48 overflow-y-auto pr-2">
        <ul className="space-y-2">
          {Object.entries(totals)
            .sort(([, a], [, b]) => b - a) // Sort by amount, highest first
            .map(([name, total]) => (
              <li key={name} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{name}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {total.toLocaleString("fr-FR")} CFA
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

const NON_ASSURED = ["NA", "NON ASSURE", "NON ASSURÉ", "UNDEFINED", ""];
const hasIns = (name) => !!name && !NON_ASSURED.includes(name.trim().toUpperCase());
const rowHasInsurance = (row) => hasIns(row.insurance) || hasIns(row.insurance2);

// --- Expandable row: insurance breakdown ---
const ExpandedComponent = ({ data }) => {
  if (!rowHasInsurance(data)) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 italic">
        Patient non assuré
      </div>
    );
  }
  return (
  <div className="p-4 bg-gray-100 dark:bg-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
    {hasIns(data.insurance) && (
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-lg text-primary-600 dark:text-primary-400 border-b-2 border-gray-200 dark:border-gray-600 pb-2 mb-3">
          Assurance Primaire
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
            <p className="font-bold text-gray-800 dark:text-gray-200">{data.insurance}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Prise en charge</p>
            <p className="font-bold text-gray-800 dark:text-gray-200">
              {(data.partinsurance || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} F CFA
            </p>
          </div>
        </div>
      </div>
    )}
    {hasIns(data.insurance2) && (
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-lg text-primary-600 dark:text-primary-400 border-b-2 border-gray-200 dark:border-gray-600 pb-2 mb-3">
          Assurance Secondaire
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
            <p className="font-bold text-gray-800 dark:text-gray-200">{data.insurance2}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Prise en charge</p>
            <p className="font-bold text-gray-800 dark:text-gray-200">
              {(data.partinsurance2 || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} F CFA
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

// --- Helper Component 3: For action buttons ---
const ActionButton = ({ icon, text, onClick, className }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${className}`}
  >
    {icon}
    <span>{text}</span>
  </button>
);

// --- Main Component ---
export default function TodayBillDashboard() {
  const sidebarMargin = useSidebarMargin();
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const componentToPrint = useRef();

  // --- Data Fetching ---
  useEffect(() => {
    cdiService
      .allBills()
      .then((res) => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayBills = res.data.filter(
          (bill) =>
            bill.registeredOn && bill.registeredOn.substring(0, 10) === todayStr
        );
        setBills(todayBills);
      })
      .catch((error) => {
        console.error("Failed to fetch bills:", error);
      });
  }, []);

  // --- Data Calculation using useMemo for performance ---
  const { totalPatient, totalPaid, insuranceTotals } = useMemo(() => {
    let pt = 0,
      pd = 0;
    const insTotals = {};

    bills.forEach((bill) => {
      pt += bill.partpatient || 0;
      pd += bill.amountpaid || 0;

      if (bill.insurance && bill.partinsurance) {
        insTotals[bill.insurance] =
          (insTotals[bill.insurance] || 0) + bill.partinsurance;
      }
      if (bill.insurance2 && bill.partinsurance2) {
        insTotals[bill.insurance2] =
          (insTotals[bill.insurance2] || 0) + bill.partinsurance2;
      }
    });
    return {
      totalPatient: pt,
      totalPaid: pd,
      insuranceTotals: insTotals,
    };
  }, [bills]);

  const remainingToPay = totalPatient - totalPaid;

  // --- Handlers for Printing and Exporting ---
  const handlePrint = useReactToPrint({
    content: () => componentToPrint.current,
    documentTitle: `Recette_du_jour_${new Date().toISOString().slice(0, 10)}`,
  });

  const handleExport = () => {
    const dataToExport = filteredBills.map(
      ({
        id,
        partpatient,
        amountpaid,
        insurance,
        partinsurance,
        insurance2,
        partinsurance2,
        registeredOn,
      }) => ({
        "Facture #": id,
        "Part Patient (CFA)": partpatient || 0,
        "Payé (CFA)": amountpaid || 0,
        "Nom Assurance 1": insurance || "N/A",
        "Part Assurance 1 (CFA)": partinsurance || 0,
        "Nom Assurance 2": insurance2 || "N/A",
        "Part Assurance 2 (CFA)": partinsurance2 || 0,
        Date: registeredOn.substring(0, 10),
      })
    );
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recette du Jour");
    XLSX.writeFile(
      workbook,
      `Recette_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // --- Table Configuration ---
  const columns = [
    { name: "Facture #", selector: (row) => row.id, sortable: true, grow: 0.5 },
    {
      name: "Patient",
      selector: (row) => row.patientname,
      sortable: true,
      grow: 2,
      cell: (row) => (
        <div>
          <div className="font-md text-gray-800">{row.patientname}</div>
          <div className="text-sm text-gray-500">{row.patientno}</div>
        </div>
      ),
    },
    {
      name: "Part Patient",
      selector: (row) => row.partpatient,
      sortable: true,
      right: true,
      cell: (row) => (
        <div className="font-bold text-primary-600 text-md">
          {(row.partpatient || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} F CFA
        </div>
      ),
    },
    {
      name: "Montant Payé",
      selector: (row) => row.amountpaid,
      sortable: true,
      right: true,
      cell: (row) => (
        <div className="font-bold text-green-600 text-md">
          {(row.amountpaid || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} F CFA
        </div>
      ),
    },
    {
      name: "Reste à Payer",
      selector: (row) => row.partpatient - row.amountpaid,
      sortable: true,
      right: true,
      cell: (row) => (
        <div className="font-bold text-red-600 text-md">
          {(row.partpatient - row.amountpaid).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} F CFA
        </div>
      ),
    },
    {
      name: "Date",
      selector: (row) => row.registeredOn.substring(0, 10),
      sortable: true,
    },
    {
      name: "Actions",
      center: true,
      button: true,
      ignoreRowClick: true,
      cell: (row) => (
        <Link
          to={`/bill/print/${row.id}`}
          title="Imprimer ticket thermique"
          className="p-1 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800"
        >
          <MdPrint className="text-primary-600 dark:text-primary-400" size={20} />
        </Link>
      ),
    },
  ];

  const filteredBills = bills.filter((bill) =>
    (bill.patientname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.patientno?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.id.toString().includes(searchQuery))
  );

  const tableHeaderstyle = {
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: "#f3f4f6",
        color: "#1f2937",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        "&:nth-of-type(odd)": { backgroundColor: "#f9fafb" },
        "&:hover": { backgroundColor: "#e5e7eb" },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* <Header /> & <SideBar2 /> are rendered by the FactureDuJour wrapper that mounts this component */}
      <main className={`h-full ml-0 mt-14 mb-10 ${sidebarMargin} p-4 sm:p-8`}>
        {/* --- Header Section --- */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Rapport Journalier</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Aperçu des recettes du{" "}
              {new Date().toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex space-x-2">
            {/* The Back button was commented out in your last version, keeping it that way */}
            {/* <Link to="/bill">
              <ActionButton icon={<MdArrowBack size={20} />} text="Retour" className="bg-gray-200..."/>
            </Link> */}
            <ActionButton
              icon={<MdDownload size={20} />}
              text="Exporter Excel"
              onClick={handleExport}
              className="bg-primary-700 cursor-pointer text-white hover:bg-primary-800"
            />
          </div>
        </div>

        {/* --- Stats Cards Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<MdPeople className="text-primary-500" />}
            title="Total Part Patients"
            value={totalPatient}
            color="border-primary-500"
          />
          <StatCard
            icon={<GiTakeMyMoney className="text-green-500" />}
            title="Total Déjà Payé"
            value={totalPaid}
            color="border-green-500"
          />
          <StatCard
            icon={<MdCreditCard className="text-red-500" />}
            title="Restant à Payer"
            value={remainingToPay}
            color="border-red-500"
          />

          {/* This now renders our single, scalable insurance card */}
          {Object.keys(insuranceTotals).length > 0 && (
            <InsuranceBreakdownCard
              title="Total couvert par assurance"
              totals={insuranceTotals}
              color="border-yellow-500"
            />
          )}
        </div>

        {/* --- Data Table Section --- */}
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto dark:bg-gray-800">
          <DataTable
            title={
              <h2 className="text-lg sm:text-xl font-bold text-gray-700 p-4 dark:text-gray-200">
                Détails des Factures du Jour
              </h2>
            }
            columns={columns}
            data={filteredBills}
            pagination
            responsive
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30]}
            fixedHeader
            fixedHeaderScrollHeight="calc(100vh - 420px)"
            highlightOnHover
            customStyles={tableHeaderstyle}
            expandableRows
            expandableRowsComponent={ExpandedComponent}
            subHeader
            subHeaderComponent={
              <div className="w-full p-4">
                <input
                  type="text"
                  placeholder="Rechercher par nom, n°, facture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-1/2 lg:w-1/3 h-12 px-4 text-md text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                />
              </div>
            }
            subHeaderAlign="left"
            noDataComponent={
              <div className="p-8 text-center text-gray-500">
                Aucune facture trouvée pour aujourd'hui.
              </div>
            }
          />
        </div>
      </main>
    </div>
  );
}
