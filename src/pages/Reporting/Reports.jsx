import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import ReportWelcome from "./ReportWelcome";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

export default function Reports() {
  const sidebarMargin = useSidebarMargin();
  return (
    <div class="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white">
      <SideBar2 />
      <div class="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>
      <div className={`h-full ml-0 mt-14 mb-10 ${sidebarMargin}`}>
        <div class="grid grid-cols-1 lg:grid-cols-1 p-4 gap-2">
          <ReportWelcome />
        </div>
      </div>
    </div>
  );
}
