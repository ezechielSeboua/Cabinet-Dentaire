import React from "react";
import AppointmentList from "./AppointmentList";

export default function Appointment() {
  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white">
          <AppointmentList />
    </div>
  );
}
