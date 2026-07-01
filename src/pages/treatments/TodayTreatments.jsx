import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
// import { useReactToPrint } from "react-to-print";
import DataTable from "react-data-table-component";
import * as XLSX from "xlsx";
import { allTreatments } from "../../services/cdiService";
import { getCurrentUser } from "../../services/authService";

// Components
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

// Icons
import {
  IoReturnUpBackSharp,
  IoWallet,
  IoPeople,
  IoShieldCheckmark,
} from "react-icons/io5";
import { FaFileInvoiceDollar, FaFileExcel } from "react-icons/fa";

// A reusable component for displaying statistics
const StatCard = ({ title, value, icon, currency = "" }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-4">
    <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        {value.toLocaleString()} {currency}
      </p>
    </div>
  </div>
);

// --- NEW: Expanded Component for Insurance Details ---
const ExpandedInsuranceComponent = ({ data }) => {
  const nonAssuredValues = ["NA", "NON ASSURE", "NON ASSURÉ", "UNDEFINED"];
  const insurances = [];

  if (
    data.insurance &&
    !nonAssuredValues.includes(data.insurance.toUpperCase()) &&
    data.partinsurance > 0
  ) {
    insurances.push({ name: data.insurance, amount: data.partinsurance });
  }
  if (
    data.insurance2 &&
    !nonAssuredValues.includes(data.insurance2.toUpperCase()) &&
    data.partinsurance2 > 0
  ) {
    insurances.push({ name: data.insurance2, amount: data.partinsurance2 });
  }

  if (insurances.length === 0) {
    return null; // Or a message indicating no insurance details
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
      <h4 className="font-bold text-md text-gray-700 dark:text-gray-200 mb-2">
        Détails des Parts Assurances :
      </h4>
      <div className="flex flex-col gap-1.5 pl-4">
        {insurances.map(({ name, amount }, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-2 text-sm"
          >
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              {name}:
            </span>
            <span className="font-mono text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
              {amount.toLocaleString("fr-FR")} F CFA
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function TodayTreatments() {
  const sidebarMargin = useSidebarMargin();
  const [treatments, setTreatments] = useState([]);
  const [showInsurances, setShowInsurances] = useState(false);
  const componentToPrint = useRef();
  const today = new Date().toISOString().split("T")[0];
  const [currentUser] = useState(getCurrentUser());

  const userRole = useMemo(
    () => currentUser?.body?.roles[0]?.toString(),
    [currentUser]
  );

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const res = await allTreatments();
        const tousTreatments = res.data;

        const todayTreatments = tousTreatments.filter(
          (x) => x.treatmentof === today
        );

        const filteredTreatments =
          userRole === "DOCTOR"
            ? todayTreatments.filter(
                (treatment) => treatment.doctor === currentUser?.body?.email
              )
            : todayTreatments;

        setTreatments(filteredTreatments);
      } catch (error) {
        console.error("Erreur lors du chargement des traitements :", error);
      }
    };

    fetchTreatments();
  }, [today, userRole, currentUser]);

  const { summary, uniqueInsurances } = useMemo(() => {
    const totals = {
      totalAmount: 0,
      totalPatient: 0,
      totalInsurance: 0,
      insuranceTotals: new Map(),
    };
    const insuranceSet = new Set();
    const nonAssuredValues = ["NA", "NON ASSURE", "NON ASSURÉ", "UNDEFINED"];

    treatments.forEach((treatment) => {
      totals.totalAmount += treatment.treatmentamount || 0;
      totals.totalPatient += treatment.partpatient || 0;

      const { insurance, partinsurance, insurance2, partinsurance2 } =
        treatment;

      if (
        insurance &&
        !nonAssuredValues.includes(insurance.toUpperCase()) &&
        partinsurance > 0
      ) {
        insuranceSet.add(insurance);
        totals.insuranceTotals.set(
          insurance,
          (totals.insuranceTotals.get(insurance) || 0) + partinsurance
        );
      }

      if (
        insurance2 &&
        !nonAssuredValues.includes(insurance2.toUpperCase()) &&
        partinsurance2 > 0
      ) {
        insuranceSet.add(insurance2);
        totals.insuranceTotals.set(
          insurance2,
          (totals.insuranceTotals.get(insurance2) || 0) + partinsurance2
        );
      }
    });

    totals.totalInsurance = Array.from(totals.insuranceTotals.values()).reduce(
      (acc, val) => acc + val,
      0
    );

    return {
      summary: totals,
      uniqueInsurances: Array.from(insuranceSet).sort(),
    };
  }, [treatments]);

  // --- UPDATED: Simplified Columns ---
  const columns = [
    {
      name: "Docteur",
      selector: (row) => row.doctorname,
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Patient",
      selector: (row) => row.patientname,
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Montant Total",
      selector: (row) => row.treatmentamount,
      sortable: true,
      format: (row) => `${(row.treatmentamount || 0).toLocaleString()} FCFA`,
    },
    {
      name: "Part Patient",
      selector: (row) => row.partpatient,
      sortable: true,
      format: (row) => `${(row.partpatient || 0).toLocaleString()} FCFA`,
    },
    {
      name: "Part Assurances (Total)",
      selector: (row) => (row.partinsurance || 0) + (row.partinsurance2 || 0),
      sortable: true,
      format: (row) =>
        `${(
          (row.partinsurance || 0) + (row.partinsurance2 || 0)
        ).toLocaleString()} FCFA`,
    },
    { name: "Facture", selector: (row) => row.statuspayment, sortable: true },
    { name: "Status", selector: (row) => row.treatmentstatus, sortable: true },
  ];



  const handleExportExcel = () => {
    const summaryData = [
      { Category: "Total des Soins sans assurance", Amount: summary.totalAmount },
      { Category: "Total Part Patient", Amount: summary.totalPatient },
      { Category: "Total Global Assurances", Amount: summary.totalInsurance },
      ...Array.from(summary.insuranceTotals.entries()).map(([name, value]) => ({
        Category: `Total ${name}`,
        Amount: value,
      })),
    ];
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet["!cols"] = [{ wch: 30 }, { wch: 20 }];

    const treatmentsData = treatments.map((treatment) => {
      const row = {
        Docteur: treatment.doctorname,
        Patient: treatment.patientname,
        "Montant Total (FCFA)": treatment.treatmentamount || 0,
        "Part Patient (FCFA)": treatment.partpatient || 0,
      };
      uniqueInsurances.forEach((insuranceName) => {
        let amount = 0;
        if (treatment.insurance === insuranceName)
          amount = treatment.partinsurance || 0;
        else if (treatment.insurance2 === insuranceName)
          amount = treatment.partinsurance2 || 0;
        row[`Part ${insuranceName} (FCFA)`] = amount;
      });
      row.Facture = treatment.statuspayment;
      row.Status = treatment.treatmentstatus;
      row.Date = new Date(treatment.treatmentof).toLocaleDateString("fr-FR");
      return row;
    });
    const treatmentsWorksheet = XLSX.utils.json_to_sheet(treatmentsData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      summaryWorksheet,
      "Résumé Financier"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      treatmentsWorksheet,
      "Détails des Traitements"
    );

    XLSX.writeFile(workbook, `Recette_Journaliere_${today}.xlsx`);
  };

  const tableHeaderStyle = {
    headRow: {
      style: {
        backgroundColor: "#f3f4f6",
        borderBottomWidth: "2px",
        borderColor: "#e5e7eb",
      },
    },
    headCells: {
      style: { color: "#374151", fontSize: "14px", fontWeight: "600" },
    },
    rows: {
      style: {
        minHeight: "60px",
        "&:not(:last-of-type)": {
          borderBottomWidth: "1px",
          borderColor: "#e5e7eb",
        },
      },
    },
    cells: { style: { fontSize: "14px" } },
    expanderRow: { style: { backgroundColor: "#f9fafb" } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <SideBar2 />
      <div className="fixed top-0 left-0 w-full z-10">
        <Header />
      </div>
      <main className={`h-full ml-0 mt-14 ${sidebarMargin} p-6`}>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Recette du Jour</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Rapport pour le {new Date(today).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/treatment"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 hover:border-primary-300 transition-all duration-150"
            >
              <IoReturnUpBackSharp size={16} />
              Retour
            </Link>
            
              <>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center cursor-pointer gap-2 bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-primary-700 transition-colors"
                >
                  <FaFileExcel />
                  <span>Exporter (Excel)</span>
                </button>
               
              </>
          
          </div>
        </div>

        <div
          ref={componentToPrint}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
        >
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
              Résumé Financier
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Total des Soins sans assurance"
                value={summary.totalAmount}
                currency="FCFA"
                icon={<FaFileInvoiceDollar size={24} className="text-primary-500" />}
              />
              <StatCard
                title="Total Part Patients assurés"
                value={summary.totalPatient}
                currency="FCFA"
                icon={<IoPeople size={24} className="text-green-500" />}
              />
              <StatCard
                title="Total Global des Assurances"
                value={summary.totalInsurance}
                currency="FCFA"
                icon={<IoShieldCheckmark size={24} className="text-purple-500" />}
              />
            </div>

            {summary.insuranceTotals.size > 0 && (
              <div>
                <button
                  onClick={() => setShowInsurances((prev) => !prev)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <span>Détail par Assurance ({summary.insuranceTotals.size})</span>
                  <span className="text-xl leading-none font-bold">
                    {showInsurances ? "−" : "+"}
                  </span>
                </button>
                {showInsurances && <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">
                          Assurance
                        </th>
                        <th className="px-4 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">
                          Montant (FCFA)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {Array.from(summary.insuranceTotals.entries())
                        .sort(([, a], [, b]) => b - a)
                        .map(([name, value]) => (
                          <tr key={name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                              {name}
                            </td>
                            <td className="px-4 py-2 text-right font-mono font-medium text-gray-900 dark:text-white">
                              {value.toLocaleString("fr-FR")} FCFA
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <td className="px-4 py-2 font-bold text-gray-700 dark:text-gray-200">
                          Total
                        </td>
                        <td className="px-4 py-2 text-right font-mono font-bold text-gray-900 dark:text-white">
                          {summary.totalInsurance.toLocaleString("fr-FR")} FCFA
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
              Détail des Traitements
            </h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              {treatments.length === 0 && (
                <div className="text-center py-6 text-rose-500 font-semibold text-lg">
                  Aucun traitement trouvé pour aujourd'hui.
                </div>
              )}
              <DataTable
                columns={columns}
                data={treatments}
                customStyles={tableHeaderStyle}
                pagination
                responsive
                paginationComponentOptions={{
                  rowsPerPageText: "Lignes par page:",
                  rangeSeparatorText: "de",
                }}
                fixedHeader
                fixedHeaderScrollHeight="450px"
                highlightOnHover
                // noDataComponent={
                //   <CustomNoDataComponent
                //     message="Aucun traitement trouvé"
                //     // suggestion="Créez un nouveau traitement."
                //   />
                // }
                // --- NEW PROPS FOR EXPANDABLE ROWS ---
                expandableRows
                expandableRowsComponent={ExpandedInsuranceComponent}
                expandableRowDisabled={(row) =>
                  (row.partinsurance || 0) + (row.partinsurance2 || 0) === 0
                }
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
