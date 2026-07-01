// src/pages/dashboard/StatCard.js

// Maps color names to Tailwind CSS classes for easy customization
const colorVariants = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/50",
    text: "text-blue-600 dark:text-blue-300",
    border: "border-blue-500",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/50",
    text: "text-green-600 dark:text-green-300",
    border: "border-green-500",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/50",
    text: "text-orange-600 dark:text-orange-300",
    border: "border-orange-500",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/50",
    text: "text-purple-600 dark:text-purple-300",
    border: "border-purple-500",
  },
  teal: {
    bg: "bg-teal-100 dark:bg-teal-900/50",
    text: "text-teal-600 dark:text-teal-300",
    border: "border-teal-500",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-900/50",
    text: "text-red-600 dark:text-red-300",
    border: "border-red-500",
  },
};

export default function StatCard({ title, value, icon, color = "blue" }) {
  const colors = colorVariants[color] || colorVariants.blue;

  return (
    <div
      className={`bg-white dark:bg-slate-800 shadow-lg rounded-xl flex items-center p-3 sm:p-4 border-l-4 ${colors.border}`}
    >
      <div
        className={`flex-shrink-0 flex justify-center items-center w-10 h-10 sm:w-14 sm:h-14 rounded-full ${colors.bg} ${colors.text}`}
      >
        {icon}
      </div>
      <div className="ml-3 sm:ml-4 text-left min-w-0 flex-1">
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white leading-tight break-words">
          {value}
        </p>
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-snug">
          {title}
        </p>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl flex items-center p-3 sm:p-4 border-l-4 border-gray-200 dark:border-slate-700 animate-pulse">
      <div className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gray-200 dark:bg-slate-700" />
      <div className="ml-3 sm:ml-4 flex-1 space-y-2">
        <div className="h-5 sm:h-6 w-1/2 bg-gray-200 dark:bg-slate-700 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}
