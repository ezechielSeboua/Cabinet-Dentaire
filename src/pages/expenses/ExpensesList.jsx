import  { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { FaPlus, FaFileInvoiceDollar } from "react-icons/fa";
import Swal from "sweetalert2";
import {  toast } from "react-toastify";
import {
  allExpenses,
  deleteExpense,
  allExpenseType,
} from "../../services/cdiService";
import { getCurrentUser } from "../../services/authService";
import Modal from "react-modal";
import ExpenseForm from "./ExpenseForm";

Modal.setAppElement("#root");

export default function ExpensesList() {
  const isAdmin = getCurrentUser()?.body?.roles?.[0]?.toString() === "ADMIN";
  const [record, setRecord] = useState([]);
  const [filterrecords, setFilterRecords] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const containedModalStyles = {
    content: {
      position: "absolute",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      width: "90%",
      maxWidth: "550px",
      border: "none",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      padding: "0",
      background: "transparent",
      overflow: "visible",
      zIndex: 51,
    },
    overlay: {
      position: "absolute",
      inset: "0",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      borderRadius: "10px",
      zIndex: 50,
    },
  };

  const newTableStyles = {
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        color: "#4a5568",
        backgroundColor: "#f7fafc",
        borderBottom: "2px solid #e2e8f0",
      },
    },
    cells: { style: { padding: "12px", fontSize: "14px" } },
    rows: {
      style: { "&:not(:last-of-type)": { borderBottom: "1px solid #e2e8f0" } },
      highlightOnHoverStyle: {
        backgroundColor: "#fdf2f8",
        transitionDuration: "0.3s",
        transitionProperty: "background-color",
      },
    },
    pagination: { style: { borderTop: "1px solid #e2e8f0", color: "#4a5568" } },
  };

  useEffect(() => {
    ListExpenses();
    fetchExpenseTypes();
  }, []);

  const ListExpenses = () => {
    setLoading(true);
    allExpenses()
      .then((res) => {
        setRecord(res.data);
        setFilterRecords(res.data);
      })
      .catch(() => toast.error("Erreur lors du chargement des dépenses."))
      .finally(() => setLoading(false));
  };

  const fetchExpenseTypes = () => {
    allExpenseType()
      .then((res) => {
        const formattedTypes = res.data.map((type) => ({
          value: type.id,
          label: type.name,
        }));
        setExpenseTypes(formattedTypes);
      })
      .catch(() => toast.error("Erreur lors du chargement des types de dépenses."));
  };

  const columns = [
    {
      name: "Dépense",
      selector: (row) => row.expense,
      sortable: true,
      grow: 2,
    },
    {
      name: "Montant",
      sortable: true,
      right: true,
      selector: (row) => {
        const amount = parseFloat(row.amount);
        return new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(amount);
      },
    },
    {
      name: "Date",
      sortable: true,
      selector: (row) => {
        return new Date(row.createdOn).toLocaleDateString("fr-FR");
      },
    },
    {
      name: "Actions",
      width: "120px",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 rounded-full cursor-pointer hover:bg-green-100 text-green-600 transition-colors"
          >
            <CiEdit size={20} />
          </button>
          {isAdmin && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-2 rounded-full cursor-pointer hover:bg-red-100 text-red-600 transition-colors"
            >
              <MdDelete size={20} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    openModal();
  };

  const handleAdd = () => {
    setSelectedExpense(null);
    openModal();
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
        deleteExpense(id)
          .then(() => {
            ListExpenses();
            toast.success("Dépense supprimée.", { autoClose: 2000 });
          })
          .catch(() => toast.error("Erreur lors de la suppression."));
      }
    });
  };

  const search = (event) => {
    const term = event.target.value.toLowerCase();
    const newData = filterrecords.filter(
      (row) =>
        row.expense.toLowerCase().includes(term) ||
        row.amount.toString().includes(term)
    );
    setRecord(newData);
  };

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  return (
    <div
      id="expenses-list-container"
      className="relative h-full w-full flex flex-col"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 flex-shrink-0 gap-3">
        <input
          type="text"
          placeholder="Rechercher des dépenses..."
          className="w-full sm:w-2/3 h-10 rounded-lg text-black border border-gray-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
          onChange={search}
        />
        <div className="flex gap-2">
          <Link
            to="/expenses/between"
            className="bg-primary-600 text-white cursor-pointer font-bold py-2 px-4 rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <FaFileInvoiceDollar size={14} />
            Rapports
          </Link>
          <button
            className="bg-primary-700 text-white cursor-pointer font-bold py-2 px-4 rounded-lg hover:bg-primary-800 flex items-center gap-2"
            onClick={handleAdd}
          >
            <FaPlus size={14} />
            Ajouter
          </button>
        </div>
      </div>

      <div className="flex-grow min-h-0 border rounded-lg overflow-x-auto">
        <DataTable
          columns={columns}
          data={record}
          pagination
          responsive
          customStyles={newTableStyles}
          highlightOnHover
          fixedHeader
          fixedHeaderScrollHeight="400px"
          progressPending={loading}
          progressComponent={
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          }
          noDataComponent={
            <div className="py-12 text-center text-gray-500">
              Aucune dépense trouvée.
            </div>
          }
        />
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={containedModalStyles}
        parentSelector={() =>
          document.querySelector("#expenses-list-container")
        }
      >
        <ExpenseForm
          closeModal={closeModal}
          refreshList={ListExpenses}
          expense={selectedExpense}
          expenseTypes={expenseTypes}
        />
      </Modal>
    </div>
  );
}
