import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { AiOutlineEye } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import { viewMessages } from "../../services/cdiService";
import PatientMessageModal from "../modals/PatientMessageModal";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

export default function MessageList() {
  const sidebarMargin = useSidebarMargin();
  const [record, setRecord] = useState([]);
  const [filterrecords, setFilterRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- State for Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // --- Modal Handlers ---
  const handleViewDetails = (row) => {
    setSelectedMessage(row);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  const columns = [
    {
      name: "Patient",
      selector: (row) => row.patientname,
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {row.patientname}
          </div>
          <div className="text-xs text-gray-500">N° {row.patientno}</div>
        </div>
      ),
      grow: 2,
    },
    {
      name: "N° Telephone",
      selector: (row) => row?.patienttelephone,
      sortable: true,
    },
    {
      name: "Jour",
      selector: (row) => new Date(row?.createdOn).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Heure",
      selector: (row) => new Date(row?.createdOn).toLocaleTimeString(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="text-primary-600 cursor-pointer hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200 transition-colors duration-200"
          aria-label="View Details"
        >
          <AiOutlineEye size={22} />
        </button>
      ),
      center: true,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // --- Data Fetching & Search ---
  const allClients = () => {
    setLoading(true);
    viewMessages()
      .then((res) => {
        const sortedData = res.data.sort(
          (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
        );
        setRecord(sortedData);
        setFilterRecords(sortedData);
      })
      .catch(() => toast.error("Erreur lors du chargement des messages."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    allClients();
  }, []);

  const search = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const newData = filterrecords.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm)
      )
    );
    setRecord(newData);
  };

  // --- Custom Table Styles for a Modern Look ---
  const tableCustomStyles = {
    header: {
      style: {
        minHeight: "56px",
        backgroundColor: "#f9fafb",
        borderBottom: "1px solid #e5e7eb",
        borderTopLeftRadius: "0.75rem",
        borderTopRightRadius: "0.75rem",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#f9fafb",
        color: "#374151",
        fontSize: "0.875rem",
        fontWeight: "600",
      },
    },
    rows: {
      style: {
        minHeight: "72px",
        "&:not(:last-of-type)": {
          borderBottomStyle: "solid",
          borderBottomWidth: "1px",
          borderBottomColor: "#f3f4f6",
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: "#fdf2f8",
        color: "#9d174d",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e5e7eb",
        borderBottomLeftRadius: "0.75rem",
        borderBottomRightRadius: "0.75rem",
      },
    },
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 flex">
      <SideBar2 />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className={`flex-1 p-6 md:p-8 ml-0 ${sidebarMargin}`}>
          {/* The max-width here is changed to 6xl to reduce the table width */}
          <div className="max-w-6xl mx-auto">
            {/* --- Page Header --- */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Boîte de Réception
              </h1>
            </div>

            {/* --- Data Table Card --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <DataTable
                columns={columns}
                data={record}
                pagination
                responsive
                customStyles={tableCustomStyles}
                highlightOnHover
                pointerOnHover
                progressPending={loading}
                progressComponent={
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                  </div>
                }
                noDataComponent={
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    Aucun message trouvé.
                  </div>
                }
                subHeader
                subHeaderComponent={
                  <div className="relative w-full md:w-auto">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <FiSearch className="h-5 w-5 text-gray-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="Rechercher un message..."
                      className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onChange={search}
                    />
                  </div>
                }
                subHeaderAlign="left"
              />
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <PatientMessageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          messageData={selectedMessage}
        />
      )}
    </div>
  );
}
