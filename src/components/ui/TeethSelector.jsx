import { useMemo, useState } from "react";

// ── Adult — FDI permanent teeth (viewer left → right) ──────────────────────
const UPPER_ADULT = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ADULT = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// ── Child — FDI deciduous teeth (viewer left → right) ──────────────────────
const UPPER_CHILD = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
const LOWER_CHILD = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

const MAX_ARCH = 22; // px

function archOffset(i, total) {
  const center = (total - 1) / 2;
  return MAX_ARCH * Math.pow((i - center) / center, 2);
}

// FDI second digit = tooth type
function toothWidth(tooth) {
  const type = tooth % 10;
  if (type === 8) return 27;
  if (type === 7) return 25;
  if (type === 6) return 24;
  if (type === 5) return 26; // child 2nd molar / adult 1st premolar
  if (type === 4) return 22;
  if (type === 3) return 19;
  if (type === 2) return 16;
  return 20; // central incisor
}

// Detect mode from existing tooth numbers (5x/6x/7x/8x → child)
function detectMode(teeth) {
  if (!teeth || teeth.length === 0) return "adult";
  const n = Number(teeth[0]);
  return n >= 51 && n <= 85 ? "child" : "adult";
}

export default function TeethSelector({ selectedTeeth = [], onChange, disabled = false }) {
  const initialMode = detectMode(selectedTeeth);
  const [mode, setMode] = useState(initialMode);
  // Keep a snapshot per mode so switching back restores the prior selection
  const [savedAdult, setSavedAdult] = useState(() =>
    initialMode === "adult" ? [...selectedTeeth] : []
  );
  const [savedChild, setSavedChild] = useState(() =>
    initialMode === "child" ? [...selectedTeeth] : []
  );

  const UPPER = mode === "adult" ? UPPER_ADULT : UPPER_CHILD;
  const LOWER = mode === "adult" ? LOWER_ADULT : LOWER_CHILD;

  const selected = useMemo(() => new Set(selectedTeeth.map(String)), [selectedTeeth]);

  const toggle = (tooth) => {
    if (disabled) return;
    const t = String(tooth);
    if (selected.has(t)) {
      onChange(selectedTeeth.filter((x) => String(x) !== t));
    } else {
      onChange([...selectedTeeth, t]);
    }
  };

  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return;
    // Save current selection before leaving this mode
    if (mode === "adult") setSavedAdult([...selectedTeeth]);
    else setSavedChild([...selectedTeeth]);
    setMode(newMode);
    // Restore whatever was selected last time this mode was active
    onChange(newMode === "adult" ? savedAdult : savedChild);
  };

  const handleClearAll = () => {
    if (mode === "adult") setSavedAdult([]);
    else setSavedChild([]);
    onChange([]);
  };

  const sortedSelected = useMemo(
    () => [...selectedTeeth].map(String).sort((a, b) => Number(a) - Number(b)),
    [selectedTeeth]
  );

  const ToothBtn = ({ tooth, index, jaw }) => {
    const t = String(tooth);
    const active = selected.has(t);
    const total = UPPER.length;
    const offset = archOffset(index, total);
    const translateY = jaw === "upper" ? -offset : offset;
    const w = toothWidth(tooth);

    return (
      <button
        type="button"
        title={`Dent ${tooth}`}
        onClick={() => toggle(tooth)}
        disabled={disabled}
        style={{ transform: `translateY(${translateY}px)`, width: `${w}px` }}
        className={[
          "h-8 flex-shrink-0 text-[10px] font-bold border-2 transition-all duration-100",
          jaw === "upper" ? "rounded-t-sm rounded-b-md" : "rounded-b-sm rounded-t-md",
          active
            ? "bg-primary-500 border-primary-600 text-white shadow-md"
            : "bg-white dark:bg-slate-600 border-gray-300 dark:border-slate-500 text-gray-500 dark:text-gray-200 hover:bg-primary-50 hover:border-primary-400 hover:text-primary-700",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        {tooth}
      </button>
    );
  };

  const upperLabels =
    mode === "adult"
      ? { left: "Sup. Droite (11–18)", right: "Sup. Gauche (21–28)" }
      : { left: "Sup. Droite (51–55)", right: "Sup. Gauche (61–65)" };

  const lowerLabels =
    mode === "adult"
      ? { left: "Inf. Droite (41–48)", right: "Inf. Gauche (31–38)" }
      : { left: "Inf. Droite (81–85)", right: "Inf. Gauche (71–75)" };

  return (
    <div>
      {/* Header + mode toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-gray-800 dark:text-white">
            Dents traitées
          </span>
          {sortedSelected.length > 0 && (
            <span className="text-xs font-bold bg-primary-600 text-white rounded-full px-2 py-0.5">
              {sortedSelected.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Adulte / Enfant toggle */}
          <div className="flex rounded-lg border border-gray-300 dark:border-slate-600 overflow-hidden text-xs font-medium">
            <button
              type="button"
              onClick={() => handleModeSwitch("adult")}
              className={`px-3 py-1 transition-colors ${
                mode === "adult"
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
              }`}
            >
              Adulte
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("child")}
              className={`px-3 py-1 border-l border-gray-300 dark:border-slate-600 transition-colors ${
                mode === "child"
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600"
              }`}
            >
              Enfant
            </button>
          </div>

          {sortedSelected.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-rose-500 hover:text-rose-700 underline"
            >
              Tout effacer
            </button>
          )}
        </div>
      </div>

      {/* Dental chart */}
      <div className="border dark:border-slate-600 rounded-lg p-4 bg-gray-50 dark:bg-slate-800 overflow-x-auto">
        <div className="w-fit mx-auto select-none">

          {/* Upper quadrant labels */}
          <div className="flex justify-center text-[10px] font-medium mb-1 min-w-max">
            <span className="text-primary-700 dark:text-primary-400 pr-2">{upperLabels.left}</span>
            <span className="text-gray-300 dark:text-slate-600">|</span>
            <span className="text-emerald-700 dark:text-emerald-400 pl-2">{upperLabels.right}</span>
          </div>

          {/* Upper arch */}
          <div
            className="flex items-end justify-center gap-[2px]"
            style={{ paddingTop: `${MAX_ARCH + 4}px` }}
          >
            {UPPER.map((tooth, i) => (
              <ToothBtn key={tooth} tooth={tooth} index={i} jaw="upper" />
            ))}
          </div>

          {/* Midline separator */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 border-t border-dashed border-gray-300 dark:border-slate-600" />
            <span className="text-[10px] text-gray-400 dark:text-slate-500 whitespace-nowrap px-1">
              ↑ Sup. &nbsp;|&nbsp; Inf. ↓
            </span>
            <div className="flex-1 border-t border-dashed border-gray-300 dark:border-slate-600" />
          </div>

          {/* Lower arch */}
          <div
            className="flex items-start justify-center gap-[2px]"
            style={{ paddingBottom: `${MAX_ARCH + 4}px` }}
          >
            {LOWER.map((tooth, i) => (
              <ToothBtn key={tooth} tooth={tooth} index={i} jaw="lower" />
            ))}
          </div>

          {/* Lower quadrant labels */}
          <div className="flex justify-center text-[10px] font-medium mt-1 min-w-max">
            <span className="text-primary-700 dark:text-primary-400 pr-2">{lowerLabels.left}</span>
            <span className="text-gray-300 dark:text-slate-600">|</span>
            <span className="text-emerald-700 dark:text-emerald-400 pl-2">{lowerLabels.right}</span>
          </div>

          <p className="text-center text-[10px] text-gray-400 dark:text-slate-500 mt-2">
            Notation FDI · cliquer pour sélectionner
          </p>
        </div>
      </div>

      {/* Selected tooth badges */}
      {sortedSelected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {sortedSelected.map((t) => (
            <span
              key={t}
              className="text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300 px-2 py-0.5 rounded-full border border-primary-200 dark:border-primary-700"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
