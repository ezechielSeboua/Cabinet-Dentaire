import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import ExpenseTypeList from "./ExpenseTypeList";
import ExpensesList from "./ExpensesList";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

export default function ExpensesHome() {
  const sidebarMargin = useSidebarMargin();
  return (
    <div class="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white">
      <SideBar2 />
      <div class="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>
      {/* The main content area now has `overflow-hidden` to be safe */}
      <div className={`h-full ml-14 mt-16 ${sidebarMargin} p-4 overflow-hidden`}>
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* THE FIX: Added `flex flex-col` here. This card now controls its children's height. */}
          <div className="w-full lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 border-gray-300 dark:border-gray-600 flex-shrink-0">
              Les types de dépenses
            </h2>
            {/* ExpenseTypeList will now correctly fill the remaining space */}
            <ExpenseTypeList />
          </div>

          {/* THE FIX: Also added `flex flex-col` here for consistency. */}
          <div className="w-full lg:w-1/2 bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 border border-gray-200 dark:border-gray-700 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 border-gray-300 dark:border-gray-600 flex-shrink-0">
              Toutes les dépenses
            </h2>
            {/* Ensure ExpensesList is also structured to handle this */}
            <ExpensesList />
          </div>
        </div>
      </div>
    </div>
  );
}
