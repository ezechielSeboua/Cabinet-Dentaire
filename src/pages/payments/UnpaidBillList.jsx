import { useEffect, useState, useCallback } from "react";
import { allBills } from "../../services/cdiService";
import { getCurrentUser } from "../../services/authService";
import { toast } from "react-toastify";

import { Link } from "react-router-dom";
import { MdPrint, MdOutlineGetApp } from "react-icons/md";
import DataTable from "react-data-table-component";
import { CiEdit } from "react-icons/ci";
import { IoReturnUpBackSharp } from "react-icons/io5";
import * as XLSX from "xlsx";
import UpdateBillModal from "../modals/UpdateBillModal"; // Ensure this path is correct

const NON_ASSURED = ["NA", "NON ASSURE", "NON ASSURÉ", "UNDEFINED", ""];
const hasIns = (name) => !!name && !NON_ASSURED.includes(name.trim().toUpperCase());
const rowHasInsurance = (row) => hasIns(row.insurance) || hasIns(row.insurance2);

const ExpandedComponent = ({ data }) => (
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

export default function UnpaidBills() {
  const [record, setRecord] = useState([]);
  const [filterrecords, setFilterRecords] = useState([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [currentUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);

  const unpaidBills = useCallback(() => {
    setLoading(true);
    allBills()
      .then((res) => {
        const unpaid = res.data.filter(
          (x) => parseFloat(x.amountpaid) < parseFloat(x.partpatient)
        );
        setRecord(unpaid);
        setFilterRecords(unpaid);
      })
      .catch(() => toast.error("Erreur lors du chargement des factures impayées."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    unpaidBills();
  }, [unpaidBills]);

  const handleOpenUpdateModal = (billId) => {
    setSelectedBillId(billId);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedBillId(null);
  };

  const handleUpdateSuccess = () => {
    handleCloseUpdateModal();
    unpaidBills(); // Refresh the data
  };

  // Function to calculate the total unpaid amount
  const getTotalUnpaid = () => {
    return record.reduce(
      (acc, curr) =>
        acc + (parseFloat(curr.partpatient) - parseFloat(curr.amountpaid)),
      0
    );
  };

  const columns = [
    {
      name: "Patient",
      selector: (row) => row.patientname,
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-md text-gray-800">{row.patientname}</div>
          <div className="text-sm text-gray-500">{row.patientno}</div>
        </div>
      ),
      grow: 2, // Allows this column to take more space
    },
    {
      name: "Part Patient",
      selector: (row) =>
        row.partpatient,
      sortable: true,
      cell: (row) => (
        <div className="font-bold text-primary-600 text-md">
          {row.partpatient.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          F CFA
        </div>
      ),
      right: true,
    },
    {
      name: "Montant Payé",
      selector: (row) =>
        row.amountpaid,
      sortable: true,
      cell: (row) => (
        <div className="font-bold text-green-600 text-md">
          {row.amountpaid.toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          F CFA
        </div>
      ),
      right: true,
    },
    {
      name: "Reste à Payer",
      selector: (row) => row.partpatient - row.amountpaid,
      sortable: true,
      cell: (row) => (
        <div className="font-bold text-red-600 text-md">
          {(row.partpatient - row.amountpaid).toLocaleString("fr-FR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          F CFA
        </div>
      ),
      right: true,
    },
    {
      name: "Date Facture",
      selector: (row) => new Date(row.billof).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <Link
            to={`/bill/details/${row.id}`}
            title="Voir et Imprimer la Facture"
            className="p-1 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800"
          >
            <MdPrint className="text-primary-600 dark:text-primary-400" size={20} />
          </Link>
          <button
            onClick={() => handleOpenUpdateModal(row.id)}
            title="Ajouter un versement"
            className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-800"
          >
            <CiEdit className="text-green-600 dark:text-green-400" size={20} />
          </button>
        </div>
      ),
      button: true,
      omit: currentUser?.body?.roles[0]?.toString() === "ACCOUNTANT",
      center: true,
      ignoreRowClick: true,
    },
  ];

  const search = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const newData = filterrecords.filter(
      (row) =>
        row.patientname.toLowerCase().includes(searchTerm) ||
        row.patientno.toLowerCase().includes(searchTerm) ||
        row.billof.toLowerCase().includes(searchTerm) ||
        row.id.toString().includes(searchTerm)
    );
    setRecord(newData);
  };

  const exportToExcel = () => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const fileName = "factures_impayees";

    const ws = XLSX.utils.json_to_sheet(
      record.map((row) => ({
        Patient: row.patientname,
        "N° Patient": row.patientno,
        "Part Patient": row.partpatient,
        "Montant Payé": row.amountpaid,
        "Reste à Payer": row.partpatient - row.amountpaid,
        "Assurance 1": row.insurance,
        "Part Assurance 1": row.partinsurance,
        "Assurance 2": row.insurance2,
        "Part Assurance 2": row.partinsurance2,
        "Date Facture": new Date(row.billof).toLocaleDateString(),
      }))
    );
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName + fileExtension;
    document.body.appendChild(link);
    link.click();
    setTimeout(function () {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const tableHeaderstyle = {
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: "#f3f4f6",
        color: "#1f2937",
        // Dark mode styles
        "@media (prefers-color-scheme: dark)": {
          backgroundColor: "#374151",
          color: "#f9fafb",
        },
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        "&:nth-of-type(odd)": {
          backgroundColor: "#f9fafb",
          // Dark mode styles
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: "#1f2937",
          },
        },
        "&:hover": {
          backgroundColor: "#e5e7eb",
          // Dark mode styles
          "@media (prefers-color-scheme: dark)": {
            backgroundColor: "#374151",
          },
        },
      },
    },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <Link
          to="/bill"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 hover:border-primary-300 transition-all duration-150"
        >
          <IoReturnUpBackSharp size={16} />
          Retour
        </Link>
        <button
          onClick={exportToExcel}
          className="flex items-center cursor-pointer bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all duration-150"
        >
          <MdOutlineGetApp className="mr-2 text-xl" />
          Exporter en Excel
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-x-auto dark:bg-gray-800">
        <DataTable
          title={
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 p-4 dark:text-gray-200">
              Factures Impayées &nbsp;&nbsp;&nbsp;||
              {["ACCOUNTANT", "ADMIN"].includes(
                currentUser?.body?.roles[0]
              ) && (
                <span className="text-right text-lg font-bold text-red-600 dark:text-red-400 mb-4 mr-6 ml-5">
                  Total Impayé :{" "}
                  {getTotalUnpaid().toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  F CFA
                </span>
              )}
            </h2>
          }
          columns={columns}
          data={record}
          pagination
          responsive
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 30]}
          fixedHeader
          fixedHeaderScrollHeight="calc(100vh - 300px)" // Adjust height as needed
          highlightOnHover
          customStyles={tableHeaderstyle}
          progressPending={loading}
          progressComponent={
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          }
          noDataComponent={
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              Aucune facture impayée trouvée.
            </div>
          }
          subHeader
          subHeaderComponent={
            <div className="w-full p-4">
              <input
                type="text"
                placeholder="Rechercher par nom, n°, date..."
                className="w-full md:w-1/2 lg:w-1/3 h-12 px-4 text-md text-gray-900 placeholder-gray-500 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                onChange={search}
              />
            </div>
          }
          subHeaderAlign="left"
          // Expandable Rows Configuration
          expandableRows
          expandableRowsComponent={ExpandedComponent}
          expandableRowDisabled={(row) => !rowHasInsurance(row)}
        />
      </div>

      {isUpdateModalOpen && (
        <UpdateBillModal
          billId={selectedBillId}
          onClose={handleCloseUpdateModal}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
