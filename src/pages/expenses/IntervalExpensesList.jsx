import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../utils/config";
import { toast } from "react-toastify";
import { IoDocumentTextOutline } from "react-icons/io5";
import { RiArrowGoBackFill } from "react-icons/ri";
import { PiEye } from "react-icons/pi";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import * as XLSX from "xlsx";

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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const fmt = (n) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const COLORS = [
  "rgba(20,184,166,0.8)",
  "rgba(59,130,246,0.8)",
  "rgba(249,115,22,0.8)",
  "rgba(168,85,247,0.8)",
  "rgba(234,179,8,0.8)",
  "rgba(220,38,38,0.8)",
  "rgba(16,185,129,0.8)",
  "rgba(236,72,153,0.8)",
];

export default function IntervalExpensesList() {
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.warn("Veuillez sélectionner une date de début et de fin.", { theme: "colored" });
      return;
    }
    setLoading(true);
    fetch(`${API_URL}/expense/${startDate}/${endDate}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        // Expand all groups by default
        const keys = {};
        (d || []).forEach((item) => { keys[item.expense || "Non défini"] = true; });
        setOpenGroups(keys);
      })
      .catch(() => toast.error("Erreur lors de la récupération des données.", { theme: "colored" }))
      .finally(() => setLoading(false));
  };

  // Group by expense type
  const grouped = useMemo(() => {
    const map = {};
    (data || []).forEach((item) => {
      const type = item.expense || "Non défini";
      if (!map[type]) map[type] = { items: [], total: 0 };
      map[type].items.push(item);
      map[type].total += parseFloat(item.amount || 0);
    });
    // Sort groups by total descending
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [data]);

  const totalSolde = useMemo(
    () => data.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0),
    [data]
  );

  const toggleGroup = (type) =>
    setOpenGroups((prev) => ({ ...prev, [type]: !prev[type] }));

  // Chart data
  const chartData = {
    labels: grouped.map(([type]) => type),
    datasets: [
      {
        label: "Total (FCFA)",
        data: grouped.map(([, g]) => g.total),
        backgroundColor: grouped.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => ` ${fmt(ctx.raw)}` },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: "#6b7280", callback: (v) => fmt(v) },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        ticks: { color: "#6b7280" },
        grid: { display: false },
      },
    },
  };

  // 40 px per bar, min 200 px
  const chartHeight = Math.max(grouped.length * 44, 200);

  const handleExcelExport = () => {
    if (data.length === 0) {
      toast.info("Il n'y a aucune donnée à exporter.", { theme: "colored" });
      return;
    }
    const rows = [];
    grouped.forEach(([type, g]) => {
      rows.push({ "Type de dépense": type, Dépense: "", Montant: "", Date: "" });
      g.items.forEach((item) =>
        rows.push({
          "Type de dépense": "",
          Dépense: item.expense,
          Montant: item.amount,
          Date: new Date(item.expenseof).toLocaleDateString("fr-FR"),
        })
      );
      rows.push({ "Type de dépense": "Sous-total", Dépense: "", Montant: g.total, Date: "" });
      rows.push({});
    });
    rows.push({ "Type de dépense": "TOTAL GÉNÉRAL", Dépense: "", Montant: totalSolde, Date: "" });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dépenses");
    XLSX.writeFile(wb, `Rapport_Dépenses_${startDate}_au_${endDate}.xlsx`);
  };

  const periodLabel =
    startDate && endDate
      ? `Période du ${new Date(startDate).toLocaleDateString("fr-FR")} au ${new Date(endDate).toLocaleDateString("fr-FR")}`
      : "Veuillez sélectionner une période";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-0">
      {/* Page header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6 pt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          Rapport des dépenses
        </h1>
        <Link
          to="/expenses"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 hover:border-primary-300 transition-all duration-150"
        >
          <RiArrowGoBackFill size={16} />
          Retour
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-end gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date de début
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || today}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date de fin
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold border-2 border-primary-600 text-primary-700 dark:text-primary-400 hover:bg-primary-600 hover:text-white transition-all"
          >
            <PiEye size={18} />
            Afficher
          </button>
          {data.length > 0 && (
            <button
              type="button"
              onClick={handleExcelExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold transition-colors"
            >
              <IoDocumentTextOutline />
              Exporter Excel
            </button>
          )}
        </form>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500" />
        </div>
      )}

      {!loading && data.length > 0 && (
        <>
          {/* Summary header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{periodLabel}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {data.length} dépense{data.length > 1 ? "s" : ""} · {grouped.length} type{grouped.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total général</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{fmt(totalSolde)}</p>
            </div>
          </div>

          {/* Bar chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 mb-6">
            <h2 className="text-base font-semibold text-gray-700 dark:text-white mb-4">
              Montant par type de dépense
            </h2>
            <div className="overflow-y-auto max-h-96">
              <div style={{ height: chartHeight }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Grouped details */}
          <div className="space-y-3 mb-8">
            {grouped.map(([type, g], i) => (
              <div
                key={type}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(type)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length].replace("0.8", "1") }}
                    />
                    <span className="font-semibold text-gray-800 dark:text-white">{type}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {g.items.length} entrée{g.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800 dark:text-white">{fmt(g.total)}</span>
                    {openGroups[type]
                      ? <MdKeyboardArrowUp size={20} className="text-gray-400" />
                      : <MdKeyboardArrowDown size={20} className="text-gray-400" />}
                  </div>
                </button>

                {/* Group rows */}
                {openGroups[type] && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <th className="text-left px-5 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                          <th className="text-left px-5 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Description</th>
                          <th className="text-right px-5 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {g.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-5 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                              {new Date(item.expenseof).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                              {item.description || "—"}
                            </td>
                            <td className="px-5 py-3 text-right font-medium text-gray-800 dark:text-white">
                              {fmt(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 dark:bg-gray-700">
                          <td colSpan={2} className="px-5 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            Sous-total
                          </td>
                          <td className="px-5 py-2 text-right font-bold text-gray-800 dark:text-white">
                            {fmt(g.total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && data.length === 0 && (startDate || endDate) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center text-gray-400 dark:text-gray-500">
          Aucune dépense trouvée pour la période sélectionnée.
        </div>
      )}
    </div>
  );
}
