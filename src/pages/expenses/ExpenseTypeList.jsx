import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import {  toast } from "react-toastify";
import { allExpenseType, deleteExpenseType } from "../../services/cdiService";
import { getCurrentUser } from "../../services/authService";
import Modal from "react-modal";
import ExpenseTypes from "./ExpenseTypes";

Modal.setAppElement("#root");

export default function ExpenseTypeList() {
  const isAdmin = getCurrentUser()?.body?.roles?.[0]?.toString() === "ADMIN";
  const [record, setRecord] = useState([]);
  const [filterrecords, setFilterRecords] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  const containedModalStyles = {
    content: {
      position: "absolute",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      width: "80%",
      maxWidth: "500px",
      border: "1px solid #ccc",
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
    cells: {
      style: {
        padding: "12px",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        "&:not(:last-of-type)": {
          borderBottom: "1px solid #e2e8f0",
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: "#fdf2f8",
        transitionDuration: "0.3s",
        transitionProperty: "background-color",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e2e8f0",
        color: "#4a5568",
      },
    },
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      grow: 2,
    },
    {
      name: "Actions",
      width: "120px",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 rounded-full cursor-pointer  hover:bg-green-100 text-green-600 transition-colors"
          >
            <CiEdit size={20} />
          </button>
          {/* {isAdmin && ( )} */}
            <button
              onClick={() => handleDelete(row.id)}
              className="p-2 rounded-full cursor-pointer hover:bg-red-100 text-red-600 transition-colors"
            >
              <MdDelete size={20} />
            </button>
         
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
        deleteExpenseType(id)
          .then(() => {
            ListExpenses();
            toast.success("Le type de dépense a été supprimé.", {
              autoClose: 1000,
            });
          })
          .catch(() => {
            toast.error("Erreur lors de la suppression.", {
              autoClose: 1000,
            });
          });
      }
    });
  };

  const ListExpenses = () => {
    setLoading(true);
    allExpenseType()
      .then((res) => {
        setRecord(res.data);
        setFilterRecords(res.data);
      })
      .catch(() => toast.error("Erreur lors du chargement des types de dépenses."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    ListExpenses();
  }, []);

  const search = (event) => {
    const newData = filterrecords.filter((row) =>
      row.name.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setRecord(newData);
  };

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  return (
    <div
      id="expense-type-list-container"
      className="relative h-full w-full flex flex-col"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 flex-shrink-0 gap-3">
        <input
          type="text"
          placeholder="Rechercher un type..."
          className="w-full sm:w-2/3 h-10 rounded-lg text-black border border-gray-300 py-1 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          onChange={search}
        />
        <button
          className="bg-primary-700 text-white cursor-pointer font-bold py-2 px-4 rounded-lg hover:bg-primary-800 flex items-center gap-2 transition-transform transform hover:scale-105 self-start sm:self-auto"
          onClick={handleAdd}
        >
          <FaPlus size={14} />
          Ajouter
        </button>
      </div>

      <div className="border rounded-lg overflow-x-auto flex-grow min-h-0">
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
              Aucun type de dépense trouvé.
            </div>
          }
        />
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={containedModalStyles}
        parentSelector={() =>
          document.querySelector("#expense-type-list-container")
        }
      >
        <ExpenseTypes
          closeModal={closeModal}
          refreshList={ListExpenses}
          expense={selectedExpense}
        />
      </Modal>
    </div>
  );
}
