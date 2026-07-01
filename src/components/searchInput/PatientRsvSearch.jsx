import React, { useState } from "react";
import { API_URL } from "../../utils/config";

function PatientRsvSearch({ displayMyAppointmentsResult }) {
  const [query, setQuery] = useState("");

  const fetchData = () => {
    fetch(API_URL + `/appointment/${query}`)
      .then((response) => {
        return response.json();
      })
      .then((myAppointmentsData) => {
        displayMyAppointmentsResult(myAppointmentsData);
      });
  };
  return (
    <>
      <div className="flex -ml-6">
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
          Voir mes rendez-vous
        </button>
      </div>
    </>
  );
}

export default PatientRsvSearch;
