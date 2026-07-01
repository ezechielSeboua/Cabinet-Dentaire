import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CgSpinner } from "react-icons/cg";
import { IoArrowBack } from "react-icons/io5";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";
import { insuranceAndPatientList } from "../../services/cdiService";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const NON_ASSURED = ["NA", "NON ASSURE", "NON ASSURÉ", "NON ASSURÉ(E)", "UNDEFINED", ""];
const isInsured = (ins) => ins && !NON_ASSURED.includes(ins.trim().toUpperCase());

// ── sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, colorClass }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow p-5 border-l-4 ${colorClass}`}>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-2xl sm:text-3xl font-bold mt-1">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ── main component ────────────────────────────────────────────────────────────
export default function InsuredVsUninsuredReport() {
  const sidebarMargin = useSidebarMargin();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    insuranceAndPatientList()
      .then((res) => setPatients(res.data))
      .catch((err) => console.error("Failed to load patients:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // ── data processing ────────────────────────────────────────────────────────
  const { insuredCount, uninsuredCount, byInsurance, total } = useMemo(() => {
    const insuredList = patients.filter((p) => isInsured(p.insurance));
    const uninsuredList = patients.filter((p) => !isInsured(p.insurance));

    const map = insuredList.reduce((acc, p) => {
      const name = p.insurance.trim().toUpperCase();
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const byInsurance = Object.entries(map).sort(([, a], [, b]) => b - a);

    return {
      insuredCount: insuredList.length,
      uninsuredCount: uninsuredList.length,
      byInsurance,
      total: patients.length,
    };
  }, [patients]);

  const insuredPct  = total > 0 ? ((insuredCount / total) * 100).toFixed(1) : "0.0";
  const uninsuredPct = total > 0 ? ((uninsuredCount / total) * 100).toFixed(1) : "0.0";

  // ── charts ─────────────────────────────────────────────────────────────────
  const doughnutData = {
    labels: ["Assurés", "Non assurés"],
    datasets: [{
      data: [insuredCount, uninsuredCount],
      backgroundColor: ["rgba(13, 148, 136, 0.8)", "rgba(239, 68, 68, 0.8)"],
      borderColor:     ["rgba(13, 148, 136, 1)",   "rgba(239, 68, 68, 1)"],
      borderWidth: 2,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ` ${ctx.label} : ${ctx.raw} patient(s) (${((ctx.raw / total) * 100).toFixed(1)}%)`,
        },
      },
    },
  };

  const barData = {
    labels: byInsurance.map(([name]) =>
      name.length > 28 ? name.slice(0, 28) + "…" : name
    ),
    datasets: [{
      label: "Nombre de patients",
      data: byInsurance.map(([, count]) => count),
      backgroundColor: "rgba(13, 148, 136, 0.75)",
      borderColor:     "rgba(13, 148, 136, 1)",
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const barOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: "#6b7280" },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        ticks: { color: "#6b7280" },
        grid: { display: false },
      },
    },
  };

  // ── Excel export ───────────────────────────────────────────────────────────
  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1 — summary
    const ws1 = XLSX.utils.json_to_sheet([
      { "Catégorie": "Total Patients",        "Nombre": total,          "Pourcentage": "100%" },
      { "Catégorie": "Patients Assurés",       "Nombre": insuredCount,   "Pourcentage": `${insuredPct}%` },
      { "Catégorie": "Patients Non Assurés",   "Nombre": uninsuredCount, "Pourcentage": `${uninsuredPct}%` },
    ]);
    ws1["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Résumé");

    // Sheet 2 — breakdown by insurance
    const ws2 = XLSX.utils.json_to_sheet(
      byInsurance.map(([name, count]) => ({
        "Compagnie d'assurance": name,
        "Nombre de Patients": count,
        "% du total patients": `${((count / total) * 100).toFixed(1)}%`,
        "% des patients assurés": `${((count / insuredCount) * 100).toFixed(1)}%`,
      }))
    );
    ws2["!cols"] = [{ wch: 40 }, { wch: 20 }, { wch: 22 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Par Assurance");

    XLSX.writeFile(wb, "Rapport_Assures_vs_NonAssures.xlsx");
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <SideBar2 />
      <div className="fixed top-0 left-0 w-full z-10">
        <Header />
      </div>

      <main className={`h-full ml-0 mt-14 p-6 space-y-6 ${sidebarMargin}`}>

        {/* ── page header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Assurés vs Non Assurés</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Répartition des patients selon leur couverture d'assurance
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && total > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
              >
                <FaFileExcel /> Excel
              </button>
            )}
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 hover:border-primary-300 transition-all"
            >
              <IoArrowBack size={16} />
              Retour
            </Link>
          </div>
        </div>

        {/* ── loading ── */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <CgSpinner className="animate-spin text-primary-600" size={48} />
          </div>
        ) : (
          <>
            {/* ── stat cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Total Patients"
                value={total.toLocaleString("fr-FR")}
                colorClass="border-gray-400"
              />
              <StatCard
                label="Patients Assurés"
                value={insuredCount.toLocaleString("fr-FR")}
                sub={`${insuredPct}% du total`}
                colorClass="border-primary-500"
              />
              <StatCard
                label="Patients Non Assurés"
                value={uninsuredCount.toLocaleString("fr-FR")}
                sub={`${uninsuredPct}% du total`}
                colorClass="border-red-500"
              />
            </div>

            {/* ── charts ── */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              {/* Doughnut */}
              <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                  Répartition globale
                </h2>
                <div style={{ height: "320px" }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              </div>

              {/* Bar — breakdown by company */}
              <div className="xl:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                  Patients assurés par compagnie ({byInsurance.length})
                </h2>
                {byInsurance.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">
                    Aucune donnée disponible.
                  </p>
                ) : (
                  <div style={{ height: `${Math.max(byInsurance.length * 42, 200)}px` }}>
                    <Bar data={barData} options={barOptions} />
                  </div>
                )}
              </div>
            </div>

            {/* ── detail table ── */}
            {byInsurance.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    Détail par compagnie d'assurance
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Compagnie d'assurance</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Nb. Patients</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">% du total</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-48">Proportion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {byInsurance.map(([name, count], i) => {
                        const pct = ((count / total) * 100).toFixed(1);
                        return (
                          <tr
                            key={name}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                            <td className="px-6 py-3 font-medium text-gray-800 dark:text-gray-200">
                              {name}
                            </td>
                            <td className="px-6 py-3 text-right font-mono font-semibold text-primary-600">
                              {count}
                            </td>
                            <td className="px-6 py-3 text-right text-gray-500">{pct}%</td>
                            <td className="px-6 py-3">
                              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-primary-500 h-2 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
