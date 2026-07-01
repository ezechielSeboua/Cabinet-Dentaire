import React, { useState } from "react";
import { API_URL } from "../../utils/config";

export default function PatientTreatmentSearch({ displayMyTreatmentsResult }) {
  const [query, setQuery] = useState("");

  const fetchData = () => {
    fetch(API_URL + `/treatment/patient/${query}`)
      .then((response) => {
        return response.json();
      })
      .then((myAppointmentsData) => {
        displayMyTreatmentsResult(myAppointmentsData);
      });
  };
  return (
    <>
      <div className="flex -ml-6 mb-4">
        <input
          type="text"
          placeholder="Veuillez sersir votre numero de patient"
          className="w-full md:w-80 px-3 h-10 rounded-l border-2 border-gray-500 focus:outline-none focus:border-gray-500"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          className="bg-black text-white rounded-r px-2 md:px-3 py-0 md:py-1"
          onClick={fetchData}
        >
          Voir mes traitements
        </button>
      </div>
    </>
  );
}
