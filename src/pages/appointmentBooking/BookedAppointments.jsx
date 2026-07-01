import React from "react";
import BookedAppointmentsList from "./BookedAppointmentsList";

export default function BookedAppointments() {
  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white">
          <BookedAppointmentsList />
      </div>
  );
}
