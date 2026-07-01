import React, { useState } from "react";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import Appointment from "./Appointment";
import BookedAppointments from "../appointmentBooking/BookedAppointments";
import { getCurrentUser } from "../../services/authService";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

export default function CommonAppointment() {
  const sidebarMargin = useSidebarMargin();
  const currentUser = getCurrentUser();
  const userRole = currentUser?.body?.roles[0]?.toString();

  const allTabs = [
    { id: "appointments", label: "Rendez-vous Internes" },
    { id: "booked-appointments", label: "Rendez-vous Réservés en ligne" },
  ];

  // --- START OF MODIFICATION ---

  // Create visibleTabs by filtering and mapping based on user role
  const visibleTabs =
    userRole === "PATIENT"
      ? // If user is a PATIENT:
        allTabs
          // 1. First, keep only the 'appointments' tab
          .filter((tab) => tab.id === "appointments")
          // 2. Then, transform it to change the label
          .map((tab) => ({ ...tab, label: "Mes rendez-vous" }))
      : // If user is any other role, use the original tabs
        allTabs;

  // --- END OF MODIFICATION ---

  const [activeTab, setActiveTab] = useState(visibleTabs[0].id);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white">
        <SideBar2 />
        <div className="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
          <Header />
        </div>
        <main className={`ml-0 ${sidebarMargin} mt-14 p-4 md:p-8 transition-all duration-300`}>

          <div className="w-full max-w-2xl">
            <div className="flex space-x-2 rounded-xl bg-gray-200 dark:bg-gray-700 p-1">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`
                  w-full rounded-lg py-2.5 text-base font-semibold leading-5
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 ring-offset-2 ring-offset-primary-400 dark:ring-offset-gray-800 ring-white ring-opacity-60
                  ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-800 cursor-pointer text-primary-700 dark:text-primary-400 shadow"
                      : "text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50"
                  }
                `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "appointments" && <Appointment />}
          {activeTab === "booked-appointments" && <BookedAppointments />}
        </main>
      </div>
    </>
  );
}
