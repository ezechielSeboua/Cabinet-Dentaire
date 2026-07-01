// the Reusable Modal Component
import { XMarkIcon } from "@heroicons/react/24/solid"; // You might need to install: npm install @heroicons/react

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    // Main overlay with a semi-transparent background
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close modal if background is clicked
    >
      {/* Modal content container */}
      <div
        className="relative w-full max-w-3xl mx-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl transform transition-all duration-300 ease-in-out"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b dark:border-slate-600 rounded-t">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <XMarkIcon className="w-5 h-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>

        {/* Modal Body (where the form steps will go) */}
        <div className="p-6 space-y-6">{children}</div>
      </div>
    </div>
  );
}
