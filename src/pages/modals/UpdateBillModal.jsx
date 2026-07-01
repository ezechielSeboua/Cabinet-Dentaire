import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { billDetails, updateBill } from "../../services/cdiService";
import Spinner from "../../components/Spinner";

export default function UpdateBillModal({ billId, onClose, onUpdateSuccess }) {
  const [data, setData] = useState(null); // Will hold the full bill object from the API
  const [isLoading, setIsLoading] = useState(false);

  // STATE HAS BEEN CHANGED: This now holds ONLY the new payment amount
  const [amountToAdd, setAmountToAdd] = useState("");

  useEffect(() => {
    // Fetch bill details when the modal opens
    if (billId) {
      billDetails(billId)
        .then((res) => {
          setData(res.data);
        })
        .catch((error) => {
          console.error("Failed to load bill details:", error);
          toast.error("Erreur lors du chargement des détails de la facture.");
          onClose(); // Close modal if data fails to load
        });
    }
  }, [billId, onClose]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*\.?\d*$/.test(value)) {
      setAmountToAdd(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newPaymentAmount = parseFloat(amountToAdd);
    const currentAmountPaid = parseFloat(data.amountpaid);
    const totalDue = parseFloat(data.partpatient);
    const remainder = totalDue - currentAmountPaid;

    // --- 1. VALIDATION LOGIC ---
    // Check if the new payment is valid and does not exceed the remaining balance
    if (isNaN(newPaymentAmount) || newPaymentAmount <= 0) {
      toast.warn("Veuillez entrer un montant de versement valide.");
      setIsLoading(false);
      return;
    }

    // Use a small tolerance for floating point comparisons
    if (newPaymentAmount > remainder + 0.001) {
      toast.error(
        `Le montant ne peut pas dépasser le reste à payer de ${remainder.toLocaleString()} F.`,
        {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: false,
        }
      );
      setIsLoading(false);
      return;
    }

    // --- 2. CALCULATION LOGIC ---
    // Add the new payment to the already paid amount to get the final total
    const newTotalPaid = currentAmountPaid + newPaymentAmount;

    const updatedData = {
      ...data,
      amountpaid: newTotalPaid,
    };

    try {
      await updateBill(billId, updatedData);
        toast.success("Le versement a été ajouté avec succès!", {
            position: "top-center",
            autoClose: 1500,
            hideProgressBar: false,
      });
      onUpdateSuccess(); // This will close the modal and refresh the list
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render a loader until the data is fetched
  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <Spinner />
      </div>
    );
  }

  const remainder = parseFloat(data.partpatient) - parseFloat(data.amountpaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-60">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Ajouter un Versement sur la Facture
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-600 dark:text-gray-300 hover:text-red-500"
          >
            ×
          </button>
        </div>

        <div className="pt-6">
          {/* NEW: Bill Summary Box */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Résumé de la Facture</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Montant total dû:</span>{" "}
                <span className="font-bold">
                  {parseFloat(data.partpatient).toLocaleString("fr-FR")} F
                </span>
              </div>
              <div className="flex justify-between">
                <span>Montant déjà payé:</span>{" "}
                <span className="font-bold text-green-600">
                  {parseFloat(data.amountpaid).toLocaleString("fr-FR")} F
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2 dark:border-gray-600">
                <span className="font-bold">Reste à Payer:</span>
                <span className="font-bold text-xl text-red-600">
                  {remainder.toLocaleString("fr-FR")} F
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="amountToAdd"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Montant du Versement
            </label>
            <input
              type="text"
              id="amountToAdd"
              inputMode="numeric"
              value={amountToAdd}
              onChange={handleAmountChange}
              className="mt-1 flex items-center h-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md px-4 w-full"
              placeholder="Entrez le montant à ajouter"
              required
              autoFocus
            />
            <div className="mt-6 text-right">
              <button
                type="submit"
                disabled={isLoading || !amountToAdd}
                className="flex items-center justify-center w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white font-medium text-xs uppercase rounded-md shadow-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? <Spinner /> : "Sauvegarder le Versement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
