import React, { useState, useEffect } from "react";
import SideBar2 from "../../components/SideBar2";
import Header from "../../components/Header";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../CustomCalendar.css";
import logo1 from "../../assets/logo1.jpg";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";
import { clinicPublic } from "../../services/cdiService";
import { normalizeFileUrl } from "../../utils/config";

export default function DashboardWelcome() {
  const sidebarMargin = useSidebarMargin();
  const [date, setDate] = useState(new Date());
  const [ctime, setTime] = useState(new Date().toLocaleTimeString('fr-FR'));
  const [clinicLogo, setClinicLogo] = useState(null);

  useEffect(() => {
    clinicPublic()
      .then((res) => { if (res.data?.logo) setClinicLogo(normalizeFileUrl(res.data.logo)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Update the time every second
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('fr-FR'));
    }, 1000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(timer);
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-white">
      <SideBar2 />
      <div className="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>

      <div className={`h-full ml-0 mt-14 mb-10 ${sidebarMargin} p-4 md:p-8`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Calendar and Logo */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex flex-col xl:flex-row items-center justify-around gap-6">
              
              {/* Calendar */}
              <div className="w-full xl:w-auto">
                <Calendar
                  onChange={setDate}
                  value={date}
                  locale="fr-FR"
                  className="w-full border-none"
                />
              </div>

              {/* Logo */}
              <div className="flex items-center justify-center mt-6 xl:mt-0">
                <img
                  src={clinicLogo || logo1}
                  alt="Logo"
                  className="w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 rounded-md object-cover shadow-md border-4 border-gray-100 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Time and Date Display */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col justify-center items-center text-center">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-600 dark:text-gray-300">Heure et Date Actuelles</h2>
              <p className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white">{ctime}</p>
              <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 mt-2">
                {date.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}