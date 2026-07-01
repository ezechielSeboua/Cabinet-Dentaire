import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MdSearch, MdPersonAdd } from "react-icons/md";
import { patientList, allAppointments } from "../../services/cdiService";

export default function PatientSelectionModal({
  isOpen,
  onClose,
  onPatientSelect,
}) {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const ACTIVE_STATUSES = new Set(["Confirmé", "En attente", "REPROGRAMMÉ"]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    Promise.all([patientList(), allAppointments()])
      .then(([pRes, aRes]) => {
        const bookedNos = new Set(
          (aRes.data || [])
            .filter((a) => ACTIVE_STATUSES.has(a.status))
            .map((a) => a.patientno),
        );
        const available = (pRes.data || [])
          .filter((p) => !bookedNos.has(p.patientno))
          .sort((a, b) => a.lastname?.localeCompare(b.lastname ?? "") ?? 0);
        setPatients(available);
        setFilteredPatients(available);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPatients(patients);
      return;
    }
    const filtered = patients.filter(
      (p) =>
        p.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patientno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telephone?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const handleSelect = (patient) => {
    onPatientSelect(patient);
    onClose();
  };

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
          <div className="fixed inset-0 bg-black/50" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold leading-6 text-gray-900 dark:text-white"
                >
                  Sélectionner un Patient
                </Dialog.Title>
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Rechercher un patient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="py-12 flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                  ) : (
                    <>
                      {filteredPatients.length === 0 && (
                        <div className="py-10 text-center text-gray-500">
                          Aucun patient trouvé.
                        </div>
                      )}
                      <ul className="divide-y divide-gray-200 dark:divide-slate-600">
                        {filteredPatients.map((patient) => (
                          <li
                            key={patient.id}
                            className="py-3 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {patient.lastname} {patient.firstname}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {patient.patientno}
                              </p>
                            </div>
                            <button
                              onClick={() => handleSelect(patient)}
                              className="flex-shrink-0 flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-700 rounded-lg shadow-sm hover:bg-primary-800"
                              title="Attribuer ce patient"
                            >
                              <MdPersonAdd className="mr-2" />
                              Attribuer
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600"
                    onClick={onClose}
                  >
                    Annuler
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
