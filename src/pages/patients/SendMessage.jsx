import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useNavigate } from "react-router-dom";
import * as authService from "../../services/authService";
import {
  getAPatientBasedOnEmail,
  sendMessage,
} from "../../services/cdiService";
import { Bounce, toast } from "react-toastify";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";

export default function SendMessage() {
  const sidebarMargin = useSidebarMargin();
  const [currentUser] = useState(authService.getCurrentUser());
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loadedPatient, setLoadedPatient] = useState("");

  let patientemail = currentUser.body.email;

  const getPatient = () => {
    try {
      getAPatientBasedOnEmail(patientemail).then((res) => {
        setLoadedPatient(res.data);
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPatient();
  }, []);

  const data = {
    patientname: loadedPatient.lastname + " " + loadedPatient.firstname,
    patienttelephone: loadedPatient.telephone,
    patientno: loadedPatient.patientno,
    subject,
    message,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await sendMessage(data);
      toast.success("Votre message a été envoyé avec succès!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      navigate("/dashboardwelcome");
    } catch (error) {
      console.log(error);
      toast.error(
        "Votre message n'a pas été envoyé! Le texte est trop long. Max (255 lettres)",
        {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        }
      );
    }
  };

  const isButtonDisabled = subject.trim() === "" || message.trim() === "";

  return (
    <div className="min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-white dark:bg-gray-700 text-black dark:text-white">
      <SideBar2 />
      <div className="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>
      <div className={`h-full ml-0 mt-14 mb-10 ${sidebarMargin}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Envoyer un message
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Veuillez remplir tous les champs.
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="subject"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Sujet
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Sujet de votre message..."
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    onChange={(e) => setMessage(e.target.value)}
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Votre message ici..."
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isButtonDisabled}
                    className={`text-white font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center flex items-center ${
                      isButtonDisabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-primary-700 cursor-pointer hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-white me-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 16"
                    >
                      <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                      <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
                    </svg>
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
