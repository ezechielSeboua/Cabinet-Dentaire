import React from "react";
import TodayBillDashboard from "./TodayBill";
import SideBar2 from "../../components/SideBar2";
import Header from "../../components/Header";

function FactureDuJour() {
  return (
    <div class="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white">
      <SideBar2 />
      <div class="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>
          <TodayBillDashboard />
    </div>
  );
}

export default FactureDuJour;
