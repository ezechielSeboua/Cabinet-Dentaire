import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
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
import { IoArrowBack } from "react-icons/io5";
import { MdBarChart, MdPeopleAlt, MdShowChart, MdHealthAndSafety, MdPersonOutline } from "react-icons/md";
import { FaUserDoctor } from "react-icons/fa6";
import { getCurrentUser } from "../../services/authService";
import { getTreatmentStats } from "../../services/cdiService";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// ─── helpers ─────────────────────────────────────────────────────────────────
const toYMD = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const fmt = (n) => (n || 0).toLocaleString("fr-FR");

const NON_ASSURED = ["NA", "NON ASSURE", "NON ASSURÉ", "UNDEFINED", ""];
const isValidInsurance = (name) =>
  name && !NON_ASSURED.includes(name.trim().toUpperCase());

const AGE_GROUPS = ["0-17", "18-30", "31-45", "46-60", "61+"];

// Enough colours for 40+ insurances — repeating palette is fine
const PALETTE = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#6366f1",
  "#ec4899", "#a855f7", "#fb923c", "#22d3ee", "#f43f5e",
  "#0ea5e9", "#d946ef", "#65a30d", "#dc2626", "#7c3aed",
  "#059669", "#b45309", "#0284c7", "#9333ea", "#16a34a",
  "#ca8a04", "#2563eb", "#db2777", "#15803d", "#c2410c",
  "#4f46e5", "#0891b2", "#7e22ce", "#166534", "#92400e",
  "#1d4ed8", "#be185d", "#065f46", "#78350f", "#1e3a5f",
];

const paletteAt = (i) => PALETTE[i % PALETTE.length];

function getAgeGroup(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--;
  if (age < 18) return "0-17";
  if (age <= 30) return "18-30";
  if (age <= 45) return "31-45";
  if (age <= 60) return "46-60";
  return "61+";
}

// ─── scrollable horizontal bar wrapper ───────────────────────────────────────
// Renders a horizontal Bar that auto-sizes its height (36 px per bar) so every
// insurance label is readable, with a capped scrollable container.
const BAR_HEIGHT = 36; // px per row
const MIN_H = 200;
const MAX_VISIBLE_H = 520; // container clips here; user scrolls for the rest

function ScrollableHBar({ data, title, isCurrency = false }) {
  const count = data.labels?.length || 0;
  const innerH = Math.max(MIN_H, count * BAR_HEIGHT);
  const outerH = Math.min(innerH, MAX_VISIBLE_H);

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        font: { size: 13, weight: "600" },
        color: "#374151",
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            isCurrency
              ? ` ${fmt(ctx.parsed.x)} F CFA`
              : ` ${ctx.parsed.x}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: isCurrency ? (v) => fmt(v) : undefined,
        },
      },
      y: {
        ticks: { font: { size: 11 } },
      },
    },
  };

  return (
    <div style={{ height: outerH, overflowY: "auto" }}>
      <div style={{ height: innerH }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

// ─── sub-components ──────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-5 flex items-center gap-4">
    {Icon && (
      <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${color}`}>
        <Icon size={22} />
      </div>
    )}
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
    </div>
  </div>
);

const ChartCard = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl shadow p-5 ${className}`}>
    {children}
  </div>
);

const verticalBarOptions = (title, isCurrency = false) => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: title, font: { size: 13, weight: "600" }, color: "#374151" },
    tooltip: {
      callbacks: {
        label: (ctx) =>
          isCurrency ? ` ${fmt(ctx.parsed.y)} F CFA` : ` ${ctx.parsed.y}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: isCurrency ? (v) => fmt(v) : undefined },
    },
  },
});

const doughnutOptions = (title) => ({
  responsive: true,
  plugins: {
    legend: { position: "right", labels: { boxWidth: 14, font: { size: 12 } } },
    title: { display: true, text: title, font: { size: 13, weight: "600" }, color: "#374151" },
  },
});

