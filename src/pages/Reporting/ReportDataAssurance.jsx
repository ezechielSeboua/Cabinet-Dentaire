import React, { useEffect, useState, useMemo } from "react";
import * as cdiService from "../../services/cdiService";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Reusable Card component for wrapping content
const Card = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4">
      {title}
    </h2>
    <div>{children}</div>
  </div>
);

// --- UPDATED Data Processing Function with a Limit ---
const processInsuranceData = (patients, limit = null) => {
  if (!patients || patients.length === 0) {
    return { labels: [], occurrences: [], fullData: [] };
  }

  const allInsurances = patients.flatMap((p) => {
    const insurances = [];
    if (p.insurance && p.insurance !== "NA") insurances.push(p.insurance);
    if (p.insurance2 && p.insurance2 !== "NA") insurances.push(p.insurance2);
    return insurances;
  });

  const counts = allInsurances.reduce((acc, name) => {
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const sortedData = Object.entries(counts)
    .map(([label, occurrence]) => ({ label, occurrence }))
    .sort((a, b) => b.occurrence - a.occurrence);

  if (limit && sortedData.length > limit) {
    const topItems = sortedData.slice(0, limit);
    const otherItems = sortedData.slice(limit);
    const otherOccurrence = otherItems.reduce(
      (acc, item) => acc + item.occurrence,
      0
    );

    const chartData = [
      ...topItems,
      { label: "Autres", occurrence: otherOccurrence },
    ];

    return {
      labels: chartData.map((item) => item.label),
      occurrences: chartData.map((item) => item.occurrence),
      fullData: sortedData, // Return the full sorted list for the table
    };
  }

  return {
    labels: sortedData.map((item) => item.label),
    occurrences: sortedData.map((item) => item.occurrence),
    fullData: sortedData,
  };
};

// --- New Reusable Table Component ---
const DataTable = ({ data }) => (
  <div className="overflow-x-auto max-h-96">
    {" "}
    {/* Makes table scrollable */}
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
        <tr>
          <th scope="col" className="px-6 py-3">
            Compagnie d'Assurance
          </th>
          <th scope="col" className="px-6 py-3 text-right">
            Nombre de Patients
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map(({ label, occurrence }, index) => (
          <tr
            key={index}
            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <th
              scope="row"
              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {label}
            </th>
            <td className="px-6 py-4 text-right">{occurrence}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function ReportDataAssurance() {
  const sidebarMargin = useSidebarMargin();
  const [patientData, setPatientData] = useState([]);

  useEffect(() => {
    cdiService.patientList().then((res) => {
      setPatientData(res.data);
    });
  }, []);

  // --- Memoized Data for both Chart (Limited) and Table (Full) ---
  const { labels, occurrences, fullData } = useMemo(
    () => processInsuranceData(patientData, 12), // Limit the chart to the Top 12 + Others
    [patientData]
  );

  const chartColorPalette = [
    "rgba(59, 130, 246, 0.8)",
    "rgba(16, 185, 129, 0.8)",
    "rgba(249, 115, 22, 0.8)",
    "rgba(220, 38, 38, 0.8)",
    "rgba(168, 85, 247, 0.8)",
    "rgba(234, 179, 8, 0.8)",
    "rgba(236, 72, 153, 0.8)",
    "rgba(13, 148, 136, 0.8)",
    "rgba(192, 38, 211, 0.8)",
    "rgba(217, 70, 239, 0.8)",
    "rgba(30, 64, 175, 0.8)",
    "rgba(124, 58, 237, 0.8)",
    "rgba(107, 114, 128, 0.8)", // Color for "Autres"
  ];

  const barChartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: "#6b7280", stepSize: 1 },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
      y: { ticks: { color: "#6b7280" }, grid: { display: false } },
    },
  };

  const insuranceChartData = {
    labels: labels,
    datasets: [
      {
        label: "Nombre de Patients",
        data: occurrences,
        backgroundColor: chartColorPalette,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white">
      <SideBar2 />
      <div className="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>

      <main className={`h-full ml-0 mt-14 mb-10 p-4 md:p-8 ${sidebarMargin}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Rapport des Assurances
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Répartition des patients par compagnie d'assurance
            </p>
          </div>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 hover:border-primary-300 transition-all duration-150"
          >
            <IoArrowBack size={16} />
            Retour
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card title="Top Compagnies d'Assurance par Nombre de Patients">
            <div className="h-96 w-full">
              <Bar options={barChartOptions} data={insuranceChartData} />
            </div>
          </Card>

          <Card title="Détail Complet des Assurances">
            <DataTable data={fullData} />
          </Card>
        </div>
      </main>
    </div>
  );
}
