import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { newExpense, updateExpense } from "../../services/cdiService";
import { IoClose } from "react-icons/io5";

export default function ExpenseForm({
  closeModal,
  refreshList,
  expense,
  expenseTypes,
}) {
  // `isEditing` is true if an `expense` object is passed, otherwise false.
  const isEditing = expense !== null;

  // State for each form field
  const [selectedType, setSelectedType] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // When in "edit" mode, this effect runs and populates the form with existing data.
  useEffect(() => {
    if (isEditing) {
      // Find the correct object for the react-select component
      const currentType = expenseTypes.find(
        (opt) => opt.label === expense.expense,
      );
      setSelectedType(currentType);
      setAmount(expense.amount);
      setDescription(expense.description || "");
    }
  }, [expense, isEditing, expenseTypes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType || !amount) {
      toast.warn("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const data = {
      expense: selectedType.label, // Send the name/label
      amount: parseFloat(amount),
      description,
    };

    try {
      if (isEditing) {
        // --- UPDATE LOGIC ---
        // You will need to create an `updateExpense` function in your service file.
        await updateExpense(expense.id, data);
        toast.success("Dépense mise à jour avec succès !", { autoClose: 1000 });
      } else {
        // --- ADD LOGIC ---
        await newExpense(data);
        toast.success("Nouvelle dépense ajoutée avec succès !", {
          autoClose: 1000,
        });
      }
      refreshList(); // Refresh the data table
      closeModal(); // Close the modal
    } catch (error) {
      console.error("L'opération a échoué :", error);
      toast.error("Une erreur s'est produite pendant l'opération.");
    }
  };

  // Custom styles for React-Select to match the theme
  const selectStyles = {
    control: (styles) => ({
      ...styles,
      height: "42px",
      borderColor: "#d1d5db",
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected ? "#2563eb" : isFocused ? "#eff6ff" : null,
      color: isSelected ? "white" : "#1f2937",
    }),
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditing ? "Mise à jour" : "Ajout d'une dépense"}
        </h2>
        <button
          onClick={closeModal}
          className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 dark:hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <IoClose size={24} />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="expense-type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Type de dépense <span className="text-red-500">*</span>
            </label>
            <Select
              id="expense-type"
              options={expenseTypes}
              value={selectedType}
              onChange={setSelectedType}
              styles={selectStyles}
              placeholder="Choose an expense type..."
              noOptionsMessage={() => "No types found"}
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Montant <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white px-4"
              placeholder="e.g., 50.75"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description / Commentaire
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white px-4 py-2"
              placeholder="Optional details about the expense..."
            />
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex mr-2  cursor-pointer justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="w-full cursor-pointer md:w-auto bg-primary-700 text-white font-bold py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {isEditing ? "Mettre à jour" : "Sauvegarder"}
          </button>
        </div>
      </form>
    </div>
  );
}
