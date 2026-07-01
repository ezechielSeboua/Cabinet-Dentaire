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

import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4">
      {title}
    </h2>
    <div className="h-80 w-full">{children}</div>
  </div>
);

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 flex flex-col gap-1">
    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      {label}
    </p>
    <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
  </div>
);

const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "decimal", minimumFractionDigits: 0 }).format(
    Math.round(n)
  );

const chartColorPalette = [
  "rgba(20, 184, 166, 0.85)",
  "rgba(59, 130, 246, 0.85)",
  "rgba(249, 115, 22, 0.85)",
  "rgba(168, 85, 247, 0.85)",
  "rgba(234, 179, 8, 0.85)",
  "rgba(220, 38, 38, 0.85)",
  "rgba(16, 185, 129, 0.85)",
  "rgba(236, 72, 153, 0.85)",
];

export default function ReportDataPayment() {
  const sidebarMargin = useSidebarMargin();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const firstOfYear = new Date(new Date().getFullYear(), 0, 1)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(firstOfYear);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    cdiService
      .allBills()
      .then((res) => setBills(res.data || []))
      .catch(() => setBills([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!bills.length) return [];
    return bills.filter((b) => {
      if (!b.registeredOn) return true;
      const d = b.registeredOn.substring(0, 10);
      return d >= startDate && d <= endDate;
    });
  }, [bills, startDate, endDate]);

  // Group by paymentmethod
  const byMethod = useMemo(() => {
    const map = {};
    filtered.forEach((b) => {
      const method = b.paymentmethod || "Non défini";
      if (!map[method]) map[method] = { count: 0, total: 0, patient: 0 };
      map[method].count += 1;
      map[method].total += parseFloat(b.amountpaid || 0);
      map[method].patient += parseFloat(b.partpatient || 0);
    });
    return map;
  }, [filtered]);

  const methods = Object.keys(byMethod);

  const totalCollected = filtered.reduce(
    (sum, b) => sum + parseFloat(b.amountpaid || 0),
    0
  );
  const totalPatientPart = filtered.reduce(
    (sum, b) => sum + parseFloat(b.partpatient || 0),
    0
  );
  const totalInsurancePart = totalCollected - totalPatientPart;

  const barOptions = {
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "#4b5563" } },
    },
    cutout: "60%",
  };

  const countChartData = {
    labels: methods,
    datasets: [
      {
        label: "Nombre de paiements",
        data: methods.map((m) => byMethod[m].count),
        backgroundColor: chartColorPalette,
        borderColor: "#ffffff",
        borderWidth: 3,
      },
    ],
  };

  const amountChartData = {
    labels: methods,
    datasets: [
      {
        label: "Montant encaissé (FCFA)",
        data: methods.map((m) => byMethod[m].total),
        backgroundColor: chartColorPalette,
      },
    ],
  };

  const splitChartData = {
    labels: ["Part Patient", "Part Assurance"],
    datasets: [
      {
        data: [totalPatientPart, totalInsurancePart > 0 ? totalInsurancePart : 0],
        backgroundColor: [
          "rgba(20, 184, 166, 0.85)",
          "rgba(59, 130, 246, 0.85)",
        ],
        borderColor: "#ffffff",
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Rapport des Paiements
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Analyse des paiements encaissés par mode et par période
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

        {/* Date range filter */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Date de début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Date de fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 self-end pb-2">
            {loading ? "Chargement..." : `${filtered.length} paiement(s) trouvé(s)`}
          </p>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total encaissé"
            value={`${fmt(totalCollected)} FCFA`}
            sub={`${filtered.length} paiements`}
          />
          <StatCard
            label="Part patient"
            value={`${fmt(totalPatientPart)} FCFA`}
            sub={
              totalCollected > 0
                ? `${Math.round((totalPatientPart / totalCollected) * 100)}%`
                : "—"
            }
          />
          <StatCard
            label="Part assurance"
            value={`${fmt(totalInsurancePart > 0 ? totalInsurancePart : 0)} FCFA`}
            sub={
              totalCollected > 0
                ? `${Math.round(
                    (Math.max(0, totalInsurancePart) / totalCollected) * 100
                  )}%`
                : "—"
            }
          />
          <StatCard
            label="Modes de paiement"
            value={methods.length}
            sub="méthodes distinctes"
          />
        </div>

        {/* Per-method breakdown cards */}
        {methods.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {methods.map((m, i) => (
              <div
                key={m}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4"
                style={{ borderColor: chartColorPalette[i % chartColorPalette.length].replace("0.85", "1") }}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                  {m}
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">
                  {byMethod[m].count} pmt
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {fmt(byMethod[m].total)} FCFA
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard title="Répartition par mode de paiement (nombre)">
            {filtered.length > 0 ? (
              <Doughnut options={doughnutOptions} data={countChartData} />
            ) : (
              <p className="text-center text-gray-400 pt-20">Aucune donnée</p>
            )}
          </ChartCard>

          <ChartCard title="Part patient vs assurance">
            {filtered.length > 0 ? (
              <Doughnut options={doughnutOptions} data={splitChartData} />
            ) : (
              <p className="text-center text-gray-400 pt-20">Aucune donnée</p>
            )}
          </ChartCard>

          <div className="lg:col-span-2">
            <ChartCard title="Montant encaissé par mode de paiement (FCFA)">
              {filtered.length > 0 ? (
                <Bar options={barOptions} data={amountChartData} />
              ) : (
                <p className="text-center text-gray-400 pt-20">Aucune donnée</p>
              )}
            </ChartCard>
          </div>
        </div>
      </main>
    </div>
  );
}
