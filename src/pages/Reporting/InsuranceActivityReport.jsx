import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
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
import { IoArrowBack, IoSearchOutline, IoChevronDown, IoChevronUp } from "react-icons/io5";
import { FaFileExcel } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { AiFillInsurance } from "react-icons/ai";

import { getCurrentUser } from "../../services/authService";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";
import { API_URL } from "../../utils/config";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ─── helpers ────────────────────────────────────────────────────────────────
const toYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const fmtDate = (ymd) => {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-");
  return `${d}-${m}-${y}`;
};

const NON_ASSURED = ["NA", "NON ASSURE", "NON ASSURÉ", "UNDEFINED", ""];

const isValid = (name) =>
  name && !NON_ASSURED.includes(name.trim().toUpperCase());

const fmt = (n) => (n || 0).toLocaleString("fr-FR");

// ─── sub-components ──────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-2xl sm:text-3xl font-bold text-primary-600 mt-1">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ─── main component ──────────────────────────────────────────────────────────
export default function InsuranceActivityReport() {
  const sidebarMargin = useSidebarMargin();
  const [currentUser] = useState(getCurrentUser());
  const userRole = currentUser?.body?.roles[0]?.toString().toUpperCase();
  const isDoctor = userRole === "DOCTOR";
  const doctorEmail = currentUser?.body?.email?.trim().toLowerCase();

  const [startDate, setStartDate] = useState(() =>
    toYMD(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  );
  const [endDate, setEndDate] = useState(() => toYMD(new Date()));
  const [rawData, setRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [expandedDoctors, setExpandedDoctors] = useState({});

  // ── fetch ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.warn("Veuillez sélectionner une date de début et de fin.", {
        theme: "colored",
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/treatment/${startDate}/${endDate}`);
      if (!res.ok) throw new Error(res.statusText);
      let result = await res.json();
      if (isDoctor && doctorEmail) {
        result = result.filter(
          (t) => t.doctor?.trim().toLowerCase() === doctorEmail
        );
      }
      setRawData(result);
      setExpanded({});
      if (result.length === 0) {
        toast.info("Aucun traitement trouvé pour la période sélectionnée.", {
          theme: "colored",
          position: "top-center",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la récupération des données.", {
        theme: "dark",
      });
      setRawData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── aggregation ────────────────────────────────────────────────────────────
  const { groups, totals } = useMemo(() => {
    const map = new Map();
    let grandAmount = 0;
    let grandTarif = 0;
    let grandActs = 0;

    const push = (insuranceName, amount, tarif, treatment) => {
      if (!isValid(insuranceName) || amount <= 0) return;
      if (!map.has(insuranceName)) {
        map.set(insuranceName, { totalAmount: 0, totalTarif: 0, actsCount: 0, doctors: new Map() });
      }
      const g = map.get(insuranceName);
      g.totalAmount += amount;
      g.totalTarif += tarif;
      g.actsCount += 1;
      grandAmount += amount;
      grandTarif += tarif;
      grandActs += 1;

      const doc = treatment.doctorname || "Inconnu";
      if (!g.doctors.has(doc)) {
        g.doctors.set(doc, { actsCount: 0, totalAmount: 0, totalTarif: 0, rows: [] });
      }
      const d = g.doctors.get(doc);
      d.actsCount += 1;
      d.totalAmount += amount;
      d.totalTarif += tarif;
      d.rows.push({ ...treatment, _insuranceName: insuranceName });
    };

    rawData.forEach((t) => {
      push(t.insurance, t.partinsurance || 0, t.tarifAssurance || 0, t);
      push(t.insurance2, t.partinsurance2 || 0, t.tarifAssurance2 || 0, t);
    });

    const sorted = Array.from(map.entries()).sort(
      ([, a], [, b]) => b.totalAmount - a.totalAmount
    );

    return {
      groups: sorted,
      totals: { grandAmount, grandTarif, grandActs, insuranceCount: map.size },
    };
  }, [rawData]);

  // ── doctor groups (admin only) ─────────────────────────────────────────────
  const doctorGroups = useMemo(() => {
    if (isDoctor) return [];
    const map = new Map();

    const push = (doctorName, insuranceName, amount, tarif, treatment) => {
      if (!isValid(insuranceName) || amount <= 0) return;
      if (!map.has(doctorName)) {
        map.set(doctorName, { totalAmount: 0, totalTarif: 0, actsCount: 0, insurances: new Map() });
      }
      const d = map.get(doctorName);
      d.totalAmount += amount;
      d.totalTarif += tarif;
      d.actsCount += 1;
      if (!d.insurances.has(insuranceName)) {
        d.insurances.set(insuranceName, { actsCount: 0, totalAmount: 0, totalTarif: 0, rows: [] });
      }
      const ins = d.insurances.get(insuranceName);
      ins.actsCount += 1;
      ins.totalAmount += amount;
      ins.totalTarif += tarif;
      ins.rows.push(treatment);
    };

    rawData.forEach((t) => {
      const doc = t.doctorname || "Inconnu";
      push(doc, t.insurance, t.partinsurance || 0, t.tarifAssurance || 0, t);
      push(doc, t.insurance2, t.partinsurance2 || 0, t.tarifAssurance2 || 0, t);
    });

    return Array.from(map.entries()).sort(([, a], [, b]) => b.totalAmount - a.totalAmount);
  }, [rawData, isDoctor]);

  // ── chart data ─────────────────────────────────────────────────────────────
  const chartData = useMemo(() => ({
    labels: groups.map(([name]) =>
      name.length > 28 ? name.slice(0, 28) + "…" : name
    ),
    datasets: [
      {
        label: "Montant pris en charge (FCFA)",
        data: groups.map(([, g]) => g.totalAmount),
        backgroundColor: "rgba(2, 132, 199, 0.75)",
        borderColor: "rgba(2, 132, 199, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }), [groups]);

  const chartOptions = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.x.toLocaleString("fr-FR")} FCFA`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (v) => `${(v / 1000).toFixed(0)}k`,
        },
      },
    },
  };

  // ── Excel export ───────────────────────────────────────────────────────────
  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1 — summary per insurance
    const summaryRows = groups.map(([name, g]) => ({
      "Assurance": name,
      "Nombre d'actes": g.actsCount,
      "Total Tarif de Base (FCFA)": g.totalTarif,
      "Total Pris en Charge (FCFA)": g.totalAmount,
    }));
    const wsSum = XLSX.utils.json_to_sheet(summaryRows);
    wsSum["!cols"] = [{ wch: 40 }, { wch: 15 }, { wch: 24 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, wsSum, "Résumé par Assurance");

    // Sheet 2 — full detail per insurance / doctor / treatment
    const detailRows = [];
    groups.forEach(([insuranceName, g]) => {
      Array.from(g.doctors.entries()).forEach(([doctorName, d]) => {
        d.rows.forEach((t) => {
          const isIns1 = t.insurance === insuranceName;
          const amount = isIns1 ? (t.partinsurance || 0) : (t.partinsurance2 || 0);
          const tarif = isIns1 ? (t.tarifAssurance || 0) : (t.tarifAssurance2 || 0);
          detailRows.push({
            "Assurance": insuranceName,
            "Docteur": doctorName,
            "Patient": t.patientname,
            "Date": fmtDate(t.treatmentof),
            "Tarif de Base (FCFA)": tarif,
            "Montant Assurance (FCFA)": amount,
            "Statut Facture": t.statuspayment,
            "Statut Traitement": t.treatmentstatus,
          });
        });
      });
    });
    const wsDet = XLSX.utils.json_to_sheet(detailRows);
    wsDet["!cols"] = [
      { wch: 40 }, { wch: 25 }, { wch: 25 },
      { wch: 14 }, { wch: 20 }, { wch: 22 }, { wch: 18 }, { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, wsDet, "Détail Complet");

    // Sheet 3 — detail per doctor (admin only)
    if (!isDoctor && doctorGroups.length > 0) {
      const doctorRows = [];
      doctorGroups.forEach(([doctorName, d]) => {
        Array.from(d.insurances.entries()).forEach(([insuranceName, ins]) => {
          ins.rows.forEach((t) => {
            const isIns1 = t.insurance === insuranceName;
            const amount = isIns1 ? (t.partinsurance || 0) : (t.partinsurance2 || 0);
            const tarif = isIns1 ? (t.tarifAssurance || 0) : (t.tarifAssurance2 || 0);
            doctorRows.push({
              "Docteur": doctorName,
              "Assurance": insuranceName,
              "Patient": t.patientname,
              "Date": fmtDate(t.treatmentof),
              "Tarif de Base (FCFA)": tarif,
              "Montant Assurance (FCFA)": amount,
              "Statut Facture": t.statuspayment,
            });
          });
        });
      });
      const wsDoc = XLSX.utils.json_to_sheet(doctorRows);
      wsDoc["!cols"] = [{ wch: 25 }, { wch: 40 }, { wch: 25 }, { wch: 14 }, { wch: 20 }, { wch: 22 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, wsDoc, "Détail par Docteur");
    }

    XLSX.writeFile(wb, `Rapport_Assurances_${startDate}_au_${endDate}.xlsx`);
  };

  const toggle = (name) =>
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  const toggleDoctor = (name) =>
    setExpandedDoctors((prev) => ({ ...prev, [name]: !prev[name] }));

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <SideBar2 />
      <div className="fixed top-0 left-0 w-full z-10">
        <Header />
      </div>

      <main className={`h-full ml-0 mt-14 p-6 space-y-6 ${sidebarMargin}`}>
        {/* ── page header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Rapport d'Activité par Assurance</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Analyse des actes et montants pris en charge par compagnie d'assurance
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

        {/* ── date range form ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Date de début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex justify-center items-center gap-2 bg-primary-600 text-white font-bold py-2.5 px-4 rounded-md shadow hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  "Chargement..."
                ) : (
                  <>
                    <IoSearchOutline size={18} /> Générer le rapport
                  </>
                )}
              </button>
              {rawData.length > 0 && (
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-emerald-700 transition-colors"
                >
                  <FaFileExcel /> Excel
                </button>
              )}
            </div>
          </form>
        </div>

        {rawData.length > 0 && (
          <>
            {/* ── summary cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Assurances impliquées"
                value={totals.insuranceCount}
              />
              <StatCard
                label="Total actes assurés"
                value={totals.grandActs}
              />
              <StatCard
                label="Total Tarif de Base"
                value={`${fmt(totals.grandTarif)} FCFA`}
              />
              <StatCard
                label="Total pris en charge"
                value={`${fmt(totals.grandAmount)} FCFA`}
              />
            </div>

            {/* ── chart ── */}
            {groups.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                  Toutes les Assurances par Montant ({groups.length})
                </h2>
                <Bar
                  data={chartData}
                  options={chartOptions}
                  height={Math.max(groups.length * 38, 120)}
                />
              </div>
            )}

            {/* ── accordion per insurance ── */}
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200">
                Détail par Assurance
              </h2>

              {groups.map(([insuranceName, g]) => (
                <div
                  key={insuranceName}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
                >
                  {/* insurance header */}
                  <button
                    onClick={() => toggle(insuranceName)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <AiFillInsurance
                        size={22}
                        className="text-primary-500 flex-shrink-0"
                      />
                      <div className="text-left">
                        <p className="font-bold text-gray-800 dark:text-white">
                          {insuranceName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {g.doctors.size} docteur(s) · {g.actsCount} acte(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg text-red-400">
                          Tarif de base: {fmt(g.totalTarif)} FCFA
                        </p>
                        <p className="font-bold text-primary-600 text-lg">
                          {fmt(g.totalAmount)} FCFA
                        </p>
                      </div>
                      {expanded[insuranceName] ? (
                        <IoChevronUp className="text-gray-400" />
                      ) : (
                        <IoChevronDown className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* expanded: doctor breakdown */}
                  {expanded[insuranceName] && (
                    <div className="border-t dark:border-gray-700">
                      {Array.from(g.doctors.entries()).map(
                        ([doctorName, d]) => (
                          <div
                            key={doctorName}
                            className="border-b last:border-0 dark:border-gray-700"
                          >
                            {/* doctor summary */}
                            <div className="flex items-center justify-between px-6 py-3 bg-primary-50 dark:bg-primary-900/20">
                              <div>
                                <span className="font-semibold text-primary-800 dark:text-primary-300">
                                  {doctorName}
                                </span>
                                <span className="ml-3 text-sm text-gray-500">
                                  {d.actsCount} acte(s)
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-lg text-red-400">Tarif de base: {fmt(d.totalTarif)} FCFA</p>
                                <p className="font-mono font-semibold text-gray-800 dark:text-white">
                                  {fmt(d.totalAmount)} FCFA
                                </p>
                              </div>
                            </div>

                            {/* treatments table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                  <tr>
                                    <th className="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Tarif de Base</th>
                                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant assurance</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Facture</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                  {d.rows.map((t, i) => {
                                    const isIns1 = t.insurance === insuranceName;
                                    const amount = isIns1 ? t.partinsurance || 0 : t.partinsurance2 || 0;
                                    const tarif = isIns1 ? t.tarifAssurance || 0 : t.tarifAssurance2 || 0;
                                    return (
                                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-2 font-medium text-gray-800 dark:text-gray-200">{t.patientname}</td>
                                        <td className="px-4 py-2 text-gray-500">{fmtDate(t.treatmentof)}</td>
                                        <td className="px-4 py-2 text-right font-mono text-gray-500 dark:text-gray-400">{fmt(tarif)} FCFA</td>
                                        <td className="px-4 py-2 text-right font-mono text-gray-800 dark:text-white">{fmt(amount)} FCFA</td>
                                        <td className="px-4 py-2 text-gray-500">{t.statuspayment}</td>
                                        <td className="px-4 py-2 text-gray-500">{t.treatmentstatus}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── admin-only: accordion per doctor ── */}
            {!isDoctor && doctorGroups.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200">
                  Détail par Docteur
                </h2>

                {doctorGroups.map(([doctorName, d]) => (
                  <div
                    key={doctorName}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden"
                  >
                    {/* doctor header */}
                    <button
                      onClick={() => toggleDoctor(doctorName)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <FaUserDoctor size={20} className="text-indigo-500 flex-shrink-0" />
                        <div className="text-left">
                          <p className="font-bold text-gray-800 dark:text-white">
                            {doctorName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {d.insurances.size} assurance(s) · {d.actsCount} acte(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg text-red-400">Tarif de base: {fmt(d.totalTarif)} FCFA</p>
                          <p className="font-bold text-indigo-600 text-lg">{fmt(d.totalAmount)} FCFA</p>
                        </div>
                        {expandedDoctors[doctorName] ? (
                          <IoChevronUp className="text-gray-400" />
                        ) : (
                          <IoChevronDown className="text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* expanded: insurance breakdown per doctor */}
                    {expandedDoctors[doctorName] && (
                      <div className="border-t dark:border-gray-700">
                        {Array.from(d.insurances.entries())
                          .sort(([, a], [, b]) => b.totalAmount - a.totalAmount)
                          .map(([insuranceName, ins]) => (
                            <div
                              key={insuranceName}
                              className="border-b last:border-0 dark:border-gray-700"
                            >
                              {/* insurance summary */}
                              <div className="flex items-center justify-between px-6 py-3 bg-primary-50 dark:bg-primary-900/20">
                                <div className="flex items-center gap-2">
                                  <AiFillInsurance className="text-indigo-400" size={16} />
                                  <span className="font-semibold text-indigo-800 dark:text-indigo-300">
                                    {insuranceName}
                                  </span>
                                  <span className="ml-2 text-sm text-gray-500">
                                    {ins.actsCount} acte(s)
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg text-red-400">Tarif de base : {fmt(ins.totalTarif)} FCFA</p>
                                  <p className="font-mono font-semibold text-gray-800 dark:text-white">
                                    {fmt(ins.totalAmount)} FCFA
                                  </p>
                                </div>
                              </div>

                              {/* treatments table */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                      <th className="px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Tarif de Base</th>
                                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Montant</th>
                                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Facture</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {ins.rows.map((t, i) => {
                                      const isIns1 = t.insurance === insuranceName;
                                      const amount = isIns1 ? t.partinsurance || 0 : t.partinsurance2 || 0;
                                      const tarif = isIns1 ? t.tarifAssurance || 0 : t.tarifAssurance2 || 0;
                                      return (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                          <td className="px-6 py-2 font-medium text-gray-800 dark:text-gray-200">{t.patientname}</td>
                                          <td className="px-4 py-2 text-gray-500">{fmtDate(t.treatmentof)}</td>
                                          <td className="px-4 py-2 text-right font-mono text-gray-500 dark:text-gray-400">{fmt(tarif)} FCFA</td>
                                          <td className="px-4 py-2 text-right font-mono text-gray-800 dark:text-white">{fmt(amount)} FCFA</td>
                                          <td className="px-4 py-2 text-gray-500">{t.statuspayment}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
