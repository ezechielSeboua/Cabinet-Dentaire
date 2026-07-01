import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import { toast } from "react-toastify";

export default function InsuranceModal({
  isOpen,
  onClose,
  onSave,
  mode,
  insurance,
}) {
  const [formData, setFormData] = useState({ insurance: "" });
  const [isSaving, setIsSaving] = useState(false);

  // When the 'insurance' prop changes (i.e., when opening the modal for editing),
  // update the form data to reflect that insurance's current name.
  useEffect(() => {
    if (mode === "edit" && insurance) {
      setFormData({ insurance: insurance.insurance || "" });
    } else {
      setFormData({ insurance: "" }); // Reset for 'add' mode
    }
  }, [insurance, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.insurance.trim()) {
      toast.error("Le nom de l'assurance ne peut pas être vide.");
      return;
    }
    setIsSaving(true);
    const normalizedData = {
      ...formData,
      insurance: formData.insurance.trim().toUpperCase(),
    };
    await onSave(normalizedData); // Call the save function passed from the parent
    setIsSaving(false);
  };

  // Don't render anything if the modal is not open
  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {mode === "add"
              ? "Ajouter une nouvelle assurance"
              : "Modifier l'assurance"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 dark:hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="insurance"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Insurance Name
            </label>
            <input
              type="text"
              id="insurance"
              name="insurance"
              value={formData.insurance}
              onChange={handleChange}
              className="w-full h-11 px-4 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., SONAS, ASCOMA"
              required
              autoFocus
            />
          </div>

          {/* Footer with Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-sm cursor-pointer font-semibold text-white bg-primary-700 rounded-lg hover:bg-primary-800 disabled:bg-primary-400 flex items-center"
            >
              {isSaving ? <CgSpinner className="animate-spin mr-2" /> : null}
              {isSaving ? "Saving..." : "Sauvegarder les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// This component is a modal for adding or editing insurance records.
// It receives props to control its visibility, handle save actions, and manage the mode (add/edit).
