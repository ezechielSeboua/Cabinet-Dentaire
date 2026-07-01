export const StatCard = ({ title, value, highlight = false }) => (
  <div
    className={`p-4 rounded-lg ${
      highlight
        ? "bg-primary-100 dark:bg-primary-900/50"
        : "bg-gray-100 dark:bg-gray-800"
    }`}
  >
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
      {title}
    </p>
    <p
      className={`text-2xl font-bold ${
        highlight
          ? "text-primary-600 dark:text-primary-300"
          : "text-gray-900 dark:text-white"
      }`}
    >
      {value.toLocaleString("fr-FR")} CFA
    </p>
  </div>
);
