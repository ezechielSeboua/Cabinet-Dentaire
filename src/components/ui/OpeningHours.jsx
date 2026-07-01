import React, { useEffect, useState } from "react";
import { getPublicOpeningHours } from "../../services/cdiService";

const DAY_ORDER = [
  "LUNDI",
  "MARDI",
  "MERCREDI",
  "JEUDI",
  "VENDREDI",
  "SAMEDI",
  "DIMANCHE",
];
const DAY_FR = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};
// JS getDay(): 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
const JS_TO_ENUM = [
  "DIMANCHE",
  "LUNDI",
  "MARDI",
  "MERCREDI",
  "JEUDI",
  "VENDREDI",
  "SAMEDI",
];

function getNow() {
  const d = new Date();
  return {
    todayEnum: JS_TO_ENUM[d.getDay()],
    currentTime:
      d.getHours().toString().padStart(2, "0") +
      ":" +
      d.getMinutes().toString().padStart(2, "0"),
  };
}

function getNextOpening(hours, todayEnum, currentTime) {
  const todayIdx = DAY_ORDER.indexOf(todayEnum);
  for (let i = 0; i < 7; i++) {
    const nextDay = DAY_ORDER[(todayIdx + i) % 7];
    const entry = hours.find((h) => (h.day || "").toUpperCase() === nextDay);
    if (!entry || entry.isClosed) continue;
    if (i === 0) {
      if (currentTime >= entry.openTime) continue;
      return { label: "aujourd'hui", time: entry.openTime };
    }
    return {
      label: i === 1 ? "demain" : DAY_FR[nextDay],
      time: entry.openTime,
    };
  }
  return null;
}

export default function OpeningHours() {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(getNow());

  const fetchHours = (showLoading = false) => {
    if (showLoading) setLoading(true);
    getPublicOpeningHours()
      .then((res) => {
        const sorted = [...(res.data || [])]
          .map((h) => ({ ...h, day: h.day?.toUpperCase() }))
          .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
        setHours(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHours(true);
    const id = setInterval(() => {
      setNow(getNow());
      fetchHours(false);
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="mt-12 w-full max-w-md mx-auto">
        <h3 className="text-xl font-semibold tracking-wider mb-4 text-white">
          Heures d'ouverture
        </h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-white/10 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (hours.length === 0) return null;

  const { todayEnum, currentTime } = now;
  const todayEntry = hours.find(
    (h) => (h.day || "").toUpperCase() === todayEnum,
  );
  const isOpenNow =
    todayEntry &&
    !todayEntry.isClosed &&
    currentTime >= todayEntry.openTime &&
    currentTime < todayEntry.closeTime;
  const nextOpening = !isOpenNow
    ? getNextOpening(hours, todayEnum, currentTime)
    : null;

  return (
    <div className="mt-12 w-full max-w-md mx-auto text-left">
      <h3 className="text-xl font-semibold tracking-wider mb-4 text-white">
        Heures d'ouverture
      </h3>

      {/* ── Status banner ── */}
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-3 border ${
          isOpenNow
            ? "bg-green-500/15 border-green-400/30"
            : "bg-red-500/15 border-red-400/25"
        }`}
      >
        <span
          className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${
            isOpenNow ? "bg-green-400 animate-pulse" : "bg-red-400"
          }`}
        />
        <div className="leading-tight">
          {isOpenNow ? (
            <p className="text-sm font-bold text-green-300">
              Ouvert maintenant
              {todayEntry?.closeTime && (
                <span className="font-normal text-white/50 ml-2">
                  · Ferme à {todayEntry.closeTime}
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm font-bold text-red-300">
              Fermé en ce moment
              {nextOpening && (
                <span className="font-normal text-white/50 ml-2">
                  · Ouvre {nextOpening.label} à {nextOpening.time}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* ── Day list ── */}
      <div className="rounded-xl overflow-hidden border border-white/10 divide-y divide-white/5">
        {hours.map(({ day, openTime, closeTime, isClosed }) => {
          const isToday = day === todayEnum;
          return (
            <div
              key={day}
              className={`flex items-center justify-between px-4 py-2.5 ${
                isToday
                  ? "bg-primary-500/20"
                  : "bg-white/5 hover:bg-white/8 transition-colors"
              }`}
            >
              {/* Day + today tag */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium w-24 ${
                    isToday ? "text-primary-200 font-semibold" : "text-white/80"
                  }`}
                >
                  {DAY_FR[day]}
                </span>
                {isToday && (
                  <span className="text-xs bg-primary-400/20 text-primary-300 border border-primary-400/30 px-2 py-0.5 rounded-full leading-none">
                    Aujourd'hui
                  </span>
                )}
              </div>

              {/* Hours or closed */}
              {isClosed ? (
                <span className="text-sm text-white/35 italic">Fermé</span>
              ) : (
                <span className="text-sm tabular-nums">
                  <span className="font-semibold text-primary-300">
                    {openTime}
                  </span>
                  <span className="text-white/30 mx-1.5">–</span>
                  <span className="font-semibold text-rose-300">
                    {closeTime}
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
