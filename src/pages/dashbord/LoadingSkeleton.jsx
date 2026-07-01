export default function LoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 h-full animate-pulse">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
        <div className="ml-4 h-6 w-1/2 bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
        <div className="h-5 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
        <div className="h-5 w-2/3 bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
  );
}
