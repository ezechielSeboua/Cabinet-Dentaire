// src/pages/dashboard/SummaryCard.js
import React from "react";

// A generic check icon for list items
const ListItemIcon = () => (
  <div className="flex-shrink-0 w-5 h-5 mr-3 flex items-center justify-center bg-primary-100 dark:bg-primary-900 rounded-full">
    <svg
      className="w-3 h-3 text-primary-600 dark:text-primary-300"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  </div>
);

export default function SummaryCard({ title, icon, metrics = [] }) {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-4 sm:p-6 h-full flex flex-col">
      {/* Card Header */}
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 rounded-lg">
          {icon}
        </div>
        <h3 className="ml-3 sm:ml-4 text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
          {title}
        </h3>
      </div>

      {/* Card Body - Metrics List */}
      <div className="flex-grow space-y-3">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-xs sm:text-sm"
          >
            <div className="flex items-center min-w-0">
              <ListItemIcon />
              <span className="text-gray-600 dark:text-gray-400 break-words">
                {metric.label}
              </span>
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-200 ml-2 flex-shrink-0">
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
