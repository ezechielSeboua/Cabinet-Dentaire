// src/components/settings/InfoRow.js
import React from "react";

export default function InfoRow({ label, value, isLink = false }) {
  if (!value) return null; // Don't render if there's no value

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 text-sm">
      <dt className="font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="md:col-span-2 text-gray-800 dark:text-gray-200 break-words">
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 hover:underline"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
