import { useEffect, useState } from "react";
import { insurancePublic } from "../../services/cdiService";

export default function InsuranceTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    insurancePublic()
      .then((res) => {
        const names = (res.data || [])
          .filter((x) => x.insurance && x.insurance !== "NA")
          .sort((a, b) => a.insurance.localeCompare(b.insurance))
          .map((x) => x.insurance);
        setItems(names);
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  // Duplicate so the loop is perfectly seamless (scroll to -50% then reset)
  const doubled = [...items, ...items];
  // ~2 s per item; min 6 s
  const duration = Math.max(items.length * 2, 6);

  return (
    <section className="w-full bg-primary-700 dark:bg-primary-900 py-3 overflow-hidden">
      <style>{`
        @keyframes ins-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ins-ticker-track {
          animation: ins-ticker ${duration}s linear infinite;
        }
        .ins-ticker-track:hover { animation-play-state: paused; }
      `}</style>

      <div className="flex items-center">
        {/* Fixed left label */}
        <div className="flex-shrink-0 px-5 border-r border-white/30 mr-4 hidden sm:block">
          <p className="text-xs font-bold uppercase tracking-widest text-white whitespace-nowrap">
            Assurances
            <br />
            acceptées
          </p>
        </div>

        {/* Scrolling track with fade edges */}
        <div className="relative flex-1 overflow-hidden">
          <div className="ins-ticker-track flex items-center whitespace-nowrap">
            {doubled.map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-6 text-sm font-medium text-white flex-shrink-0"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary-300 flex-shrink-0" />
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
