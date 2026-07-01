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

// A reusable Card component to wrap our charts
const ChartCard = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4">
      {title}
    </h2>
    <div>{children}</div>
  </div>
);

// Data processing function to count occurrences and group smaller items
const processChartData = (data, key, limit = 10) => {
  if (!data || !key) return { labels: [], occurrences: [] };

  const counts = data.reduce((acc, item) => {
    const value = item[key] || "Non défini";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  const sortedData = Object.entries(counts)
    .map(([name, occurrence]) => ({ name, occurrence }))
    .sort((a, b) => b.occurrence - a.occurrence);

  let processedData = sortedData;
  if (sortedData.length > limit) {
    const topItems = sortedData.slice(0, limit);
    const otherItems = sortedData.slice(limit);
    const otherOccurrence = otherItems.reduce(
      (acc, item) => acc + item.occurrence,
      0
    );

    processedData = [
      ...topItems,
      { name: "Autres", occurrence: otherOccurrence },
    ];
  }

  return {
    labels: processedData.map((item) => item.name),
    occurrences: processedData.map((item) => item.occurrence),
  };
};

const GENDER_LABELS = {
  MALE: "Homme",
  FEMALE: "Femme",
  FEMELE: "Femme",
};
const translateGenderLabels = (labels) =>
  labels.map((label) => GENDER_LABELS[label?.toUpperCase()] || label);

export default function ReportDataPatient() {
  const sidebarMargin = useSidebarMargin();
  const [patientData, setPatientData] = useState([]);

  useEffect(() => {
    cdiService.insuranceAndPatientList().then((res) => {
      setPatientData(res.data);
    });
  }, []);

  // Memoized data processing
  const genderChartInfo = useMemo(
    () => processChartData(patientData, "gender", 5),
    [patientData]
  );
  const professionChartInfo = useMemo(
    () => processChartData(patientData, "profession", 10),
    [patientData]
  );

  // --- Color Palettes ---
  const genderColorPalette = [
    "rgba(59, 130, 246, 0.8)",
    "rgba(236, 72, 153, 0.8)",
    "rgba(16, 185, 129, 0.8)",
  ];
  const professionColorPalette = [
    "rgba(59, 130, 246, 0.8)",
    "rgba(16, 185, 129, 0.8)",
    "rgba(249, 115, 22, 0.8)",
    "rgba(168, 85, 247, 0.8)",
    "rgba(234, 179, 8, 0.8)",
    "rgba(236, 72, 153, 0.8)",
    "rgba(13, 148, 136, 0.8)",
    "rgba(192, 38, 211, 0.8)",
    "rgba(217, 70, 239, 0.8)",
    "rgba(30, 64, 175, 0.8)",
    "rgba(107, 114, 128, 0.8)", // Color for "Autres"
  ];

  // --- Chart Configurations ---
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#6b7280" },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: { color: "#6b7280" },
        grid: { display: false },
      },
    },
  };

  const horizontalChartOptions = {
    ...baseChartOptions,
    indexAxis: "y",
    scales: {
      x: {
        // For horizontal chart, x is the value axis
        beginAtZero: true,
        ticks: { color: "#6b7280", stepSize: 1 },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        // y is the category axis
        ticks: { color: "#6b7280" },
        grid: { display: false },
      },
    },
  };

  // --- Chart Data Objects ---
  const genderChartData = {
    labels: translateGenderLabels(genderChartInfo.labels),
    datasets: [
      {
        label: "Nombre de patients",
        data: genderChartInfo.occurrences,
        backgroundColor: genderColorPalette,
      },
    ],
  };

  const professionChartData = {
    labels: professionChartInfo.labels,
    datasets: [
      {
        label: "Nombre de patients",
        data: professionChartInfo.occurrences,
        // Assign the full palette here. Chart.js will cycle through the colors.
        backgroundColor: professionColorPalette,
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
              Rapport des Patients
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Répartition des patients par profession et par sexe
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

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          <div className="xl:col-span-3">
            <ChartCard title="Top 10 Professions des Patients">
              <div style={{ height: "500px" }}>
                <Bar
                  options={horizontalChartOptions}
                  data={professionChartData}
                />
              </div>
            </ChartCard>
          </div>

          <div className="xl:col-span-2">
            <ChartCard title="Répartition par Sexe">
              <div style={{ height: "500px" }}>
                <Bar options={baseChartOptions} data={genderChartData} />
              </div>
            </ChartCard>
          </div>
        </div>
      </main>
    </div>
  );
}