// ─── insurance ranked table ───────────────────────────────────────────────────
function InsuranceTable({ amountEntries, countEntries, nonInsured }) {
  const merged = useMemo(() => {
    const map = {};
    amountEntries.forEach(([name, amt]) => {
      map[name] = { name, amount: amt, count: 0, isInsured: true };
    });
    countEntries.forEach(([name, cnt]) => {
      if (map[name]) map[name].count = cnt;
      else map[name] = { name, amount: 0, count: cnt, isInsured: true };
    });
    const rows = Object.values(map).sort((a, b) => b.amount - a.amount);
    if (nonInsured.count > 0) {
      rows.push({ name: "Non Assuré", amount: nonInsured.amount, count: nonInsured.count, isInsured: false });
    }
    return rows;
  }, [amountEntries, countEntries, nonInsured]);

  if (merged.length === 0) return null;

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase">
            <th className="text-left px-4 py-2">#</th>
            <th className="text-left px-4 py-2">Assurance / Statut</th>
            <th className="text-right px-4 py-2">Traitements</th>
            <th className="text-right px-4 py-2">Montant</th>
            <th className="text-left px-4 py-2 text-xs normal-case font-normal text-gray-400">
              (* part patient pour non assurés)
            </th>
          </tr>
        </thead>
        <tbody>
          {merged.map((row, i) => (
            <tr
              key={row.name}
              className={`border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                !row.isInsured ? "bg-slate-50 dark:bg-slate-800/40" : ""
              }`}
            >
              <td className="px-4 py-2 text-gray-400 font-mono">{i + 1}</td>
              <td className="px-4 py-2 font-medium text-gray-800 dark:text-white flex items-center gap-2">
                {!row.isInsured && (
                  <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                    Non assuré
                  </span>
                )}
                {row.name}
              </td>
              <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">{row.count}</td>
              <td className={`px-4 py-2 text-right font-mono font-semibold ${
                row.isInsured ? "text-primary-700 dark:text-primary-400" : "text-slate-600 dark:text-slate-400"
              }`}>
                {fmt(row.amount)} F CFA
              </td>
              <td className="px-4 py-2 text-xs text-gray-400">
                {!row.isInsured ? "* part patient" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function DoctorStatisticsReport() {
  const sidebarMargin = useSidebarMargin();
  const [currentUser] = useState(getCurrentUser());
  const userRole = currentUser?.body?.roles[0]?.toString().toUpperCase();
  const isDoctor = userRole === "DOCTOR";
  const doctorEmail = currentUser?.body?.email?.trim().toLowerCase();

  const [startDate, setStartDate] = useState(() =>
    toYMD(new Date(new Date().getFullYear(), 0, 1))
  );
  const [endDate, setEndDate] = useState(() => toYMD(new Date()));
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [rawTreatments, setRawTreatments] = useState([]);
  const [patientMap, setPatientMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const handleLoad = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.warn("Veuillez sélectionner une période.");
      return;
    }
    setIsLoading(true);
    try {
      // Single call — backend joins treatment + patient (dob, gender)
      const res = await getTreatmentStats(startDate, endDate);
      let treatments = Array.isArray(res.data) ? res.data : [];
      if (isDoctor && doctorEmail) {
        treatments = treatments.filter(
          (t) => t.doctor?.trim().toLowerCase() === doctorEmail
        );
      }

      // Build patient map directly from the enriched response — no second API call
      const pMap = {};
      treatments.forEach((t) => {
        if (t.patientno && !pMap[t.patientno]) {
          pMap[t.patientno] = { dob: t.dob, gender: t.gender };
        }
      });

      setRawTreatments(treatments);
      setPatientMap(pMap);
      setSelectedDoctor("");

      if (treatments.length === 0)
        toast.info("Aucun traitement trouvé pour la période sélectionnée.");
    } catch (err) {
      toast.error(`Erreur: ${err.message || "Impossible de charger les données."}`);
      setRawTreatments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── doctor filter (admin only) ─────────────────────────────────────────────
  const doctors = useMemo(
    () => [...new Set(rawTreatments.map((t) => t.doctorname).filter(Boolean))].sort(),
    [rawTreatments]
  );

  const treatments = useMemo(() => {
    if (!selectedDoctor) return rawTreatments;
    return rawTreatments.filter((t) => t.doctorname === selectedDoctor);
  }, [rawTreatments, selectedDoctor]);

  // ── summary stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const uniquePatients = new Set(treatments.map((t) => t.patientno)).size;
    const totalAmount = treatments.reduce((s, t) => s + (t.treatmentamount || 0), 0);
    const paid = treatments.filter((t) => t.statuspayment === "Payé").length;

    let insuredPatientPart = 0;
    let totalInsurancePart = 0;
    treatments.forEach((t) => {
      const ins1 = isValidInsurance(t.insurance);
      const ins2 = isValidInsurance(t.insurance2);
      if (ins1 || ins2) insuredPatientPart += t.partpatient || 0;
      totalInsurancePart += (t.partinsurance || 0) + (t.partinsurance2 || 0);
    });

    return {
      count: treatments.length,
      patients: uniquePatients,
      totalAmount,
      paidPct: treatments.length > 0 ? Math.round((paid / treatments.length) * 100) : 0,
      insuredPatientPart,
      totalInsurancePart,
    };
  }, [treatments]);

  // ── chart: age groups ──────────────────────────────────────────────────────
  const ageGroupData = useMemo(() => {
    const groups = Object.fromEntries(AGE_GROUPS.map((g) => [g, 0]));
    const seen = new Set();
    treatments.forEach((t) => {
      if (seen.has(t.patientno)) return;
      const patient = patientMap[t.patientno];
      if (!patient?.dob) return;
      seen.add(t.patientno);
      const g = getAgeGroup(patient.dob);
      if (g) groups[g]++;
    });
    return {
      labels: AGE_GROUPS,
      datasets: [{
        label: "Patients",
        data: AGE_GROUPS.map((g) => groups[g]),
        backgroundColor: PALETTE.slice(0, 5),
        borderRadius: 6,
      }],
    };
  }, [treatments, patientMap]);

  // ── chart: gender ──────────────────────────────────────────────────────────
  const genderData = useMemo(() => {
    const counts = { Homme: 0, Femme: 0, Autre: 0 };
    const seen = new Set();
    treatments.forEach((t) => {
      if (seen.has(t.patientno)) return;
      const patient = patientMap[t.patientno];
      if (!patient) return;
      seen.add(t.patientno);
      const g = patient.gender?.toUpperCase();
      if (g === "MALE") counts["Homme"]++;
      else if (g === "FEMELE") counts["Femme"]++;  // EGender enum spelling
      else counts["Autre"]++;
    });
    const labels = Object.keys(counts).filter((k) => counts[k] > 0);
    return {
      labels,
      datasets: [{
        data: labels.map((l) => counts[l]),
        backgroundColor: ["#3b82f6", "#ec4899", "#94a3b8"],
      }],
    };
  }, [treatments, patientMap]);

  // ── chart: payment status ──────────────────────────────────────────────────
  const paymentStatusData = useMemo(() => {
    const paid = treatments.filter((t) => t.statuspayment === "Payé").length;
    const unpaid = treatments.length - paid;
    return {
      labels: ["Payé", "Non Payé"],
      datasets: [{ data: [paid, unpaid], backgroundColor: ["#10b981", "#ef4444"] }],
    };
  }, [treatments]);

  // ── chart: treatment status ────────────────────────────────────────────────
  const treatmentStatusData = useMemo(() => {
    const counts = {};
    treatments.forEach((t) => {
      const s = t.treatmentstatus || "Inconnu";
      counts[s] = (counts[s] || 0) + 1;
    });
    const labels = Object.keys(counts);
    return {
      labels,
      datasets: [{
        data: labels.map((l) => counts[l]),
        backgroundColor: ["#10b981", "#f59e0b", "#3b82f6", "#94a3b8"],
      }],
    };
  }, [treatments]);

  // ── insurance aggregations ─────────────────────────────────────────────────
  const { insuranceAmountEntries, insuranceCountEntries, nonInsured } = useMemo(() => {
    const amtMap = {};
    const cntMap = {};
    let nonInsuredCount = 0;
    let nonInsuredPatientAmt = 0;

    treatments.forEach((t) => {
      const ins1 = isValidInsurance(t.insurance);
      const ins2 = isValidInsurance(t.insurance2);

      if (ins1) {
        if (t.partinsurance > 0)
          amtMap[t.insurance] = (amtMap[t.insurance] || 0) + t.partinsurance;
        cntMap[t.insurance] = (cntMap[t.insurance] || 0) + 1;
      }
      if (ins2) {
        if (t.partinsurance2 > 0)
          amtMap[t.insurance2] = (amtMap[t.insurance2] || 0) + t.partinsurance2;
        cntMap[t.insurance2] = (cntMap[t.insurance2] || 0) + 1;
      }
      if (!ins1 && !ins2) {
        nonInsuredCount++;
        nonInsuredPatientAmt += t.partpatient || 0;
      }
    });

    return {
      insuranceAmountEntries: Object.entries(amtMap).sort(([, a], [, b]) => b - a),
      insuranceCountEntries: Object.entries(cntMap).sort(([, a], [, b]) => b - a),
      nonInsured: { count: nonInsuredCount, amount: nonInsuredPatientAmt },
    };
  }, [treatments]);

  // H-bar chart datasets — all insurances + non-insured row at bottom
  const NON_INSURED_LABEL = "Non Assuré";
  const NON_INSURED_COLOR = "#94a3b8"; // slate-400

  const insuranceAmountData = useMemo(() => {
    const labels = [...insuranceAmountEntries.map(([l]) => l)];
    const data   = [...insuranceAmountEntries.map(([, v]) => v)];
    const colors = [...insuranceAmountEntries.map((_, i) => paletteAt(i))];
    if (nonInsured.count > 0) {
      labels.push(NON_INSURED_LABEL);
      data.push(nonInsured.amount);
      colors.push(NON_INSURED_COLOR);
    }
    return {
      labels,
      datasets: [{ label: "Montant (F CFA)", data, backgroundColor: colors, borderRadius: 4 }],
    };
  }, [insuranceAmountEntries, nonInsured]);

  const insuranceCountData = useMemo(() => {
    const labels = [...insuranceCountEntries.map(([l]) => l)];
    const data   = [...insuranceCountEntries.map(([, v]) => v)];
    const colors = [...insuranceCountEntries.map((_, i) => paletteAt(i))];
    if (nonInsured.count > 0) {
      labels.push(NON_INSURED_LABEL);
      data.push(nonInsured.count);
      colors.push(NON_INSURED_COLOR);
    }
    return {
      labels,
      datasets: [{ label: "Nb. traitements", data, backgroundColor: colors, borderRadius: 4 }],
    };
  }, [insuranceCountEntries, nonInsured]);

  // Insured vs non-insured doughnut
  const insuredVsNotData = useMemo(() => {
    const insuredCount = treatments.length - nonInsured.count;
    return {
      labels: ["Assurés", "Non Assurés"],
      datasets: [{
        data: [insuredCount, nonInsured.count],
        backgroundColor: ["#3b82f6", NON_INSURED_COLOR],
      }],
    };
  }, [treatments, nonInsured]);

  // ── chart: financial breakdown ────────────────────────────────────────────
  const financialBreakdownData = useMemo(() => {
    const sections = [
      { label: "Part Assurances",            value: stats.totalInsurancePart,  color: "#3b82f6" },
      { label: "Part Patient (Assurés)",      value: stats.insuredPatientPart,  color: "#10b981" },
      { label: "Part Patient (Non Assurés)",  value: nonInsured.amount,         color: "#94a3b8" },
    ].filter((s) => s.value > 0);
    return {
      labels: sections.map((s) => s.label),
      datasets: [{ data: sections.map((s) => s.value), backgroundColor: sections.map((s) => s.color) }],
    };
  }, [stats, nonInsured]);

  // ── chart: monthly trend ───────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const map = {};
    treatments.forEach((t) => {
      if (!t.registeredOn) return;
      const d = new Date(t.registeredOn);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + 1;
    });
    const keys = Object.keys(map).sort();
    const MO = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    return {
      labels: keys.map((k) => {
        const [y, m] = k.split("-");
        return `${MO[parseInt(m) - 1]} ${y}`;
      }),
      datasets: [{
        label: "Traitements",
        data: keys.map((k) => map[k]),
        backgroundColor: "#3b82f6",
        borderRadius: 4,
      }],
    };
  }, [treatments]);

  const hasData = treatments.length > 0;
  const hasInsurance = insuranceAmountEntries.length > 0 || insuranceCountEntries.length > 0 || nonInsured.count > 0;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-800">
      <SideBar2 />
      <div className="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>
      <div className={`flex-grow ml-0 mt-14 mb-10 p-6 ${sidebarMargin}`}>

        {/* Page header */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MdBarChart className="text-primary-600" size={28} />
            Statistiques Médicales
          </h1>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-700 dark:hover:text-primary-400 hover:border-primary-300 transition-all duration-150"
          >
            <IoArrowBack size={16} />
            Retour
          </Link>
        </div>

        {/* Filter form */}
        <form
          onSubmit={handleLoad}
          className="bg-white dark:bg-gray-900 rounded-xl shadow p-5 mb-6 flex flex-wrap gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Du</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Au</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-400 focus:outline-none"
            />
          </div>
          {!isDoctor && doctors.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Médecin</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary-400 focus:outline-none"
              >
                <option value="">Tous les médecins</option>
                {doctors.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold py-2 px-5 rounded-lg cursor-pointer transition-all"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <MdBarChart size={18} />
            )}
            Analyser
          </button>
        </form>

        {/* Empty state */}
        {!hasData && !isLoading && (
          <div className="text-center py-24 text-gray-400">
            <MdBarChart size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Aucune donnée à afficher</p>
            <p className="text-sm mt-1">Sélectionnez une période et cliquez sur <strong>Analyser</strong></p>
          </div>
        )}

        {hasData && (
          <>
            {/* Summary cards — row 1: volume */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <StatCard label="Traitements" value={stats.count} color="text-primary-600" icon={MdShowChart} />
              <StatCard label="Patients uniques" value={stats.patients} color="text-primary-600" icon={MdPeopleAlt} />
              <StatCard label="Montant total" value={fmt(stats.totalAmount) + " F"} color="text-green-600" icon={FaUserDoctor} />
              <StatCard
                label="Taux de paiement"
                value={stats.paidPct + " %"}
                color={stats.paidPct >= 70 ? "text-green-600" : "text-amber-600"}
                icon={MdBarChart}
              />
            </div>

            {/* Summary cards — row 2: financial breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                label="Part Assurances (total)"
                value={fmt(stats.totalInsurancePart) + " F"}
                color="text-blue-600"
                icon={MdHealthAndSafety}
              />
              <StatCard
                label="Part Patient (assurés)"
                value={fmt(stats.insuredPatientPart) + " F"}
                color="text-emerald-600"
                icon={MdPersonOutline}
              />
              <StatCard
                label="Part Patient (non assurés)"
                value={fmt(nonInsured.amount) + " F"}
                color="text-slate-500"
                icon={FaUserDoctor}
              />
            </div>

            {/* Row 1 — age groups + gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ChartCard>
                <Bar
                  data={ageGroupData}
                  options={verticalBarOptions("Répartition par groupe d'âge (patients uniques)")}
                />
              </ChartCard>
              <ChartCard>
                <Doughnut
                  data={genderData}
                  options={doughnutOptions("Répartition par genre (patients uniques)")}
                />
              </ChartCard>
            </div>

            {/* Row 2 — payment + treatment status + insured vs not */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <ChartCard>
                <Doughnut
                  data={paymentStatusData}
                  options={doughnutOptions("Statut des paiements")}
                />
              </ChartCard>
              <ChartCard>
                <Doughnut
                  data={treatmentStatusData}
                  options={doughnutOptions("Statut des traitements")}
                />
              </ChartCard>
              <ChartCard>
                <Doughnut
                  data={insuredVsNotData}
                  options={doughnutOptions("Assurés vs Non Assurés")}
                />
              </ChartCard>
            </div>

            {/* Row 2b — financial breakdown doughnut */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ChartCard>
                <Doughnut
                  data={financialBreakdownData}
                  options={{
                    ...doughnutOptions("Répartition financière : Assurances vs Patients"),
                    plugins: {
                      ...doughnutOptions("Répartition financière : Assurances vs Patients").plugins,
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` ${fmt(ctx.parsed)} F CFA`,
                        },
                      },
                    },
                  }}
                />
              </ChartCard>
              <ChartCard className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">
                  Détail de la répartition financière
                </p>
                <div className="space-y-3">
                  {(() => {
                    const totalParts = stats.totalInsurancePart + stats.insuredPatientPart + nonInsured.amount;
                    return [
                      { label: "Part Assurances", value: stats.totalInsurancePart, color: "bg-blue-500", pct: totalParts > 0 ? Math.round((stats.totalInsurancePart / totalParts) * 100) : 0 },
                      { label: "Part Patient (Assurés)", value: stats.insuredPatientPart, color: "bg-emerald-500", pct: totalParts > 0 ? Math.round((stats.insuredPatientPart / totalParts) * 100) : 0 },
                      { label: "Part Patient (Non Assurés)", value: nonInsured.amount, color: "bg-slate-400", pct: totalParts > 0 ? Math.round((nonInsured.amount / totalParts) * 100) : 0 },
                    ];
                  })().map(({ label, value, color, pct }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <span className={`inline-block w-3 h-3 rounded-full ${color}`} />
                          {label}
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {fmt(value)} F <span className="text-gray-400 font-normal">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>

            {/* Row 3 — insurance amount (full width, scrollable H-bar) */}
            {hasInsurance && (
              <>
                <ChartCard className="mb-6">
                  <ScrollableHBar
                    data={insuranceAmountData}
                    title="Montant pris en charge par assurance (F CFA) — classé par montant décroissant"
                    isCurrency
                  />
                </ChartCard>

                {/* Row 4 — insurance count (full width, scrollable H-bar) */}
                <ChartCard className="mb-6">
                  <ScrollableHBar
                    data={insuranceCountData}
                    title="Nombre de traitements par assurance — classé par nombre décroissant"
                  />
                </ChartCard>

                {/* Insurance ranked table — all data, precise numbers */}
                <ChartCard className="mb-6">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    Tableau récapitulatif — toutes les assurances ({insuranceAmountEntries.length})
                  </p>
                  <InsuranceTable
                    amountEntries={insuranceAmountEntries}
                    countEntries={insuranceCountEntries}
                    nonInsured={nonInsured}
                  />
                </ChartCard>
              </>
            )}

            {/* Row 5 — monthly trend (full width) */}
            <ChartCard>
              <Bar
                data={monthlyData}
                options={verticalBarOptions("Évolution mensuelle du nombre de traitements")}
              />
            </ChartCard>
          </>
        )}
      </div>
    </div>
  );
}
