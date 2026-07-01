import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { Bounce, toast } from "react-toastify";
import { deleteUser, usersList } from "../../services/cdiService";
import NewUserModal from "../modals/NewUserModal";
import { FaSearch } from "react-icons/fa";
import { RiUserAddFill } from "react-icons/ri";
import { CiEdit } from "react-icons/ci";
// Import the new modal component
// import NewUserModal from "./NewUserModal";

const ROLE_LABEL = {
  ADMIN: "Administrateur",
  DOCTOR: "Médecin dentiste",
  CASHIER: "Caissier",
  ACCOUNTANT: "Comptable",
  PATIENT: "Patient",
};

export default function UsersList() {
  const [record, setRecord] = useState([]);
  const [filterrecords, setFilterRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  // Custom styles for the toast notifications
  const showSuccessToast = (message) =>
    toast.success(message, {
      transition: Bounce,
      autoClose: 2000,
      position: "top-center",
    });
  const showErrorToast = (message) =>
    toast.error(message, {
      transition: Bounce,
      autoClose: 3000,
      position: "top-center",
    });
  // Fetch all users on component mount
  const allUsers = () => {
    usersList()
      .then((res) => {
        setRecord(res.data);
        setFilterRecords(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        toast.error("Impossible de charger la liste des utilisateurs.");
      });
  };

  useEffect(() => {
    allUsers();
  }, []);

  // Handle opening the modal for creating or editing a user
  // const handleOpenAddModal = () => {
  //   setEditingUser(null); // Ensure no user data is passed for adding
  //   setIsModalOpen(true);
  // };

  const handleOpenEditModal = (user) => {
    setEditingUser(user); // Pass the selected user's data
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null); // Clean up state on close
  };

  const handleSuccess = () => {
    allUsers(); // Refresh the user list
    handleCloseModal(); // Close the modal
  };

  // Filter records based on search term
  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const newData = filterrecords.filter(
      (row) =>
        `${row.firstname} ${row.lastname}`
          .toLowerCase()
          .includes(lowercasedTerm) ||
        row.email.toLowerCase().includes(lowercasedTerm) ||
        row.telephone.toLowerCase().includes(lowercasedTerm)
    );
    setRecord(newData);
  }, [searchTerm, filterrecords]);

  // Columns definition for the DataTable
  const columns = [
    {
      name: "Utilisateur",
      selector: (row) => `${row.firstname} ${row.lastname}`,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center space-x-3 py-2">
          <div>
            <div className="font-bold text-gray-800">{`${row.firstname} ${row.lastname}`}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      name: "Rôle",
      selector: (row) => row.roles[0]?.name,
      cell: (row) => {
        const role = row.roles[0]?.name;
        return ROLE_LABEL[role] || role;
      },
      sortable: true,
    },
    {
      name: "Téléphone",
      selector: (row) => row.telephone,
      sortable: true,
    },

    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center space-x-4">
          {/* The Edit button now calls handleOpenEditModal */}
          <button onClick={() => handleOpenEditModal(row)} title="Modifier">
            <CiEdit
              size={22}
              className="text-primary-600 hover:text-primary-800 cursor-pointer"
            />
          </button>
          <button onClick={() => handleDelete(row.userId)} title="Supprimer">
            <MdDelete
              size={22}
              className="text-red-600 hover:text-red-800 cursor-pointer"
            />
          </button>
        </div>
      ),
      width: "120px", // Fixed width for the actions column
    },
  ];

  // Custom styles for a modern table design
  const customStyles = {
    header: {
      style: {
        padding: 0,
      },
    },
    headRow: {
      style: {
        backgroundColor: "#f8fafc", // Light gray background for header
        borderBottomWidth: "2px",
        borderBottomColor: "#e5e7eb",
      },
    },
    headCells: {
      style: {
        color: "#4b5563", // Darker gray for header text
        fontSize: "12px",
        fontWeight: "bold",
        textTransform: "uppercase",
      },
    },
    rows: {
      style: {
        minHeight: "60px", // Taller rows for better spacing
        "&:not(:last-of-type)": {
          borderBottomStyle: "solid",
          borderBottomWidth: "1px",
          borderBottomColor: "#e5e7eb",
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: "#f3f4f6",
        color: "#1f2937",
      },
    },
    pagination: {
      style: {
        borderTop: "none",
        color: "#6b7280",
      },
    },
  };

  const handleDelete = (userId) => {
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Cette action est irréversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer!",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(userId)
          .then(() => {
            showSuccessToast("L'utilisateur a été supprimé.", {
              transition: Bounce,
            });
            allUsers();
          })
          .catch((e) => {
            console.log("Erreur de la suppression", e);
            showErrorToast("Erreur lors de la suppression.");
          });
      }
    });
  };

  return (
    // Main container with a soft background color
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Card Header: Title and Add User Button */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Gestion des Utilisateurs
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Ajoutez, modifiez ou supprimez des utilisateurs de la
                plateforme.
              </p>
            </div>
            <button
              className="flex-shrink-0 flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-700 rounded-lg shadow-sm hover:bg-primary-800"
              onClick={() => setIsModalOpen(true)}
            >
              <RiUserAddFill size={14} />
              Nouvel utilisateur
            </button>
          </div>
        </div>

        {/* Toolbar: Search input */}
        <div className="p-6">
          <div className="relative max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FaSearch className="text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={record}
            pagination
            paginationComponentOptions={{
              rowsPerPageText: "Lignes par page:",
              rangeSeparatorText: "sur",
            }}
            responsive
            highlightOnHover
            customStyles={customStyles}
            noHeader // We are using our own custom header and search
            noDataComponent={
              <div className="p-8 text-center text-gray-500">
                Aucun utilisateur trouvé.
              </div>
            }
          />
        </div>
      </div>

      {/* The decoupled modal is called here */}
      <NewUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        currentUser={editingUser} // Pass the user to be edited (or null)
      />
    </div>
  );
}
