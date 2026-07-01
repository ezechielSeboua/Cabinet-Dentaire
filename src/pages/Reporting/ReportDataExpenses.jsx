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
import { Bar, Pie } from "react-chartjs-2";

import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

// Register all necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Reusable Card component for a consistent look
const ChartCard = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4">
      {title}
    </h2>
    <div className="h-96 w-full">{children}</div>
  </div>
);

// --- New, Improved Data Processing Function for Expenses ---
const processExpenseData = (expenses, limit = 7) => {
  if (!expenses || expenses.length === 0) return { labels: [], amounts: [] };

  const groupedExpenses = expenses.reduce((acc, expense) => {
    const key = expense.expense || "Non Catégorisé";
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += expense.amount;
    return acc;
  }, {});

  const sortedExpenses = Object.entries(groupedExpenses)
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);

  let processedData = sortedExpenses;
  if (sortedExpenses.length > limit) {
    const topItems = sortedExpenses.slice(0, limit);
    const otherItems = sortedExpenses.slice(limit);
    const otherAmount = otherItems.reduce((acc, item) => acc + item.amount, 0);

    processedData = [...topItems, { label: "Autres", amount: otherAmount }];
  }

  return {
    labels: processedData.map((item) => item.label),
    amounts: processedData.map((item) => item.amount),
  };
};

export default function ReportDataExpenses() {
  const sidebarMargin = useSidebarMargin();
  const [expenseData, setExpenseData] = useState([]);

  useEffect(() => {
    cdiService.allExpenses().then((res) => {
      setExpenseData(res.data);
    });
  }, []);

  // --- Memoized Data Processing for Performance ---
  const expenseChartInfo = useMemo(
    () => processExpenseData(expenseData, 7),
    [expenseData]
  );

  // --- Unified Color Palette for All Charts ---
  const chartColorPalette = [
    "rgba(59, 130, 246, 0.8)", // Blue
    "rgba(16, 185, 129, 0.8)", // Emerald
    "rgba(249, 115, 22, 0.8)", // Orange
    "rgba(220, 38, 38, 0.8)", // Red
    "rgba(168, 85, 247, 0.8)", // Purple
    "rgba(234, 179, 8, 0.8)", // Yellow
    "rgba(236, 72, 153, 0.8)", // Pink
    "rgba(107, 114, 128, 0.8)", // Gray
  ];

  // --- Chart Configurations ---
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right", // Legend on the side works well for Pie charts
        labels: { color: "#4b5563" }, // dark:text-gray-300
      },
    },
  };

  const barChartOptions = {
    indexAxis: "y", // This makes the bar chart horizontal
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        // Note: x and y are swapped for a horizontal chart
        beginAtZero: true,
        ticks: { color: "#6b7280" },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
      },
      y: {
        ticks: { color: "#6b7280" },
        grid: { display: false },
      },
    },
  };

  const expenseChartData = {
    labels: expenseChartInfo.labels,
    datasets: [
      {
        label: "Montant de la Dépense",
        data: expenseChartInfo.amounts,
        backgroundColor: chartColorPalette,
        borderColor: "#ffffff", // For Pie chart slice separation
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

      <main className={`h-full ml-0 mt-14 mb-10 p-4 md:p-8 ${sidebarMargin}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Rapport des Dépenses
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Répartition des dépenses par catégorie
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
            <ChartCard title="Comparaison des Dépenses par Catégorie">
              <Bar options={barChartOptions} data={expenseChartData} />
            </ChartCard>
          </div>

          <div className="xl:col-span-2">
            <ChartCard title="Proportion des Dépenses">
              <Pie options={pieChartOptions} data={expenseChartData} />
            </ChartCard>
          </div>
        </div>
      </main>
    </div>
  );
}
