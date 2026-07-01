import React, { useRef, useState } from "react";
import Header from "../../components/Header";
import { getCurrentUser } from "../../services/authService";
import SideBar2 from "../../components/SideBar2";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import { MdPrint } from "react-icons/md";
import { FaFileExcel } from "react-icons/fa";
import { API_URL } from "../../utils/config";
import { toast } from "react-toastify";
import { IoReturnUpBackSharp } from "react-icons/io5";
import * as XLSX from "xlsx";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

const NON_ASSURED = ["NA", "NON ASSURE", "NON ASSURÉ", "UNDEFINED", ""];
const hasIns = (name) => !!name && !NON_ASSURED.includes(name.trim().toUpperCase());
const rowHasInsurance = (row) => hasIns(row.insurance) || hasIns(row.insurance2);

const ExpandedComponent = ({ data }) => {
  const remainingToPay = (data.partpatient || 0) - (data.amountpaid || 0);

  return (
    <div className="p-4 bg-gray-200 dark:bg-gray-700 text-sm text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hasIns(data.insurance) && (
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h5 className="font-bold text-gray-900 dark:text-white mb-2">
              {data.insurance}
            </h5>
            <p>
              <strong>Prise en charge:</strong>{" "}
              {data.partinsurance?.toLocaleString("fr-FR") ?? 0} F CFA
            </p>
          </div>
        )}

        {hasIns(data.insurance2) && (
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h5 className="font-bold text-gray-900 dark:text-white mb-2">
              {data.insurance2}
            </h5>
            <p>
              <strong>Prise en charge:</strong>{" "}
              {data.partinsurance2?.toLocaleString("fr-FR") ?? 0} F CFA
            </p>
          </div>
        )}

        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h5 className="font-bold text-gray-900 dark:text-white mb-2">
            Détails du Paiement
          </h5>
          <p>
            <strong>Coût Total:</strong>{" "}
            {(+data.treatmentamount)?.toLocaleString("fr-FR") ?? 0} F CFA
          </p>
          <p>
            <strong>Montant à payer:</strong>{" "}
            {data.partpatient?.toLocaleString("fr-FR") ?? 0} F CFA
          </p>
          <p>
            <strong>Montant réglé:</strong>{" "}
            {data.amountpaid?.toLocaleString("fr-FR") ?? 0} F CFA
          </p>
          <p className="font-bold text-red-500">
            <strong>Reste à régler:</strong>{" "}
            {remainingToPay.toLocaleString("fr-FR")} F CFA
          </p>
        </div>
      </div>
    </div>
  );
};

export default function IntervalBill() {
  const sidebarMargin = useSidebarMargin();
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [currentUser] = useState(getCurrentUser());

  const tableHeaderstyle = {
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: "#f3f4f6",
        color: "#1f2937",
        textTransform: "uppercase",
      },
    },
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error("Veuillez sélectionner une date de début et de fin.", {
        theme: "dark",
      });
      return;
    }
    const url = `${API_URL}/payment/${startDate}/${endDate}`;

    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error("La réponse du réseau n'était pas valide");
      const d = await response.json();
      setData(d);
      toast.success("Rapport généré avec succès!", { autoClose: 1000 });
    } catch (err) {
      toast.error(
        "Une erreur est survenue lors de la récupération des données.",
        { theme: "dark" }
      );
    }
  };

  const handleExportExcel = () => {
    if (data.length === 0) {
      toast.warn("Il n'y a aucune donnée à exporter.", { theme: "dark" });
      return;
    }

    const excelData = data.map((bill) => ({
      "ID Facture": bill.id,
      Patient: bill.patientname,
      "Date de Facturation": bill.registeredOn
        ? new Date(bill.registeredOn).toLocaleDateString("fr-FR")
        : "N/A",
      "Assurance 1": bill.insurance || "N/A",
      "Montant Assurance 1": bill.partinsurance || 0,
      "Assurance 2": bill.insurance2 || "N/A",
      "Montant Assurance 2": bill.partinsurance2 || 0,
      "Part Patient": bill.partpatient || 0,
      "Montant Payé": bill.amountpaid || 0,
      "Méthode de Paiement": bill.paymentmethod,
      "Payé Par": bill.paidvia,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Factures");

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [""],
        ["RÉSUMÉ DES TOTAUX"],
        ["Total Part Patient", totalpatient],
        ["Total Déjà Payé", totalsolde],
        ["Total Restant à Payer", totalpatient - totalsolde],
        ["Total Assurance 1", totalinsurance],
        ["Total Assurance 2", totalinsurance2],
        ["Total des Assurances", totalinsurances],
      ],
      { origin: -1 }
    );

    const colWidths = Object.keys(excelData[0]).map((key) => ({
      wch: Math.max(
        ...excelData.map((row) => row[key]?.toString().length ?? 10),
        key.length + 2
      ),
    }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "Rapport_Facturation.xlsx");
  };

  let totalsolde = 0,
    totalpatient = 0,
    totalinsurance = 0,
    totalinsurance2 = 0,
    totalinsurances = 0;

  if (Array.isArray(data)) {
    data.forEach((bill) => {
      totalsolde += bill.amountpaid || 0;
      totalpatient += bill.partpatient || 0;
      totalinsurance += bill.partinsurance || 0;
      totalinsurance2 += bill.partinsurance2 || 0;
    });
    totalinsurances = totalinsurance + totalinsurance2;
  }

  const columns = [
    { name: "#", selector: (row) => row.id, sortable: true, width: "60px" },
    {
      name: "Patient",
      selector: (row) => row.patientname,
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "Part Patient",
      selector: (row) =>
        `${row.partpatient?.toLocaleString("fr-FR") ?? 0} F CFA`,
      sortable: true,
    },
    {
      name: "Payé",
      selector: (row) =>
        `${row.amountpaid?.toLocaleString("fr-FR") ?? 0} F CFA`,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => new Date(row.registeredOn).toLocaleDateString("fr-FR"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <Link
          to={`/bill/details/${row.id}`}
          className="text-primary-500 hover:text-primary-700"
        >
          <MdPrint size={24} />
        </Link>
      ),
      button: true,
      omit: currentUser?.body?.roles[0]?.toString() === "ACCOUNTANT",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
      <SideBar2 />
      <div className="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>
      <div className={`flex-grow h-full ml-0 mt-14 mb-10 p-6 ${sidebarMargin}`}>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            Rapport d'Intervalle de Facturation
          </h1>
          <Link
            to="/bill"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 hover:border-primary-300 transition-all duration-150"
          >
            <IoReturnUpBackSharp size={16} />
            Retour
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700 dark:text-gray-200">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="bg-primary-700 cursor-pointer text-white font-bold py-2 px-4 rounded-md hover:bg-primary-800 transition-all duration-150 h-10"
            >
              Générer le Rapport
            </button>
          </div>
        </div>

        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Recette Totale (F CFA)
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                {totalsolde.toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Total Part Patient
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                {totalpatient.toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Total Assurances
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-primary-600">
                {totalinsurances.toLocaleString("fr-FR")}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex cursor-pointer items-center gap-2 bg-primary-600 text-white font-bold py-2 px-4 rounded-md hover:bg-primary-700"
                >
                  <FaFileExcel /> Exporter en Excel
                </button>
              </div>
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
                customStyles={tableHeaderstyle}
                expandableRows
                expandableRowsComponent={ExpandedComponent}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
