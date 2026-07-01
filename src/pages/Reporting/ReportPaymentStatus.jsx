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

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const palette = [
  "rgba(20,184,166,0.85)",
  "rgba(59,130,246,0.85)",
  "rgba(249,115,22,0.85)",
  "rgba(168,85,247,0.85)",
  "rgba(234,179,8,0.85)",
  "rgba(16,185,129,0.85)",
  "rgba(236,72,153,0.85)",
];

const ChartCard = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h2>
    <div className="h-80 w-full">{children}</div>
  </div>
);

const StatCard = ({ label, value, sub, accent }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 flex flex-col gap-1 border-l-4 ${accent}`}>
    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
    {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-lg font-bold text-gray-700 dark:text-white mt-8 mb-3 border-b border-gray-200 dark:border-gray-600 pb-2">
    {children}
  </h2>
);

const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(Math.round(n));

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: "top", labels: { color: "#4b5563" } } },
  cutout: "60%",
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { color: "#6b7280" }, grid: { color: "rgba(0,0,0,0.05)" } },
    x: { ticks: { color: "#6b7280" }, grid: { display: false } },
  },
};

export default function ReportPaymentStatus() {
  const sidebarMargin = useSidebarMargin();
  const [treatments, setTreatments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const firstOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(firstOfYear);
  const [endDate, setEndDate] = useState(today);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      cdiService.getTreatmentStats(startDate, endDate),
      cdiService.getBillsByDateRange(startDate, endDate),
    ])
      .then(([tRes, bRes]) => {
        setTreatments(tRes.data || []);
        setBills(bRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Treatment-level stats ─────────────────────────────────────────────────
  const paid = useMemo(() => treatments.filter((t) => t.statuspayment === "Payé"), [treatments]);
  const unpaid = useMemo(() => treatments.filter((t) => t.statuspayment !== "Payé"), [treatments]);

  const totalPaidPatient = useMemo(
    () => paid.reduce((s, t) => s + (t.partpatient || 0), 0),
    [paid]
  );
  const totalUnpaidPatient = useMemo(
    () => unpaid.reduce((s, t) => s + (t.partpatient || 0), 0),
    [unpaid]
  );
  const totalInsurancePaid = useMemo(
    () => paid.reduce((s, t) => s + (t.partinsurance || 0) + (t.partinsurance2 || 0), 0),
    [paid]
  );
  const totalInsuranceUnpaid = useMemo(
    () => unpaid.reduce((s, t) => s + (t.partinsurance || 0) + (t.partinsurance2 || 0), 0),
    [unpaid]
  );

  // Unpaid by doctor
  const unpaidByDoctor = useMemo(() => {
    const map = {};
    unpaid.forEach((t) => {
      const doc = t.doctorname || t.doctor || "Non défini";
      if (!map[doc]) map[doc] = { count: 0, amount: 0 };
      map[doc].count += 1;
      map[doc].amount += t.partpatient || 0;
    });
    return map;
  }, [unpaid]);
  const unpaidDoctors = Object.keys(unpaidByDoctor);

  // ── Bill-level stats (payment methods) ────────────────────────────────────
  const byMethod = useMemo(() => {
    const map = {};
    bills.forEach((b) => {
      const m = b.paymentmethod || "Non défini";
      if (!map[m]) map[m] = { count: 0, total: 0 };
      map[m].count += 1;
      map[m].total += parseFloat(b.amountpaid || 0);
    });
    return map;
  }, [bills]);

  const methods = Object.keys(byMethod);
  const totalCollected = bills.reduce((s, b) => s + parseFloat(b.amountpaid || 0), 0);

  // ── Chart data ─────────────────────────────────────────────────────────────
  const countChartData = {
    labels: ["Payé", "Impayé"],
    datasets: [{
      data: [paid.length, unpaid.length],
      backgroundColor: ["rgba(20,184,166,0.85)", "rgba(239,68,68,0.85)"],
      borderColor: "#fff",
      borderWidth: 4,
    }],
  };

  const amountChartData = {
    labels: ["Part patient payée", "Part patient impayée"],
    datasets: [{
      data: [totalPaidPatient, totalUnpaidPatient],
      backgroundColor: ["rgba(20,184,166,0.85)", "rgba(239,68,68,0.85)"],
      borderColor: "#fff",
      borderWidth: 4,
    }],
  };

  const unpaidBarData = {
    labels: unpaidDoctors,
    datasets: [{
      label: "Montant impayé (FCFA)",
      data: unpaidDoctors.map((d) => unpaidByDoctor[d].amount),
      backgroundColor: "rgba(239,68,68,0.7)",
      borderRadius: 4,
    }],
  };

  const methodCountData = {
    labels: methods,
    datasets: [{
      data: methods.map((m) => byMethod[m].count),
      backgroundColor: palette,
      borderColor: "#fff",
      borderWidth: 3,
    }],
  };

  const methodAmountData = {
    labels: methods,
    datasets: [{
      label: "Montant encaissé (FCFA)",
      data: methods.map((m) => byMethod[m].total),
      backgroundColor: palette,
      borderRadius: 4,
    }],
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
              Statut des Paiements
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Suivi des traitements payés et impayés
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
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Date de début</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Date de fin</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <button onClick={fetchData}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 cursor-pointer transition-colors self-end">
            Charger
          </button>
          <p className="text-sm text-gray-400 dark:text-gray-500 self-end pb-2">
            {loading
              ? "Chargement..."
              : `${treatments.length} traitement(s) · ${bills.length} paiement(s)`}
          </p>
        </div>

        {/* ── Section 1 : Statut de paiement des traitements ── */}
        <SectionTitle>Statut de paiement des traitements</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Traitements payés" value={paid.length}
            sub={`${fmt(totalPaidPatient)} FCFA (patients)`} accent="border-primary-500" />
          <StatCard label="Traitements impayés" value={unpaid.length}
            sub={`${fmt(totalUnpaidPatient)} FCFA restant`} accent="border-red-500" />
          <StatCard label="Part assurance encaissée" value={`${fmt(totalInsurancePaid)} FCFA`}
            sub="sur traitements payés" accent="border-blue-400" />
          <StatCard label="Part assurance en attente" value={`${fmt(totalInsuranceUnpaid)} FCFA`}
            sub="sur traitements impayés" accent="border-orange-400" />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard title="Nombre de traitements — Payé vs Impayé">
            {treatments.length > 0
              ? <Doughnut options={doughnutOptions} data={countChartData} />
              : <p className="text-center text-gray-400 pt-20">Aucune donnée</p>}
          </ChartCard>

          <ChartCard title="Part patient — Payée vs Impayée (FCFA)">
            {treatments.length > 0
              ? <Doughnut options={doughnutOptions} data={amountChartData} />
              : <p className="text-center text-gray-400 pt-20">Aucune donnée</p>}
          </ChartCard>

          {unpaidDoctors.length > 0 && (
            <div className="lg:col-span-2">
              <ChartCard title="Montant impayé des traitements par médecin (FCFA)">
                <Bar options={barOptions} data={unpaidBarData} />
              </ChartCard>
            </div>
          )}
        </div>

        {/* ── Section 2 : Mode de paiement ── */}
        <SectionTitle>Mode de paiement</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total encaissé" value={`${fmt(totalCollected)} FCFA`}
            sub={`${bills.length} paiement(s)`} accent="border-primary-500" />
          {methods.map((m, i) => (
            <div key={m}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 flex flex-col gap-1 border-l-4"
              style={{ borderColor: palette[i % palette.length].replace("0.85", "1") }}>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">{m}</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{byMethod[m].count} pmt</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{fmt(byMethod[m].total)} FCFA</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard title="Répartition par mode de paiement (nombre)">
            {bills.length > 0
              ? <Doughnut options={doughnutOptions} data={methodCountData} />
              : <p className="text-center text-gray-400 pt-20">Aucune donnée</p>}
          </ChartCard>

          <ChartCard title="Montant encaissé par mode de paiement (FCFA)">
            {bills.length > 0
              ? <Bar options={barOptions} data={methodAmountData} />
              : <p className="text-center text-gray-400 pt-20">Aucune donnée</p>}
          </ChartCard>
        </div>

        {/* ── Section 3 : Liste des traitements impayés ── */}
        {unpaid.length > 0 && (
          <>
            <SectionTitle>Liste des traitements impayés</SectionTitle>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {unpaid.length} traitement(s) impayé(s)
                </span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  {fmt(totalUnpaidPatient)} FCFA en attente
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {["Patient", "N° Patient", "Médecin", "Assurance", "Part Patient", "Date"].map((h) => (
                        <th key={h}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {unpaid.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{t.patientname}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{t.patientno}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{t.doctorname || t.doctor || "—"}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {[t.insurance, t.insurance2].filter(Boolean).join(" / ") || "Non assuré"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-red-600 dark:text-red-400">
                          {fmt(t.partpatient || 0)} FCFA
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {t.registeredOn
                            ? new Date(t.registeredOn).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
