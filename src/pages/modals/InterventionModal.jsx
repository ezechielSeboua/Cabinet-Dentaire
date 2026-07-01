import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import { toast } from "react-toastify";

export default function InterventionModal({
  isOpen,
  onClose,
  onSave,
  mode,
  intervention,
}) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // When the modal opens for editing, populate the form with the existing data.
  // When it opens for adding, ensure the form is clear.
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && intervention) {
        setFormData({
          name: intervention.name || "",
          price: intervention.price || "",
        });
      } else {
        setFormData({ name: "", price: "" });
      }
    }
  }, [isOpen, mode, intervention]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Le nom de l'intervention ne peut pas être vide.");
      return;
    }
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {mode === "add"
              ? "Ajouter une nouvelle intervention"
              : "Modifier l'intervention"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 dark:hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nom de l'intervention
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full h-11 px-4 text-sm bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              required
              autoFocus
            />
          </div>

          {/* Footer with Actions */}
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-slate-600 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600"
              title="Annuler l'intervention"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-shrink-0 flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-700 rounded-lg shadow-sm hover:bg-primary-800"
              title="Enregistrer les modifications"
            >
              {isSaving && <CgSpinner className="animate-spin mr-2" />}
              {isSaving ? "Enregistrement..." : "Sauvegarder l'intervention"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// This component is a modal for adding or editing interventions.
// It includes a form with fields for the intervention name, price, and description.
