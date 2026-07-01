// src/components/ui/EmptyState.js
import React from "react";
import { Link } from "react-router-dom";
import { BsFillHospitalFill } from "react-icons/bs";

export default function EmptyState({ title, message, buttonText, buttonLink }) {
  return (
    <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/50">
        <BsFillHospitalFill className="h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        <p>{message}</p>
      </div>
      <div className="mt-6">
        <Link
          to={buttonLink}
          className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
