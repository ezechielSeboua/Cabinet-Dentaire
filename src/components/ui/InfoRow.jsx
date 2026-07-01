// src/components/ui/InfoRow.js
import React from "react";

export default function InfoRow({ icon, label, value }) {
  if (!value) return null; // Don't render anything if the value is empty

  return (
    <div className="flex items-start py-3">
      <div className="flex-shrink-0 w-6 text-gray-500 dark:text-gray-400">
        {icon}
      </div>
      <div className="ml-4 flex-grow">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="mt-1 text-base text-gray-800 dark:text-gray-200 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
