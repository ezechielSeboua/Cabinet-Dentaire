import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import DataTable from "react-data-table-component";
import { CiEdit } from "react-icons/ci";
import { toast } from "react-toastify";
import { MdSearch } from "react-icons/md";

import formatDate from "../../components/Common/DateFormating";
import { getCurrentUser } from "../../services/authService";
import { allAppointments } from "../../services/cdiService";

export default function MissedAppointmentsModal({
  isOpen,
  onClose,
  onEditAppointment,
}) {
  const [currentUser] = useState(getCurrentUser());
  const [missedAppointments, setMissedAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadMissedAppointments = () => {
    setLoading(true);
    allAppointments()
      .then((res) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const data = Array.isArray(res?.data) ? res.data : [];

        let filteredData = data.filter((appt) => {
          const apptDate = new Date(appt.rendezvousdate);
          return (
            apptDate < today &&
            appt.status !== "Terminé" &&
            appt.status !== "Annulé"
          );
        });

        const userRole = currentUser?.body?.roles[0]?.toString();
        const userId = currentUser?.body?.id;
        const useremail = currentUser?.body?.email;

        if (userRole === "DOCTOR") {
          filteredData = filteredData.filter(
            (x) => parseInt(x.doctor) === parseInt(userId)
          );
        } else if (userRole === "PATIENT") {
          // --- THIS IS THE CORRECTED LINE ---
          filteredData = filteredData.filter(
            (x) => x.patientemail === useremail
          );
        }
        setMissedAppointments(filteredData);
        setFilteredAppointments(filteredData);
      })
      .catch((error) => {
        console.error("Failed to load appointments:", error);
        toast.error("Erreur lors du chargement des rendez-vous manqués.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      loadMissedAppointments();
    }
  }, [isOpen]);

  const handleEditClick = (appointment) => {
    onEditAppointment(appointment);
  };

  // --- UPDATED SEARCH LOGIC ---
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAppointments(missedAppointments);
      return;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = missedAppointments.filter((row) => {
      // Condition 1: General text search (for Patient ID, Name, Phone, etc.)
      const generalMatch = Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lowercasedFilter)
      );
      // Condition 2: Formatted date search (for user-friendly date searching)
      const formattedDateMatch = formatDate(row.rendezvousdate)
        .toLowerCase()
        .includes(lowercasedFilter);
      // A row is included if it matches either the general text OR the formatted date

      // Condition 3: Formatted time search (e.g., "HH:mm")
      // Use optional chaining `?.` to prevent errors if time is null
      const formattedTimeMatch = row.rendezvoustime
        ?.substring(0, 5)
        .includes(lowercasedFilter);

      // A row is included if it matches ANY of the conditions
      return generalMatch || formattedDateMatch || formattedTimeMatch;
    });
    setFilteredAppointments(filtered);
  }, [searchTerm, missedAppointments]);

  const columns = [
    {
      name: "Patient",
      selector: (row) => (
        <div>
          <div className="font-medium">{row.patientname}</div>
          <div className="text-sm text-gray-500">{row.patientno}</div>
        </div>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: "Date Manquée",
      selector: (row) => formatDate(row.rendezvousdate),
      sortable: true,
    },
    {
      name: "Heure",
      selector: (row) => row.rendezvoustime?.substring(0, 5),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => handleEditClick(row)}
          className="p-1 text-primary-600 cursor-pointer hover:text-primary-800"
          title="Reporter ou Modifier"
        >
          <CiEdit size={20} />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0  bg-opacity-40" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold leading-6 text-rose-600"
                >
                  Rendez-vous Manqués
                </Dialog.Title>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Cliquez sur l'icône modifier pour reporter un rendez-vous.
                </p>
                <div className="my-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Rechercher par Nom, ID, Date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
                  <DataTable
                    columns={
                      currentUser?.body?.roles[0]?.toString() === "PATIENT"
                        ? columns.filter((col) => col.name !== "Actions")
                        : columns
                    }
                    data={filteredAppointments}
                    progressPending={loading}
                    pagination
                    paginationPerPage={5}
                    paginationRowsPerPageOptions={[5, 10]}
                    noDataComponent={
                      <div className="py-8 text-center text-gray-500">
                        {searchTerm
                          ? "Aucun résultat trouvé."
                          : "Aucun rendez-vous manqué."}
                      </div>
                    }
                    highlightOnHover
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600"
                    onClick={onClose}
                  >
                    Fermer
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
// MissedAppointmentsModal.jsx
