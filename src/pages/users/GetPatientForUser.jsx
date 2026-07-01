import React, { useEffect, useState } from "react";
import * as cdiService from "../../services/cdiService";
import { Link } from "react-router-dom";
import { MdSick, MdSearch, MdAdd } from "react-icons/md";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";

export default function GetPatientForUser() {
  const [record, setRecord] = useState([]);
  const [filterrecords, setFilterRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      name: "#",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: " Prénoms & Nom",
      selector: (row) => row.firstname + " " + row.lastname,
      sortable: true,
    },
    {
      name: "Assurance",
      selector: (row) => row.insurance,
      sortable: true,
    },
    {
      name: "Assigner",
      cell: (row) => (
        <Link
          to={`/user/create-patient-user/${row.id}`}
          title="Assigner un utilisateur à ce patient"
        >
          <MdSick size={20} className="text-primary-600 hover:text-primary-700 transition-colors" />
        </Link>
      ),
    },
  ];

  const allClients = () => {
    setLoading(true);
    cdiService
      .patientList()
      .then((res) => {
        setRecord(res.data);
        setFilterRecords(res.data);
      })
      .catch(() => {
        toast.error("Erreur lors du chargement des patients.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    allClients();
  }, []);

  const search = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const newData = filterrecords.filter(
      (row) =>
        (row.firstname + " " + row.lastname).toLowerCase().includes(searchTerm) ||
        (row.insurance || "").toLowerCase().includes(searchTerm) ||
        row.id.toString().includes(searchTerm)
    );
    setRecord(newData);
  };

  const customStyles = {
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: "#db2777",
        color: "white",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Assigner un patient à un utilisateur
            </h2>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un patient..."
                  className="block w-full sm:w-80 bg-gray-50 border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onChange={search}
                />
              </div>
              <Link
                to={"/patient/new"}
                className="inline-flex items-center cursor-pointer justify-center gap-2 px-4 py-2 bg-primary-700 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-primary-800 transition-all focus:outline-none focus:ring-2 focus:ring-gray-100 focus:ring-offset-2 whitespace-nowrap"
              >
                <MdAdd size={20} />
                <span>Ajouter patients</span>
              </Link>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={record}
            pagination
            fixedHeader
            fixedHeaderScrollHeight="450px"
            selectableRowsHighlight
            highlightOnHover
            customStyles={customStyles}
            progressPending={loading}
            progressComponent={
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            }
            noDataComponent={
              <div className="py-12 text-center text-gray-500">
                Aucun patient trouvé.
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
