import { useState } from "react";
import "../TodayCalendar.css";

const MONTH_NAMES = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
const DAY_LABELS = ["L","M","M","J","V","S","D"];

function TodayCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Mon-first

  const cells = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d !== null &&
    d === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-primary-700 text-lg font-semibold mb-4 text-center border-b border-gray-200 pb-2">
        Votre Calendrier du Jour
      </h2>

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 text-lg leading-none"
        >
          &#8249;
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 text-lg leading-none"
        >
          &#8250;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="text-center text-xs font-semibold text-gray-400 py-1">
            {label}
          </div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={`text-center text-sm py-1.5 rounded-full mx-0.5 ${
              isToday(d)
                ? "bg-primary-600 text-white font-bold"
                : d
                ? "text-gray-700 hover:bg-gray-100"
                : ""
            }`}
          >
            {d ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodayCalendar;
