import React, { useEffect, useState, useMemo, useCallback } from "react";
// import { Link } from 'react-router-dom'; // No longer needed for update
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { Bounce, toast } from "react-toastify";
import { CgSpinner } from "react-icons/cg"; // For loading spinner
import {
  deleteBlog,
  getPublicBlogs,
  saveBlog,
  udpateBlog,
} from "../../services/cdiService"; // Added updateBlog
import BlogModal from "../modals/BlogModal";
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

// A nice, reusable action button for the table
const ActionButton = ({ icon: Icon, onClick, className }) => (
  <button
    onClick={onClick}
    className={`p-1.5 rounded-full transition-colors duration-200 ${className}`}
  >
    <Icon size={20} />
  </button>
);

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State to hold the blog data for editing. `null` means "create mode".
  const [editingBlog, setEditingBlog] = useState(null);

  const fetchBlogs = useCallback(async () => {
    // We only want the main loader on the very first load.
    // For background refreshes, we don't want the whole screen to flash a loading spinner.
    // We can check if the `blogs` array is empty.
    if (blogs.length === 0) {
      setIsLoading(true);
    }

    try {
      const { data } = await getPublicBlogs();
      setBlogs(data);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      // We also might not want to show an error toast on every background failure
      // showErrorToast('Could not load blogs.');
    } finally {
      // Always set loading to false after a fetch
      setIsLoading(false);
    }
    // 2. Add dependencies for useCallback.
    // `setBlogs` and `setIsLoading` are stable and provided by React.
    // However, including `blogs.length` is important because the function's
    // logic depends on it. This is a good practice.
  }, [blogs.length]);

  // --- Initial Data Load ---
  // This effect runs only once on mount to get the initial data.
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]); // Now it's safe to use fetchBlogs as a dependency
  // --- Auto-Refresh Effect ---
  // This effect sets up the interval.
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing blogs...");
      fetchBlogs();
    }, 30000); // 60 seconds
    // Cleanup function is critical
    return () => clearInterval(intervalId);
    // 3. The dependency array now correctly uses the memoized function.
    // Since fetchBlogs is stable, this effect will only run once on mount.
  }, [fetchBlogs]);

  useEffect(() => {
    fetchBlogs();
  }, []);
  const filteredBlogs = useMemo(() => {
    if (!searchTerm) {
      return blogs;
    }
    return blogs.filter((blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [blogs, searchTerm]);
  // --- Event Handlers ---
  const handleDelete = (blogId) => {
    Swal.fire({
      title: "Es-tu sûr?",
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Annuler",
      confirmButtonText: "Oui, suprimer l'article!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Corrected BUG: Pass blogId, not the whole row
        deleteBlog(blogId)
          .then(() => {
            showSuccessToast("L'article a été suprimé!");
            fetchBlogs(); // Refetch data
          })
          .catch((e) => {
            console.error("Deletion error:", e);
            showErrorToast("Failed to delete the blog.");
          });
      }
    });
  };

  // --- NEW HANDLERS FOR MODAL ---
  const handleOpenCreateModal = () => {
    setEditingBlog(null); // Ensure we're in create mode
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (blog) => {
    setEditingBlog(blog); // Pass the blog data to be edited
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null); // Always reset on close
  };

  // --- UNIFIED SAVE HANDLER ---
  const handleSave = async (blogData) => {
    try {
      if (blogData.id) {
        // UPDATE MODE
        await udpateBlog(blogData.id, blogData); // Assumes updateBlog(id, data) service
        showSuccessToast("Article mis à jour avec success!");
      } else {
        // CREATE MODE
        await saveBlog(blogData);
        showSuccessToast("Nouvel article crée avec success!");
      }
      handleCloseModal();
      fetchBlogs(); // Refresh the list
    } catch (error) {
      console.error("Save error:", error);
      showErrorToast("Failed to save the blog.");
    }
  };

  // --- UPDATED DATATABLE CONFIGURATION ---
  const columns = [
    {
      name: "Titre",
      selector: (row) => row.title,
      sortable: true,
      style: { fontWeight: "600", color: "#1f2937" },
    },
    {
      name: "Extrait de contenu",
      selector: (row) => `${row.blogContent.substring(0, 70)}...`,
      grow: 2, // Allow this column to take more space
    },
    {
      name: "Actions",
      width: "120px",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={CiEdit}
            onClick={() => handleOpenEditModal(row)}
            className="flex items-center cursor-pointer justify-center w-9 h-9 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors"
          />
          <ActionButton
            icon={MdDelete}
            onClick={() => handleDelete(row.id)}
            className="flex items-center cursor-pointer justify-center w-9 h-9 bg-red-50 text-rose-500 rounded-full hover:bg-red-100 transition-colors"
          />
        </div>
      ),
    },
  ];

  // Custom styles for a cleaner, modern table
  const customTableStyles = {
    header: {
      style: {
        minHeight: "56px",
      },
    },
    headRow: {
      style: {
        borderTopStyle: "solid",
        borderTopWidth: "1px",
        borderTopColor: "#e5e7eb", // gray-200
        backgroundColor: "#f9fafb", // gray-50
      },
    },
    headCells: {
      style: {
        color: "#4b5563", // gray-600
        fontSize: "12px",
        fontWeight: "bold",
        textTransform: "uppercase",
      },
    },
    cells: {
      style: {
        paddingTop: "12px",
        paddingBottom: "12px",
      },
    },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <DataTable
            title="Gestion des Articles"
            columns={columns}
            data={filteredBlogs}
            progressPending={isLoading}
            progressComponent={
              <div className="py-16 flex justify-center items-center gap-2">
                <CgSpinner className="animate-spin" size={24} /> Chargement...
              </div>
            }
            pagination
            paginationComponentOptions={{
              rowsPerPageText: "Lignes par page:",
              rangeSeparatorText: "sur",
            }}
            responsive
            highlightOnHover
            customStyles={customTableStyles}
            subHeader
            subHeaderComponent={
              <div className="flex flex-col sm:flex-row justify-between w-full items-center p-4 gap-4">
                <input
                  type="text"
                  placeholder="Rechercher par titre..."
                  className="w-full sm:w-1/3 h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className="flex-shrink-0 flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-700 rounded-lg shadow-sm hover:bg-primary-800"
                  onClick={handleOpenCreateModal}
                >
                  + Nouvel Article
                </button>
              </div>
            }
          />
        </div>
      </div>

      <BlogModal
        // The key now depends on whether we are editing or not, to force a reset
        key={editingBlog ? editingBlog.id : "create"}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editingBlog}
      />
    </div>
  );
}
