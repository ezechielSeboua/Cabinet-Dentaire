import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MdDelete, MdPrint } from "react-icons/md";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { CiCalendarDate, CiEdit } from "react-icons/ci";
import { Bounce, toast } from "react-toastify";
import { FaMinus, FaArrowsAltH } from "react-icons/fa";
import { GiCash } from "react-icons/gi";
import { getCurrentUser } from "../../services/authService";

// Services
import { allBills, deleteBill } from "../../services/cdiService";

// Modal Components
import PaymentModal from "../modals/PaymentModal";
import UpdateBillModal from "../modals/UpdateBillModal";
import PrintModal from "../modals/PrintModal"; // The new modal for PDF printing

export default function PaymentList() {
  const [uncompletedBill, setUncompletedBill] = useState([]);
  const [filterrecords, setFilterRecords] = useState([]);
  const [currentUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);

  // State for the "Add Payment" modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State for the "Update Bill" modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);

  // State for the "Print Preview" modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [billToPrintId, setBillToPrintId] = useState(null);

  /**
   * Fetches all bills, filters for unpaid ones, and updates the component state.
   */
  const fetchUnpaidBills = () => {
    setLoading(true);
    allBills()
      .then((res) => {
        const unpaid = res.data.filter(
          (bill) => parseFloat(bill.amountpaid) < parseFloat(bill.partpatient)
        );
        setUncompletedBill(unpaid);
        setFilterRecords(unpaid);
      })
      .catch(() => {
        toast.error("Erreur lors du chargement des factures.");
      })
      .finally(() => setLoading(false));
  };

  const userRole = useMemo(
    () => currentUser?.body?.roles[0]?.toString(),
    [currentUser]
  );
  // Fetch data when the component mounts
  useEffect(() => {
    fetchUnpaidBills();
  }, [userRole, currentUser]);

  /**
   * Handlers for the "Update Bill" modal
   */
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
    fetchUnpaidBills(); // Refresh the data list
  };

  /**
   * Handlers for the "Add Payment" modal
   */
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleAddPaymentSuccess = () => {
    handleCloseAddModal();
    fetchUnpaidBills(); // Refresh the data list
  };

  /**
   * Handlers for the "Print Preview" modal
   */
  // const handleOpenPrintModal = (billId) => {
  //   setBillToPrintId(billId);
  //   setIsPrintModalOpen(true);
  // };

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setBillToPrintId(null);
  };

  /**
   * Handles the deletion of a bill with a confirmation dialog.
   * @param {number} id - The ID of the bill to delete.
   */
  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Vous ne pourrez pas annuler cette opération!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimez!",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBill(id)
          .then(() => {
            toast.success("La facture a été supprimée.", {
              position: "top-right",
              autoClose: 2000,
              theme: "colored",
              transition: Bounce,
            });
            fetchUnpaidBills(); // Refresh the data list
          })
          .catch((e) => {
            console.error("Error deleting bill:", e);
            toast.error("Erreur lors de la suppression de la facture.");
          });
      }
    });
  };

  /**
   * Filters the displayed bills based on the search input.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const search = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const newData = filterrecords.filter(
      (row) =>
        row.patientname.toLowerCase().includes(searchTerm) ||
        row.patientno.toLowerCase().includes(searchTerm)
    );
    setUncompletedBill(newData);
  };

  console.log("LOGGED IN USER ROLE=? ", userRole);
  // Column definitions for the DataTable
  const columns = [
    {
      name: "Patient",
      selector: (row) => row.patientname,
      sortable: true,
      grow: 3,
      cell: (row) => (
        <div className="py-2">
          <div className="font-bold text-gray-800">{row.patientname}</div>
          <div className="text-sm text-gray-500">{row.patientno}</div>
        </div>
      ),
    },
    {
      name: "Montants",
      sortable: true,
      sortFunction: (a, b) =>
        a.partpatient - a.amountpaid - (b.partpatient - b.amountpaid),
      grow: 2,
      cell: (row) => (
        <div>
          <div className="font-semibold">
            <span className="text-xs text-gray-500">Reste: </span>
            <span className="text-red-600">
              {(
                parseFloat(row.partpatient) - parseFloat(row.amountpaid)
              ).toLocaleString("fr-FR")}{" "}
              F
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Payé: {parseFloat(row.amountpaid).toLocaleString("fr-FR")} F
          </div>
        </div>
      ),
    },
    {
      name: "Assurances",
      grow: 2,
      cell: (row) => (
        <div className="flex flex-col items-start gap-1 py-2">
          {row.insurance && (
            <span className="px-2 py-1 text-xs font-medium text-primary-800 bg-primary-100 rounded-full">
              {row.insurance}
            </span>
          )}
          {row.insurance2 && (
            <span className="px-2 py-1 text-xs font-medium text-primary-800 bg-primary-100 rounded-full">
              {row.insurance2}
            </span>
          )}
          {!row.insurance && !row.insurance2 && (
            <span className="px-2 py-1 text-xs text-gray-500">
              NA || NON ASSURE{" "}
            </span>
          )}
        </div>
      ),
    },
    {
      name: "Date",
      selector: (row) => new Date(row.registeredOn),
      sortable: true,
      cell: (row) => new Date(row.registeredOn).toLocaleDateString("fr-FR"),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center space-x-4">
          {/* Hide print buttons for DOCTOR */}
          {userRole !== "DOCTOR" && (
            <>
              <Link
                to={`/bill/print/${row.id}`}
                title="Imprimer ticket thermique"
              >
                <MdPrint
                  className="text-primary-600 hover:text-primary-700 transition-colors"
                  size={22}
                />
              </Link>
              {/* <Link
                to={`/bill/details/${row.id}`}
                title="Voir détails / Imprimer A4"
                className="text-xs text-gray-500 hover:text-primary-700 transition-colors font-semibold"
              >
                A4
              </Link> */}
            </>
          )}

          {userRole !== "ACCOUNTANT" && (
            <button
              onClick={() => handleOpenUpdateModal(row.id)}
              title="Ajouter un versement"
            >
              <CiEdit
                className="text-green-500 cursor-pointer hover:text-green-600 transition-colors"
                size={22}
              />
            </button>
          )}

          {/* Hide delete button for ACCOUNTANT and CASHIER */}
          {!["CASHIER", "ACCOUNTANT"].includes(userRole) && (
            <button
              onClick={() => handleDelete(row.id)}
              title="Supprimer la facture"
            >
              <MdDelete
                className="text-red-500 cursor-pointer hover:text-red-600 transition-colors"
                size={22}
              />
            </button>
          )}
        </div>
      ),
      width: "140px",
    },
  ];

  // Custom styles for the DataTable
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#F9FAFB",
        borderBottomWidth: "2px",
        borderBottomColor: "#F3F4F6",
        fontSize: "14px",
        fontWeight: "600",
        color: "#4B5563",
      },
    },
    rows: {
      style: {
        minHeight: "60px",
        "&:not(:last-of-type)": { borderBottom: "1px solid #F3F4F6" },
      },
      highlightOnHoverStyle: {
        backgroundColor: "#fdf2f8",
        color: "#be185d",
      },
    },
    pagination: { style: { borderTop: "1px solid #F3F4F6" } },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">
          Factures Impayées
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Factures dont le montant payé est inférieur à la part patient due.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button
          onClick={handleOpenAddModal}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-700 rounded-lg shadow-md hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <GiCash size={16} />
          <span>Ajouter un paiement</span>
        </button>
        <Link
          to={"of-the-day"}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg shadow-sm hover:bg-gray-100"
        >
          <CiCalendarDate size={16} />
          <span>Factures du Jour</span>
        </Link>
        <Link
          to={"unpaid-bills"}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg shadow-sm hover:bg-gray-100"
        >
          <FaMinus size={14} />
          <span>Détail des impayés</span>
        </Link>
        <Link
          to={"between"}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg shadow-sm hover:bg-gray-100"
        >
          <FaArrowsAltH size={14} />
          <span>Rechercher par date</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <DataTable
          columns={columns}
          data={uncompletedBill}
          responsive
          progressPending={loading}
          progressComponent={
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          }
          pagination
          customStyles={customStyles}
          highlightOnHover
          pointerOnHover
          subHeader
          subHeaderComponent={
            <div className="w-full p-4 flex justify-end">
              <input
                type="text"
                placeholder="Rechercher par patient..."
                className="w-full md:w-1/3 h-10 rounded-lg border border-gray-300 px-4 text-sm focus:ring-primary-500 focus:border-primary-500"
                onChange={search}
              />
            </div>
          }
          noDataComponent={
            <div className="py-12 text-center text-gray-500">
              Aucune facture impayée trouvée.
            </div>
          }
        />
      </div>

      {/* Render Modals Conditionally */}
      {isAddModalOpen && (
        <PaymentModal
          onClose={handleCloseAddModal}
          onPaymentSuccess={handleAddPaymentSuccess}
        />
      )}

      {isUpdateModalOpen && (
        <UpdateBillModal
          billId={selectedBillId}
          onClose={handleCloseUpdateModal}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}

      {isPrintModalOpen && (
        <PrintModal billId={billToPrintId} onClose={handleClosePrintModal} />
      )}
    </div>
  );
}
