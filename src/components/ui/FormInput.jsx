// src/components/ui/FormInput.js
import React from "react";

export default function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  isTextarea = false,
  required = false,
}) {
  const commonProps = {
    name,
    value,
    onChange,
    placeholder,
    required,
    className:
      "w-full px-3 py-2 text-gray-800 bg-white dark:bg-slate-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500",
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        {label}
      </label>
      {isTextarea ? (
        <textarea {...commonProps} rows="4"></textarea>
      ) : (
        <input {...commonProps} type={type} />
      )}
    </div>
  );
}
