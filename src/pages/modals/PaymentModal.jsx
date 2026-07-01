import React, { useEffect, useState } from "react";
import {
  allTreatments,
  addPayment,
  updateTreatmentPaymentStatus,
} from "../../services/cdiService";
import * as authService from "../../services/authService";
import DataTable from "react-data-table-component";
import { MdSick } from "react-icons/md";
import { IoClose, IoReturnUpBackSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import { RadioGroup } from "@headlessui/react";
import Spinner from "../../components/Spinner";

export default function PaymentModal({ onClose, onPaymentSuccess }) {
  const [currentUser] = useState(authService.getCurrentUser());
  const [step, setStep] = useState(1);
  const [unpaidTreatments, setUnpaidTreatments] = useState([]);
  const [filterrecords, setFilterRecords] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [amountpaid, setAmountpaid] = useState("");
  const [paymentmethod, setPaymentmethod] = useState("Espèces");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    allTreatments().then((res) => {
      let unpaid = res.data.filter((x) => x.statuspayment === "Impayé");
      setUnpaidTreatments(unpaid);
      setFilterRecords(unpaid);
    });
  }, []);

  const handleSelectTreatment = (treatment) => {
    setSelectedTreatment(treatment);
    setStep(2);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^[0-9]*$/.test(value)) {
      setAmountpaid(value);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedTreatment || !amountpaid) {
      toast.error("Veuillez entrer le montant payé.");
      return;
    }

    setIsLoading(true);

    const data = {
      treatment: selectedTreatment.id,
      paidvia: `${currentUser.body.firstname} ${currentUser.body.lastname}`,
      patientname: selectedTreatment.patientname,
      patientno: selectedTreatment.patientno,
      treatmentamount: selectedTreatment.treatmentamount,
      partinsurance: selectedTreatment.partinsurance,
      partinsurance2: selectedTreatment.partinsurance2,
      tarifAssurance: selectedTreatment.tarifAssurance,
      tarifAssurance2: selectedTreatment.tarifAssurance2,
      partpatient: selectedTreatment.partpatient,
      insurance: selectedTreatment.insurance,
      insurance2: selectedTreatment.insurance2,
      paymentmethod,
      amountpaid,
    };

    try {
      // First, add the payment record
      await addPayment(data);

      // ***** THE FIX IS HERE *****
      // Then, update the treatment status using the correct ID
      await updateTreatmentPaymentStatus(selectedTreatment.id);

      toast.success("Le payement a été effectué");
      onPaymentSuccess(); // Close modal and refresh parent list
    } catch (error) {
      // Log the detailed error for debugging
      console.error(
        "Payment failed:",
        error.response || error.message || error
      );
      toast.error("Une erreur s'est produite lors du paiement!");
    } finally {
      setIsLoading(false);
    }
  };

  const search = (event) => {
    const newData = filterrecords.filter(
      (row) =>
        row.patientno.toString().includes(event.target.value.toLowerCase()) ||
        row.patientname.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setUnpaidTreatments(newData);
  };

  const treatmentColumns = [
    {
      name: "Patient No",
      selector: (row) => row.patientno,
      sortable: true,
      width: "150px",
    },
    {
      name: "Nom du patient",
      selector: (row) => row.patientname,
      sortable: true,
      grow: 2,
    },
    {
      name: "Assurance 1",
      selector: (row) => row.insurance || "Aucune",
      sortable: true,
    },
    {
      name: "Assurance 2",
      selector: (row) => row.insurance2 || "Aucune",
      sortable: true,
    },
    {
      name: "Part Patient",
      selector: (row) => row.partpatient,
      sortable: true,
      right: true,
    },
    {
      name: "Assigner",
      cell: (row) => (
        <MdSick
          size={22}
          className="cursor-pointer text-primary-600 hover:text-primary-800"
          onClick={() => handleSelectTreatment(row)}
        />
      ),
      center: true,
    },
  ];

  const tableHeaderstyle = {
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        backgroundColor: "black",
        color: "white",
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        {step === 1 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold dark:text-white">
                Sélectionner un traitement à payer
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 dark:hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <IoClose size={24} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom ou numéro de patient..."
              className="w-full h-[35px] rounded-md border border-gray-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 py-1 px-4 mb-4 text-black dark:text-gray-100"
              onChange={search}
            />
            <DataTable
              columns={treatmentColumns}
              data={unpaidTreatments}
              pagination
              fixedHeader
              fixedHeaderScrollHeight="300px"
              highlightOnHover
              customStyles={tableHeaderstyle}
            />
          </>
        )}

        {step === 2 && selectedTreatment && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setStep(1)}
                className="p-2 rounded-full hover:bg-gray-200"
              >
                <IoReturnUpBackSharp size={20} />
              </button>
              <h2 className="text-xl font-bold dark:text-white">Effectuer le Paiement</h2>
              <button
                onClick={onClose}
                className="text-2xl font-bold text-black"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="p-6 border dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700">
                <p className="text-lg font-medium dark:text-white">Détails du traitement</p>
                <table className="w-full text-sm font-light text-left">
                  <tbody>
                    <tr className="border-b">
                      <th className="py-2">N° du traitement</th>
                      <td className="px-6 py-2 font-medium">
                        {selectedTreatment.id}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <th className="py-2">Part patient</th>
                      <td className="px-6 py-2 text-2xl font-medium text-white bg-black">
                        {selectedTreatment.partpatient}
                      </td>
                    </tr>
                    {/* Add other details as needed */}
                  </tbody>
                </table>
              </div>

              <div>
                <form onSubmit={handleSubmitPayment} className="space-y-6">
                  <div>
                    <RadioGroup
                      value={paymentmethod}
                      onChange={setPaymentmethod}
                    >
                      <RadioGroup.Label className="text-sm font-medium text-black">
                        <strong className="text-center">
                          Méthode de paiement
                        </strong>
                      </RadioGroup.Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        {[
                          "Carte de crédit",
                          "Espèces",
                          // "Mobile Money",
                          "Orange Money",
                          "MTN Money",
                          "Moov Money",
                          "Wave",
                        ].map((method) => (
                          <RadioGroup.Option
                            key={method}
                            value={method}
                            className={({ checked }) =>
                              `${
                                checked
                                  ? "bg-green-600 text-white"
                                  : "bg-primary-500 text-white"
                              }
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
                            }
                          >
                            {({ checked }) => (
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                  <div className="text-sm">
                                    <RadioGroup.Label
                                      as="p"
                                      className={`font-medium  ${
                                        checked ? "text-white" : "text-white"
                                      }`}
                                    >
                                      {method}
                                    </RadioGroup.Label>
                                  </div>
                                </div>
                                {checked && (
                                  <div className="text-white shrink-0">
                                    <svg
                                      className="w-6 h-6"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <circle
                                        cx={12}
                                        cy={12}
                                        r={12}
                                        fill="#fff"
                                        fillOpacity="0.2"
                                      />
                                      <path
                                        d="M7 13l3 3 7-7"
                                        stroke="#fff"
                                        strokeWidth={1.5}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Montant payé par le patient
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={amountpaid}
                      onChange={handleAmountChange}
                      className="block w-full h-10 px-4 mt-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-600 dark:text-gray-100 rounded"
                      placeholder="Montant du patient"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!amountpaid || isLoading}
                    className="flex items-center justify-center w-full py-2 font-bold text-white bg-primary-600 rounded hover:bg-primary-700 disabled:bg-gray-400"
                  >
                    {isLoading && <Spinner />}
                    {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
