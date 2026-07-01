import React, { useEffect, useState, useMemo } from "react";
import * as cdiService from "../../services/cdiService";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

// Register all the Chart.js components we're using
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Reusable Card component for a consistent dashboard look
const ChartCard = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4">
      {title}
    </h2>
    <div className="h-80 w-full">{children}</div>
  </div>
);

// --- Efficient, Reusable Data Processing Function ---
const countOccurrences = (data, key) => {
  if (!data || !key) return { labels: [], occurrences: [] };

  const counts = data.reduce((acc, item) => {
    const value = item[key] || "Non Défini";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(counts);
  const occurrences = Object.values(counts);

  return { labels, occurrences };
};

export default function ReportDataTreatment() {
  const sidebarMargin = useSidebarMargin();
  const [appointmentData, setAppointmentData] = useState([]);
  const [treatmentData, setTreatmentData] = useState([]);

  useEffect(() => {
    cdiService.allAppointments().then((res) => setAppointmentData(res.data));
    cdiService.allTreatments().then((res) => setTreatmentData(res.data));
  }, []);

  // --- Memoized Data Processing for Performance ---
  const appointmentStatusInfo = useMemo(
    () => countOccurrences(appointmentData, "status"),
    [appointmentData]
  );
  const treatmentStatusInfo = useMemo(
    () => countOccurrences(treatmentData, "treatmentstatus"),
    [treatmentData]
  );
  const paymentStatusInfo = useMemo(
    () => countOccurrences(treatmentData, "statuspayment"),
    [treatmentData]
  );

  // --- Unified Color Palette for All Charts ---
  // One palette to rule them all. Easy to theme and ensures consistency.
  const chartColorPalette = [
    "rgba(59, 130, 246, 0.8)",  // Blue
    "rgba(16, 185, 129, 0.8)", // Emerald
    "rgba(249, 115, 22, 0.8)", // Orange
    "rgba(220, 38, 38, 0.8)",   // Red
    "rgba(168, 85, 247, 0.8)", // Purple
    "rgba(234, 179, 8, 0.8)",    // Yellow
  ];

  // --- Chart Configurations ---
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }, // Hide legend as colors are categorical
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#6b7280" }, // text-gray-500
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
      x: {
        ticks: { color: "#6b7280" }, // text-gray-500
        grid: { display: false },
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#4b5563" }, // text-gray-600
      },
    },
    cutout: "60%",
  };

  // --- UPDATED Bar Chart Data ---
  const appointmentStatusChartData = {
    labels: appointmentStatusInfo.labels,
    datasets: [
      {
        label: "Rendez-vous",
        data: appointmentStatusInfo.occurrences,
        // Assign the entire palette. Chart.js will cycle through the colors for each bar.
        backgroundColor: chartColorPalette,
      },
    ],
  };

  const treatmentStatusChartData = {
    labels: treatmentStatusInfo.labels,
    datasets: [
      {
        label: "Traitements",
        data: treatmentStatusInfo.occurrences,
        // Using the same palette for consistency.
        backgroundColor: chartColorPalette,
      },
    ],
  };

  const paymentStatusChartData = {
    labels: paymentStatusInfo.labels,
    datasets: [
      {
        label: "Statut de Paiement",
        data: paymentStatusInfo.occurrences,
        backgroundColor: chartColorPalette,
        borderColor: "#ffffff", // Use a white border for light mode
        borderWidth: 4,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white">
      <SideBar2 />
      <div className="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>

      <main className={`h-full ml-0 mt-14 mb-10 ${sidebarMargin} p-4 md:p-8`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Traitements &amp; Rendez-vous
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Répartition des rendez-vous et traitements par statut
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <ChartCard title="Répartition des Rendez-vous par Statut">
            <Bar options={barChartOptions} data={appointmentStatusChartData} />
          </ChartCard>

          <ChartCard title="Répartition des Traitements par Statut">
            <Bar options={barChartOptions} data={treatmentStatusChartData} />
          </ChartCard>

          <div className="lg:col-span-2">
            <ChartCard title="Statut de Paiement des Traitements">
              <Doughnut
                options={doughnutChartOptions}
                data={paymentStatusChartData}
              />
            </ChartCard>
          </div>
        </div>
      </main>
    </div>
  );
}