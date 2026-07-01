import React, { useEffect, useState } from "react";
import { MdDelete, MdAdd } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { CgSpinner } from "react-icons/cg";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { Bounce, toast } from "react-toastify";
import {
  insuranceList,
  deleteInsurance,
  addInsurance, // Import the new services
  updateInsurance,
} from "../../services/cdiService";
import InsuranceModal from "../modals/InsuranceModal";
// import InsuranceModal from "../../components/InsuranceModal"; // Import the new modal component

export default function InsuranceList() {
  // State for data and loading
  const [insurances, setInsurances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State for modal management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [currentInsurance, setCurrentInsurance] = useState(null);


  const showSuccessToast = (message) =>
    toast.success(message, {
      transition: Bounce,
      autoClose: 2000,
      position: "top-center",
    });
  const showErrorToast = (message) =>
    toast.error(message, {
      transition: Bounce,
      autoClose: 2000,
      position: "top-center",
    });
  // Fetch initial data
  const fetchInsurances = async () => {
    setIsLoading(true);
    try {
      const res = await insuranceList();
      const filteredData = res.data.filter((x) => x.insurance !== "NA");
      setInsurances(filteredData);
    } catch (error) {
      console.error("Failed to fetch insurances:", error);
      toast.error("Impossible de charger les données.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsurances();
  }, []);

  // Modal handlers
  const handleOpenAddModal = () => {
    setModalMode("add");
    setCurrentInsurance(null); // Clear any previous edit data
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (insurance) => {
    setModalMode("edit");
    setCurrentInsurance(insurance);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentInsurance(null);
  };

  // CRUD operations
  const handleSave = async (formData) => {
    try {
      if (modalMode === "add") {
        await addInsurance(formData);
        toast.success("Insurance added successfully!");
      } else {
        await updateInsurance(currentInsurance.id, formData);
        toast.success("Insurance updated successfully!");
      }
      fetchInsurances(); // Refresh the list
      handleCloseModal(); // Close the modal on success
    } catch (error) {
      console.error("Failed to save insurance:", error);
      const data = error?.response?.data;
      const serverMsg =
        (typeof data === "string" ? data : null) ||
        data?.message ||
        data?.error ||
        error?.message ||
        "Une erreur est survenue.";
      toast.error(serverMsg, { autoClose: 5000 });
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Es-tu sûr?",
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Annuler",
      confirmButtonText: "Oui, suprimer l'assurance!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteInsurance(id)
          .then(() => {
            showSuccessToast("Insurance deleted.");
            fetchInsurances(); // Refresh list
          })
          .catch((e) => {
            console.error("Delete failed:", e);
            showErrorToast("Failed to delete insurance.");
          });
      }
    });
  };

  // Table columns definition
  const columns = [
    {
      name: <span className="font-semibold">NOM DE L'ASSURANCE</span>,
      selector: (row) => row.insurance,
      sortable: true,
      grow: 2,
    },
    {
      name: <span className="font-semibold">ACTIONS</span>,
      width: "150px",
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="flex items-center cursor-pointer justify-center w-9 h-9 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors"
            title="Modifier"
          >
            <CiEdit size={24} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="flex items-center cursor-pointer justify-center w-9 h-9 bg-red-50 text-rose-500 rounded-full hover:bg-red-100 transition-colors"
            title="Supprimer"
          >
            <MdDelete size={24} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  // Modern styles for the data table
  const customStyles = {
    headRow: {
      style: { backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" },
    },
    headCells: { style: { color: "#4a5568", fontSize: "0.875rem" } },
    rows: { style: { "&:hover": { backgroundColor: "#f1f5f9" } } },
  };

  const filteredInsurances = insurances
    .filter((row) =>
      row.insurance.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.insurance.localeCompare(b.insurance));

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Gestion des Assurances
              </h2>
              <p className="text-sm text-gray-500">
                Ajout, Modification, ou suppression des assurances.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48 h-10 px-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500"
              />
              <button
                onClick={handleOpenAddModal}
                className="flex-shrink-0 flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-700 rounded-lg shadow-sm hover:bg-primary-800"
              >
                <MdAdd size={20} />
                Nouvelle Assurance
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredInsurances}
            customStyles={customStyles}
            pagination
            paginationComponentOptions={{
              rowsPerPageText: "Lignes par page:",
              rangeSeparatorText: "sur",
            }}
            responsive
            highlightOnHover
            progressPending={isLoading}
            progressComponent={
              <div className="py-8">
                <CgSpinner className="animate-spin text-black" size={40} />
              </div>
            }
            noDataComponent={
              <div className="py-12 text-center">No insurances found.</div>
            }
          />
          </div>
        </div>
      </div>

      {/* The Modal for Adding/Editing */}
      <InsuranceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        mode={modalMode}
        insurance={currentInsurance}
      />
    </>
  );
}
// The InsuranceList component manages the list of insurances, allowing users to add, edit, and delete insurance providers.
// It uses a modal for adding and editing insurances, and a data table for displaying the list.
