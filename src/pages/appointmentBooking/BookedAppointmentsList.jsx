import { useEffect, useState, useCallback } from "react";
import * as authService from "../../services/authService";
import { MdEditCalendar, MdSearch, MdDelete } from "react-icons/md";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { Bounce, toast } from "react-toastify";
import {
  getBookedAppointments,
  confirmAppointment,
  updateAppointmentDateTime,
  getAvailableSlots,
  deleteBookedAppointment,
} from "../../services/cdiService";
import { FaCalendarAlt, FaHistory, FaUserClock } from "react-icons/fa";
import formatDate from "../../components/Common/DateFormating";
import { GiConfirmed } from "react-icons/gi";
import ConfirmedBookedAppointmentModal from "../modals/ConfirmedBookedAppointmentModal";

export default function BookedAppointmentsList() {
  const [currentUser] = useState(authService.getCurrentUser());
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmedModalOpen, setIsConfirmedModalOpen] = useState(false);

  const statusStyles = {
    CONFIRMÉ: "bg-green-100 text-green-800 border-green-200",
    ANNULÉ: "bg-rose-100 text-rose-800 border-rose-200",
    "EN SUSPENS": "bg-amber-100 text-amber-800 border-amber-200",
    REPROGRAMMÉ: "bg-orange-100 text-orange-800 border-orange-200",
  };

  const handleConfirm = (appointment) => {
    Swal.fire({
      title: "Confirmer le rendez-vous ?",
      html: `Voulez-vous vraiment confirmer le rendez-vous pour <strong>${
        appointment.patientname
      }</strong> le <strong>${formatDate(
        appointment.rendezvousdate,
      )}</strong> ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Oui, confirmer",
      cancelButtonText: "Annuler",
      customClass: {
        confirmButton:
          "px-4 mr-2 py-2 bg-primary-600 cursor-pointer text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2  focus:ring-offset-2 transition-all",
        cancelButton:
          "inline-flex cursor-pointer justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        confirmAppointment(appointment.id)
          .then(() => {
            loadAppointments();
            toast.success("Rendez-vous confirmé avec succès!", {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              transition: Bounce,
            });
          })
          .catch((err) => {
            console.error("Confirmation error:", err);
            toast.error("Erreur lors de la confirmation du rendez-vous.");
          });
      }
    });
  };
  const handleUpdateDateTime = (appointment) => {
    let selectedTime = null;

    Swal.fire({
      width: "42rem",
      html: `
      <div class="text-center mb-4">
          <h2 class="text-lg font-bold text-gray-800">Reprogrammer le rendez-vous</h2>
          <p class="text-sm text-gray-500">Pour <strong>${appointment.patientname}</strong></p>
      </div>
      <style>
          .slot-btn { padding: 0.5rem 1rem; margin: 0.25rem; border: 1px solid #93c5fd; border-radius: 0.375rem; background-color: #f9fafb; color: #374151; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: all 0.2s ease-in-out; }
          .slot-btn:hover { border-color: #9ca3af; background-color: #f3f4f6; }
          .slot-btn.selected { background-color: #0369A1; color: white; border-color: #0369A1; box-shadow: 0 0 0 3px rgb(59 130 246 / 0.4); }
          .slot-btn:disabled { background-color: #e5e7eb; color: #9ca3af; cursor: not-allowed; border-color: #d1d5db; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .loader-spin { animation: spin 1s linear infinite; }
      </style>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div class="md:col-span-2">
              <p class="block text-sm font-semibold text-gray-700 mb-2">1. Choisissez une date</p>
              <input
                  type="date"
                  id="swal-input-date"
                  value="${appointment.rendezvousdate.split("T")[0]}"
                  min="${new Date().toISOString().split("T")[0]}"
                  class="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
          </div>
          <div class="md:col-span-3">
              <p class="block text-sm font-semibold text-gray-700 mb-2">2. Choisissez une heure</p>
              <div id="slots-container" class="p-3 bg-gray-50 border rounded-lg min-h-[100px] max-h-[150px] overflow-y-auto flex flex-wrap justify-center items-center">
              </div>
          </div>
      </div>
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Reprogrammer",
      cancelButtonText: "Annuler",
      customClass: {
        confirmButton:
          "px-4 py-2 bg-primary-700 mr-4 text-white cursor-pointer font-semibold rounded-lg shadow-md hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all",
        cancelButton:
          "inline-flex cursor-pointer justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50",
      },
      buttonsStyling: false,
      didOpen: () => {
        const dateInput = document.getElementById("swal-input-date");
        const slotsContainer = document.getElementById("slots-container");

        const showLoader = () => {
          slotsContainer.innerHTML = `<div class="flex flex-col items-center justify-center text-gray-500"><svg class="loader-spin h-6 w-6 text-primary-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Chargement...</span></div>`;
        };

        const fetchAndRenderSlots = (dateString) => {
          selectedTime = null;
          showLoader();
          getAvailableSlots(dateString)
            .then((res) => {
              slotsContainer.innerHTML = "";
              if (res.data && res.data.length > 0) {
                res.data.forEach((slot) => {
                  const button = document.createElement("button");
                  button.className = "slot-btn";
                  button.textContent = slot.substring(0, 5);
                  button.onclick = () => {
                    const currentlySelected =
                      slotsContainer.querySelector(".slot-btn.selected");
                    if (currentlySelected) {
                      currentlySelected.classList.remove("selected");
                    }
                    button.classList.add("selected");
                    selectedTime = slot;
                  };
                  slotsContainer.appendChild(button);
                });
              } else {
                slotsContainer.innerHTML = `<p class="text-gray-500 text-sm">Aucun créneau disponible.</p>`;
              }
            })
            .catch(() => {
              slotsContainer.innerHTML = `<p class="text-rose-500 text-sm font-medium">Erreur de chargement.</p>`;
            });
        };

        dateInput.addEventListener("change", (e) => {
          fetchAndRenderSlots(e.target.value);
        });

        fetchAndRenderSlots(dateInput.value);
      },
      preConfirm: () => {
        const newDate = document.getElementById("swal-input-date").value;
        if (!newDate) {
          Swal.showValidationMessage("Veuillez sélectionner une date.");
          return false;
        }
        if (!selectedTime) {
          Swal.showValidationMessage(
            "Veuillez sélectionner un créneau horaire.",
          );
          return false;
        }
        return { newDate, newTime: selectedTime };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { newDate, newTime } = result.value;
        updateAppointmentDateTime(appointment.id, newDate, newTime)
          .then(() => {
            loadAppointments();
            toast.success("Rendez-vous reprogrammé avec succès !", {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              transition: Bounce,
            });
          })
          .catch((err) => {
            console.error("Update error:", err);
            toast.error("Erreur lors de la reprogrammation du rendez-vous.");
          });
      }
    });
  };

  const handleDelete = (appointment) => {
    Swal.fire({
      title: "Supprimer la réservation ?",
      html: `Voulez-vous vraiment supprimer la réservation de <strong>${appointment.patientname}</strong> du <strong>${formatDate(appointment.rendezvousdate)}</strong> ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      customClass: {
        confirmButton:
          "px-4 mr-2 py-2 bg-rose-600 cursor-pointer text-white font-semibold rounded-lg hover:bg-rose-700 focus:outline-none transition-all",
        cancelButton:
          "inline-flex cursor-pointer justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteBookedAppointment(appointment.id)
          .then(() => {
            loadAppointments();
            toast.success("Réservation supprimée.", {
              position: "top-center",
              autoClose: 2000,
              transition: Bounce,
            });
          })
          .catch(() => toast.error("Erreur lors de la suppression."));
      }
    });
  };

  const role = currentUser?.body?.roles[0]?.toString();
  const isPatient = role === "PATIENT";
  const canReschedule =
    role === "DOCTOR" || role === "CASHIER" || role === "ADMIN";

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
        <div className="flex items-center space-x-3 py-2">
          <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary-50 flex items-center justify-center border border-primary-200">
            <span className="text-primary-700 text-xs font-bold">
              {row.patientname
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </span>
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-900">
              {row.patientname}
            </div>
            <div className="text-xs text-gray-500">{row.patienttelephone}</div>
            {row.email && (
              <div className="text-xs text-gray-400 truncate max-w-[160px]">
                {row.email}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      name: (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Date / Heure
        </span>
      ),
      width: "160px",
      sortable: true,
      sortFunction: (a, b) =>
        new Date(`${a.rendezvousdate}T${a.rendezvoustime}`) -
        new Date(`${b.rendezvousdate}T${b.rendezvoustime}`),
      cell: (row) => (
        <div className="space-y-1 py-1">
          <div className="flex items-center text-gray-700 text-sm">
            <FaCalendarAlt
              className="mr-2 text-primary-400 flex-shrink-0"
              size={12}
            />
            <span className="font-medium">
              {formatDate(row.rendezvousdate)}
            </span>
          </div>
          <div className="flex items-center text-gray-500 text-xs">
            <FaUserClock
              className="mr-2 text-gray-400 flex-shrink-0"
              size={12}
            />
            {row.rendezvoustime?.substring(0, 5)}
          </div>
        </div>
      ),
    },
    {
      name: (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Statut
        </span>
      ),
      width: "140px",
      sortable: true,
      selector: (row) => row.status,
      cell: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
            statusStyles[row.status] ||
            "bg-gray-100 text-gray-700 border-gray-200"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Actions
        </span>
      ),
      width: "130px",
      ignoreRowClick: true,
      omit: isPatient,
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {(row.status === "EN SUSPENS" || row.status === "REPROGRAMMÉ") && (
            <button
              onClick={() => handleConfirm(row)}
              className="flex items-center cursor-pointer justify-center w-8 h-8 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors"
              title="Confirmer"
              aria-label="Confirmer le rendez-vous"
            >
              <GiConfirmed size={16} />
            </button>
          )}
          {canReschedule &&
            (row.status === "EN SUSPENS" || row.status === "CONFIRMÉ") && (
              <button
                onClick={() => handleUpdateDateTime(row)}
                className="flex cursor-pointer items-center justify-center w-8 h-8 bg-white text-orange-500 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
                title="Reprogrammer"
                aria-label="Reprogrammer le rendez-vous"
              >
                <MdEditCalendar size={16} />
              </button>
            )}
          <button
            onClick={() => handleDelete(row)}
            className="flex cursor-pointer items-center justify-center w-8 h-8 bg-white text-rose-500 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors shadow-sm"
            title="Supprimer"
            aria-label="Supprimer la réservation"
          >
            <MdDelete size={16} />
          </button>
        </div>
      ),
    },
  ];

  // START OF UPDATED SECTION
  const loadAppointments = useCallback((isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    getBookedAppointments()
      .then((res) => {
        let data = Array.isArray(res?.data) ? res.data : [];

        // Sort the data by date and time in descending order (newest first)
        data.sort((a, b) => {
          const dateA = new Date(`${a.rendezvousdate}T${a.rendezvoustime}`);
          const dateB = new Date(`${b.rendezvousdate}T${b.rendezvoustime}`);
          return dateB - dateA;
        });

        setAppointments(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Impossible de charger les réservations.");
      })
      .finally(() => {
        if (isInitialLoad) {
          setLoading(false);
        }
      });
  }, []);
  // END OF UPDATED SECTION

  useEffect(() => {
    loadAppointments(true);
    const intervalId = setInterval(() => {
      loadAppointments(false);
    }, 10000);
    return () => {
      clearInterval(intervalId);
    };
  }, [loadAppointments]);

  const confirmedAppointments = appointments.filter(
    (appt) => appt.status === "CONFIRMÉ",
  );

  useEffect(() => {
    let processedAppointments = [...appointments];

    // Exclude confirmed appointments from the main list
    processedAppointments = processedAppointments.filter(
      (appt) => appt.status !== "CONFIRMÉ",
    );

    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();

      processedAppointments = processedAppointments.filter((row) => {
        // Standard search on most non-date fields
        const standardSearch =
          row.patientname?.toLowerCase().includes(searchTermLower) ||
          row.patientno?.toString().includes(searchTermLower) ||
          row.status?.toLowerCase().includes(searchTermLower) ||
          row.rendezvoustime?.includes(searchTermLower) ||
          row.patienttelephone?.toString().includes(searchTermLower);

        // Date-specific search logic
        let dateSearch = false;
        if (row.rendezvousdate) {
          // 1. Search against the original YYYY-MM-DD format
          const nativeDateMatch = row.rendezvousdate.includes(searchTermLower);

          // 2. Create a DD-MM-YYYY version of the date to search against
          const dateParts = row.rendezvousdate.split("-"); // e.g., "2025-08-25" -> ["2025", "08", "25"]

          if (dateParts.length === 3) {
            const [year, month, day] = dateParts;
            // Creates a "25-08-2025" string
            const formattedDdMmYyyy = `${day}-${month}-${year}`;

            // Check if search term (e.g., "25-08") is part of the new string
            const euroDateMatch = formattedDdMmYyyy.includes(searchTermLower);

            // The final date match is true if either format matches
            dateSearch = nativeDateMatch || euroDateMatch;
          } else {
            // Fallback to only native search if date format is unexpected
            dateSearch = nativeDateMatch;
          }
        }

        // Return true if any of the search conditions are met
        return standardSearch || dateSearch;
      });
    }

    setFilteredAppointments(processedAppointments);
  }, [searchTerm, appointments]);

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f9fafb",
        borderTopWidth: "1px",
        borderBottomWidth: "1px",
        borderColor: "#f3f4f6",
      },
    },
    rows: {
      style: {
        "&:not(:last-of-type)": {
          borderBottomWidth: "1px",
          borderBottomColor: "#f3f4f6",
        },
        "&:hover": { backgroundColor: "#f8fafc" },
      },
    },
  };

  const statusCounts = {
    "EN SUSPENS": appointments.filter((a) => a.status === "EN SUSPENS").length,
    REPROGRAMMÉ: appointments.filter((a) => a.status === "REPROGRAMMÉ").length,
    ANNULÉ: appointments.filter((a) => a.status === "ANNULÉ").length,
    CONFIRMÉ: confirmedAppointments.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-400">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              En suspens
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-500 mt-1">
              {statusCounts["EN SUSPENS"]}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-400">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Reprogrammés
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-orange-500 mt-1">
              {statusCounts["REPROGRAMMÉ"]}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-rose-400">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Annulés
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-rose-500 mt-1">
              {statusCounts["ANNULÉ"]}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary-400">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Confirmés
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-primary-600 mt-1">
              {statusCounts["CONFIRMÉ"]}
            </p>
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Réservations de Rendez-vous
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Hors rendez-vous déjà confirmés
              </p>
            </div>
            <button
              onClick={() => setIsConfirmedModalOpen(true)}
              className="inline-flex w-full flex-shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all lg:w-auto"
            >
              <FaHistory size={14} />
              Rendez-vous confirmés
            </button>
          </div>

          <div className="px-6 py-4">
            <div className="relative w-full sm:max-w-md mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Rechercher (Nom, N° patient, Téléphone, Date...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredAppointments}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 25, 50]}
                paginationComponentOptions={{
                  rowsPerPageText: "Lignes par page:",
                  rangeSeparatorText: "sur",
                }}
                fixedHeader
                fixedHeaderScrollHeight="calc(100vh - 380px)"
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
                      Aucun rendez-vous trouvé.
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

      <ConfirmedBookedAppointmentModal
        isOpen={isConfirmedModalOpen}
        onClose={() => setIsConfirmedModalOpen(false)}
        appointments={confirmedAppointments}
      />
    </div>
  );
}
