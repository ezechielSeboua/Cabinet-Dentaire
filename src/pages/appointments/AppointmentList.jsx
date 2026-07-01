import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../../services/authService";
import { MdDelete, MdAdd, MdSearch } from "react-icons/md";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { CiEdit } from "react-icons/ci";
import { Bounce, toast } from "react-toastify";
import { allAppointments, deleteAppointment } from "../../services/cdiService";
import { FaCalendarAlt, FaUserClock, FaHistory } from "react-icons/fa";
import formatDate from "../../components/Common/DateFormating";

// Import all three required modal components
import AppointmentFormModal from "../modals/AppointmentFormModal";
import PatientSelectionModal from "../modals/PatientSelectionModal";
import MissedAppointmentsModal from "../modals/MissedAppointmentsModal";

export default function AppointmentList() {
  const [currentUser] = useState(getCurrentUser());
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State to manage the visibility of ALL modals from this one page
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAppointmentFormModalOpen, setIsAppointmentFormModalOpen] =
    useState(false);
  const [isMissedModalOpen, setIsMissedModalOpen] = useState(false);

  // State to pass data to the modals
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const statusStyles = {
    Confirmé: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Annulé: "bg-rose-100 text-rose-800 border-rose-200",
    "En attente": "bg-amber-100 text-amber-800 border-amber-200",
    Terminé: "bg-primary-100 text-primary-800 border-primary-200",
  };

  const columns = [
    {
      name: (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Patient
        </span>
      ),
      selector: (row) => row.patientname,
      sortable: true,
      minWidth: "220px",
      cell: (row) => (
        <div className="flex items-center space-x-3 py-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center border border-primary-200">
            <span className="text-primary-600 font-medium">
              {row.patientname
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.patientname}</div>
            <div className="text-xs text-gray-500">ID: {row.patientno}</div>
          </div>
        </div>
      ),
    },
    {
      name: (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Docteur
        </span>
      ),
      width: "140px",
      cell: (row) => <span> {row.doctorname}</span>,

      sortable: true,
    },
    {
      name: (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Date/Heure
        </span>
      ),
      minWidth: "160px",
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex items-center text-gray-700">
            <FaCalendarAlt className="mr-2 text-gray-400 text-sm" />
            <span className="font-medium">
              {formatDate(row.rendezvousdate)}
            </span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <FaUserClock className="mr-2 text-gray-400 text-sm" />
            {row.rendezvoustime?.substring(0, 5)}
          </div>
        </div>
      ),
      sortable: true,
      sortFunction: (a, b) =>
        new Date(`${a.rendezvousdate} ${a.rendezvoustime}`) -
        new Date(`${b.rendezvousdate} ${b.rendezvoustime}`),
    },
    {
      name: (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          No Telephone
        </span>
      ),
      width: "140px",
      cell: (row) => <span>{row.patienttelephone}</span>,
      sortable: true,
    },

    {
      name: (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Statut
        </span>
      ),
      width: "140px",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            statusStyles[row.status] ||
            "bg-gray-100 text-gray-800 border-gray-200"
          }`}
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Actions
        </span>
      ),
      width: "120px",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="flex items-center  cursor-pointer justify-center w-8 h-8 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100"
            title="Modifier"
            aria-label="Modifier le rendez-vous"
          >
            <CiEdit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="flex items-center cursor-pointer justify-center w-8 h-8 bg-red-50 text-rose-500 rounded-full hover:bg-rose-100"
            title="Supprimer"
            aria-label="Supprimer le rendez-vous"
          >
            <MdDelete size={18} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];
  const patientColumns = [columns[0], columns[1], columns[3]];

  const loadAppointments = () => {
    setLoading(true);
    allAppointments()
      .then((res) => {
        const today = new Date().toISOString().split("T")[0];
        const data = Array.isArray(res?.data) ? res.data : [];
        let filteredData = data.filter(
          (x) => x.status !== "Terminé" && x.rendezvousdate >= today,
        );
        const userRole = currentUser?.body?.roles[0]?.toString();
        const userId = currentUser?.body?.id;
        const useremail = currentUser?.body?.email;

        if (userRole === "DOCTOR") {
          filteredData = filteredData.filter(
            (x) => parseInt(x.doctor) === parseInt(userId),
          );
        } else if (userRole === "PATIENT") {
          filteredData = filteredData.filter(
            (x) => x.patientemail === useremail,
          );
        }

        filteredData.sort((a, b) => {
          const dateCompare = a.rendezvousdate?.localeCompare(b.rendezvousdate ?? "") ?? 0;
          if (dateCompare !== 0) return dateCompare;
          return (a.rendezvoustime ?? "").localeCompare(b.rendezvoustime ?? "");
        });

        setAppointments(filteredData);
        setFilteredAppointments(filteredData);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Impossible de charger les rendez-vous.");
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Confirmer la suppression",
      text: "Voulez-vous vraiment supprimer ce rendez-vous?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAppointment(id)
          .then(() => {
            loadAppointments();
            toast.success("Rendez-vous supprimé", { transition: Bounce });
          })
          .catch(() => toast.error("Erreur lors de la suppression"));
      }
    });
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // --- MODIFIED useEffect for search ---
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAppointments(appointments);
      return;
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase();

    const filtered = appointments.filter((row) => {
      // The original generic search logic
      const genericMatch = Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lowercasedSearchTerm),
      );

      // New specific search logic for the date in dd-mm-YYYY format
      let dateMatch = false;
      if (row.rendezvousdate) {
        // Assuming rendezvousdate is in 'YYYY-MM-DD' format from the database
        const dateParts = row.rendezvousdate.split("-");
        if (dateParts.length === 3) {
          const [year, month, day] = dateParts;
          const formattedDate = `${day}-${month}-${year}`; // Convert to DD-MM-YYYY
          if (formattedDate.includes(lowercasedSearchTerm)) {
            dateMatch = true;
          }
        }
      }

      return genericMatch || dateMatch;
    });

    setFilteredAppointments(filtered);
  }, [searchTerm, appointments]);

  const appointmentStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    const in7DaysStr = in7Days.toISOString().split("T")[0];

    return {
      today: appointments.filter((a) => a.rendezvousdate === today).length,
      thisWeek: appointments.filter(
        (a) => a.rendezvousdate >= today && a.rendezvousdate <= in7DaysStr,
      ).length,
      confirmed: appointments.filter((a) => a.status === "Confirmé").length,
      pending: appointments.filter((a) => a.status === "En attente").length,
    };
  }, [appointments]);

  const customStyles = {
    /* Your custom styles here */
  };

  // --- HANDLER FUNCTIONS FOR ALL MODAL INTERACTIONS ---

  // CREATE FLOW
  const handleOpenPatientModal = () => setIsPatientModalOpen(true);
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setIsPatientModalOpen(false);
    setIsAppointmentFormModalOpen(true);
  };

  // EDIT FLOW (can be triggered from the main list OR the missed appointments modal)
  const handleOpenEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setIsMissedModalOpen(false); // Close missed modal if it was open
    setIsAppointmentFormModalOpen(true);
  };

  // MISSED APPOINTMENTS FLOW
  const handleOpenMissedModal = () => setIsMissedModalOpen(true);

  // UNIFIED HANDLERS FOR THE FORM MODAL
  const handleCloseFormModal = () => {
    setIsAppointmentFormModalOpen(false);
    setEditingAppointment(null);
    setSelectedPatient(null);
  };

  const handleSuccess = () => {
    loadAppointments(); // Always refresh the main list
    handleCloseFormModal();
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary-400">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Aujourd'hui
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-primary-600 mt-1">
                {appointmentStats.today}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-400">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Cette semaine
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-500 mt-1">
                {appointmentStats.thisWeek}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-emerald-400">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Confirmés
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-500 mt-1">
                {appointmentStats.confirmed}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-400">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                En attente
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-500 mt-1">
                {appointmentStats.pending}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Gestion des Rendez-vous
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {currentUser?.body?.roles[0]?.toString() === "DOCTOR"
                    ? "Vos rendez-vous à venir"
                    : "Liste des rendez-vous"}
                </p>
              </div>
              <div className="flex flex-shrink-0 flex-wrap gap-2 sm:gap-3">
                {(currentUser?.body?.roles[0]?.toString() === "DOCTOR" ||
                  currentUser?.body?.roles[0]?.toString() === "CASHIER" ||
                  currentUser?.body?.roles[0]?.toString() === "ADMIN") && (
                  <button
                    onClick={handleOpenPatientModal}
                    className="flex-shrink-0 flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-700 rounded-lg shadow-sm hover:bg-primary-800"
                  >
                    <MdAdd size={18} />
                    Nouveau rendez-vous
                  </button>
                )}
                <button
                  onClick={handleOpenMissedModal}
                  className="inline-flex flex-shrink-0 cursor-pointer items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg shadow-sm hover:bg-red-50 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                >
                  <FaHistory size={14} />
                  Rendez-vous manqués
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="mb-6">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    // --- MODIFIED placeholder ---
                    placeholder="Rechercher (Nom, No, Tel, Date[AAAA-MM-JJ] ou [JJ-MM-AAAA])"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <DataTable
                  columns={
                    currentUser?.body?.roles[0]?.toString() === "PATIENT"
                      ? patientColumns
                      : columns
                  }
                  data={filteredAppointments}
                  pagination
                  paginationPerPage={10}
                  paginationRowsPerPageOptions={[10, 25, 50]}
                  paginationComponentOptions={{
                    rowsPerPageText: "Lignes par page:",
                    rangeSeparatorText: "sur",
                  }}
                  fixedHeader
                  fixedHeaderScrollHeight="calc(100vh - 400px)"
                  highlightOnHover
                  customStyles={customStyles}
                  progressPending={loading}
                  progressComponent={
                    <div className="py-12 flex justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                  }
                  noDataComponent={
                    <div className="py-12 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-base font-medium text-gray-900">
                        Aucun rendez-vous trouvé
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm
                          ? "Essayez une autre recherche"
                          : "Aucun rendez-vous programmé pour le moment"}
                      </p>
                    </div>
                  }
                  responsive
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER ALL THREE MODALS HERE, THEIR VISIBILITY IS CONTROLLED BY STATE */}

      <PatientSelectionModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onPatientSelect={handlePatientSelect}
      />

      <MissedAppointmentsModal
        isOpen={isMissedModalOpen}
        onClose={() => setIsMissedModalOpen(false)}
        onEditAppointment={handleOpenEditModal}
      />

      <AppointmentFormModal
        isOpen={isAppointmentFormModalOpen}
        onClose={handleCloseFormModal}
        onSuccess={handleSuccess}
        patient={selectedPatient}
        existingAppointment={editingAppointment}
      />
    </>
  );
}
