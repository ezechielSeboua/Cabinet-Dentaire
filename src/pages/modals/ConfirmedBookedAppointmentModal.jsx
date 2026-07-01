import React, { useState, useMemo, useEffect, useCallback } from "react";
import { FaCalendarAlt, FaHistory, FaUserClock } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import formatDate from "../../components/Common/DateFormating";
import { MdEditCalendar, MdSearch } from "react-icons/md";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import { toast, Bounce } from "react-toastify";
import {
  getBookedAppointments,
  updateAppointmentDateTime,
  getAvailableSlots,
} from "../../services/cdiService";
import * as authService from "../../services/authService";

// A simple component for when no confirmed appointments exist at all
const NoConfirmedAppointments = () => (
  <div className="text-center py-12 px-6">
    <svg
      className="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
      Aucun rendez-vous confirmé.
    </h3>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Il n'y a pas encore de rendez-vous dans la liste des confirmés.
    </p>
  </div>
);

// A component for when a search yields no results
const NoSearchResults = () => (
  <div className="text-center py-12 px-6">
    <MdSearch className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Aucun résultat</h3>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Votre recherche n'a retourné aucun rendez-vous.
    </p>
  </div>
);

function ConfirmedBookedAppointmentModal({ isOpen, onClose }) {
  const [currentUser] = useState(authService.getCurrentUser());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // START OF UPDATED SECTION
  const filteredAppointments = useMemo(() => {
    // Trim and lowercase the search term for consistent matching
    const term = searchTerm.trim().toLowerCase();
    // If there's no search term, return all appointments
    if (!term) {
      return appointments;
    }

    return appointments.filter((appt) => {
      // 1. Standard text search (patient name, phone, time)
      const textMatch =
        appt.patientname?.toLowerCase().includes(term) ||
        appt.patienttelephone?.toString().includes(term) ||
        appt.rendezvoustime?.includes(term);
      if (textMatch) {
        return true;
      }
      // 2. Flexible date search
      if (appt.rendezvousdate) {
        const yyyy_mm_dd = appt.rendezvousdate; // e.g., "2025-08-25"
        // Check against the native YYYY-MM-DD format (for searches like "2025-08")
        if (yyyy_mm_dd.includes(term)) {
          return true;
        }
        // Check against a DD-MM-YYYY format (for searches like "25-08")
        const dateParts = yyyy_mm_dd.split("-");
        if (dateParts.length === 3) {
          const [year, month, day] = dateParts;
          const dd_mm_yyyy = `${day}-${month}-${year}`; // e.g., "25-08-2025"

          if (dd_mm_yyyy.includes(term)) {
            return true;
          }
        }
      }
      // 3. If no match was found in any field
      return false;
    });
  }, [appointments, searchTerm]);
  // END OF UPDATED SECTION

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      loadAppointments(true);
    }
  }, [isOpen]);

  const loadAppointments = useCallback((isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }
    getBookedAppointments()
      .then((res) => {
        const allData = Array.isArray(res?.data) ? res.data : [];
        // Filter the results to only include appointments with "CONFIRMÉ" status
        const confirmed = allData.filter((appt) => appt.status === "CONFIRMÉ");
        setAppointments(confirmed);
      })
      .catch((error) => {
        console.error("Failed to fetch appointments:", error);
        toast.error("Erreur lors du chargement des rendez-vous.");
      })
      .finally(() => {
        if (isInitialLoad) {
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    if (isOpen) {
      const intervalId = setInterval(() => {
        loadAppointments(false);
      }, 20000);

      return () => clearInterval(intervalId);
    }
  }, [isOpen, loadAppointments]);

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
            "Veuillez sélectionner un créneau horaire."
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

  const columns = [
    {
      name: (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Patient
        </span>
      ),
      selector: (row) => row.patientname,
      sortable: true,
      minWidth: "240px",
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
            <div className="text-xs text-gray-500">
              Mobile: {row.patienttelephone}
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Email",
      selector: (row) => (row.email ? row.email : "N/A"),
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
      sortFunction: (a, b) => {
        const dateA = new Date(`${a.rendezvousdate}T${a.rendezvoustime}`);
        const dateB = new Date(`${b.rendezvousdate}T${b.rendezvoustime}`);
        return dateA - dateB;
      },
    },
    {
      name: (
        <span className="text-xs font-semibold text-gray-500 uppercase">
          Actions
        </span>
      ),
      width: "150px",
      cell: (row) => (
        <div className="flex space-x-2">
          {currentUser?.body?.roles[0]?.toString() === "DOCTOR" && (
            <button
              onClick={() => handleUpdateDateTime(row)}
              className="flex cursor-pointer items-center justify-center w-8 h-8 bg-white text-orange-600 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
              title="Reprogrammer le rendez-vous"
            >
              <MdEditCalendar size={16} />
            </button>
          )}
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f9fafb",
        borderBottomWidth: "2px",
        borderColor: "#e5e7eb",
        fontSize: "0.875rem",
        fontWeight: "600",
        color: "#4b5563",
      },
    },
    rows: {
      style: {
        "&:not(:last-of-type)": {
          borderBottomColor: "#f3f4f6",
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: "#f8fafc",
      },
    },
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl transform transition-all flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-600">
          <div className="flex items-center">
            <FaHistory className="text-primary-500 mr-3" size={20} />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Rendez-vous confirmés
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-600">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Rechercher par nom, date, ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="data-table-container">
          <DataTable
            columns={columns}
            data={filteredAppointments}
            customStyles={customStyles}
            progressPending={loading}
            noDataComponent={
              searchTerm ? <NoSearchResults /> : <NoConfirmedAppointments />
            }
            highlightOnHover
            fixedHeader
            fixedHeaderScrollHeight="55vh"
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700 text-right rounded-b-xl border-t dark:border-slate-600">
          <button
            onClick={onClose}
            className="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-500"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmedBookedAppointmentModal;
