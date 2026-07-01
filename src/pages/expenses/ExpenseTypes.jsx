import React, { useState, useEffect } from "react";
import { Bounce, toast } from "react-toastify";
import { addExpenseType, updateExpenseType } from "../../services/cdiService"; // Assuming you have an update service
import { IoClose } from "react-icons/io5";

export default function ExpenseTypes({ closeModal, refreshList, expense }) {
  const [name, setName] = useState("");
  const isEditing = expense !== null;

  useEffect(() => {
    if (isEditing) {
      setName(expense.name);
    }
  }, [expense, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name: name.toUpperCase() };

    try {
      if (isEditing) {
        // Perform update
        await updateExpenseType(expense.id, data); // You'll need to create this service function
        toast.success("Le type de dépense a été mis à jour.", {
          position: "top-center",
          autoClose: 1000,
        });
      } else {
        // Perform add
        await addExpenseType(data);
        toast.success("Un nouveau type de dépense a été ajouté.", {
          position: "top-center",
          autoClose: 1000,
        });
      }
      refreshList();
      closeModal();
    } catch (error) {
      console.error("Operation failed:", error);
      toast.error("Erreur pendant l'opération.", {
        position: "top-center",
        autoClose: 1000,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {isEditing ? "Mise à jour d'un type" : "Ajout d'un type"}
        </h2>
        <button
          onClick={closeModal}
          className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 dark:hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <IoClose size={24} />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="expense-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
          Nom de la dépense
          </label>
          <input
            type="text"
            id="expense-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white px-4"
            placeholder="Enter the expense name"
          />
        </div>
        <div className="flex justify-end mt-6">
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
