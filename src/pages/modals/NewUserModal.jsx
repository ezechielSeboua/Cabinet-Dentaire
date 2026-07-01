import React, { useState, useEffect } from "react";
import useDarkMode from "../../hooks/useDarkMode";
import Modal from "react-modal";
import Select from "react-select";
import { Bounce, toast } from "react-toastify";
import { signupUser, updateUser } from "../../services/cdiService";

Modal.setAppElement("#root");

const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

export default function NewUserModal({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}) {
  const isDark = useDarkMode();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [gender, setGender] = useState(null);
  const [authorisation, setAuthorisation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = Boolean(currentUser);

  const genderOptions = [
    { value: "MALE", label: "Homme" },
    { value: "FEMELE", label: "Femme" },
    { value: "AUTRE", label: "Autre" },
  ];

  const authorisationOptions = [
    { value: "admin", label: "Administrateur" },
    { value: "doctor", label: "Docteur" },
    { value: "cashier", label: "Caissier(e)" },
    { value: "accountant", label: "Comptable" },
    { value: "patient", label: "Patient" },
  ];

  // Custom styles for the toast notifications
  const showSuccessToast = (message) =>
    toast.success(message, {
      transition: Bounce,
      autoClose: 2000,
      position: "top-center",
    });
  const showErrorToast = (message) =>
    toast.error(message, {
      transition: Bounce,
      autoClose: 3000,
      position: "top-center",
    });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && currentUser) {
        setFirstname(currentUser.firstname || "");
        setLastname(currentUser.lastname || "");
        setEmail(currentUser.email || "");
        setTelephone(currentUser.telephone || "");
        setGender(
          genderOptions.find((o) => o.value === currentUser.gender) || null
        );

        // ===================================================================
        // ### KEY CHANGE HERE ###
        // We now handle the role selection defensively and case-insensitively.
        // This ensures a match even if the backend sends "ADMIN" and the
        // frontend option value is "admin".
        // ===================================================================
        const userRoleName = currentUser.roles?.[0]?.name;
        if (userRoleName) {
          const matchingRole = authorisationOptions.find(
            (option) =>
              option.value.toLowerCase() === userRoleName.toLowerCase()
          );
          setAuthorisation(matchingRole || null);
        } else {
          setAuthorisation(null);
        }
        // ===================================================================
        // ### END OF CHANGE ###
        // ===================================================================
      } else {
        // Reset form for "add" mode
        setFirstname("");
        setLastname("");
        setEmail("");
        setTelephone("");
        setGender(null);
        setAuthorisation(null);
      }
    }
  }, [currentUser, isEditMode, isOpen]);

  const isFormValid =
    firstname.trim() !== "" &&
    lastname.trim() !== "" &&
    email.trim() !== "" &&
    telephone.trim() !== "" &&
    gender !== null &&
    authorisation !== null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.warn("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setIsLoading(true);

    const userData = {
      authorisation: authorisation?.value,
      firstname,
      lastname,
      email,
      telephone,
      gender: gender?.value,
    };

    try {
      if (isEditMode) {
        await updateUser(currentUser.userId, userData);
        showSuccessToast("Utilisateur mis à jour avec succès!");
      } else {
        userData.password = Math.random().toString(36).slice(-8);
        await signupUser(userData);
        showSuccessToast("Utilisateur créé avec succès!");
      }
      onSuccess();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Une erreur est survenue.";
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectDarkStyles = {
    control: (p) => ({ ...p, backgroundColor: isDark ? "#334155" : "#fff", borderColor: isDark ? "#475569" : "#D1D5DB" }),
    menu: (p) => ({ ...p, backgroundColor: isDark ? "#1e293b" : "#fff", zIndex: 50 }),
    option: (p, { isFocused, isSelected }) => ({ ...p, backgroundColor: isSelected ? "#be185d" : isFocused ? (isDark ? "#334155" : "#fdf2f8") : (isDark ? "#1e293b" : "#fff"), color: isSelected ? "#fff" : isDark ? "#e2e8f0" : "#111827" }),
    singleValue: (p) => ({ ...p, color: isDark ? "#e2e8f0" : "#111827" }),
    input: (p) => ({ ...p, color: isDark ? "#e2e8f0" : "#111827" }),
    placeholder: (p) => ({ ...p, color: isDark ? "#94a3b8" : "#9ca3af" }),
    indicatorSeparator: (p) => ({ ...p, backgroundColor: isDark ? "#475569" : "#D1D5DB" }),
    dropdownIndicator: (p) => ({ ...p, color: isDark ? "#94a3b8" : "#6b7280" }),
  };

  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500";

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="User Modal"
      style={{
        overlay: { backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 1000 },
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "600px",
          padding: "0",
          border: "none",
          borderRadius: "12px",
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          boxShadow:
            "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        },
      }}
    >
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {isEditMode
            ? "Modifier les infos de l'utilisateur"
            : "Créer un nouvel utilisateur"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstname"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Prénom <RequiredIndicator />
              </label>
              <input
                id="firstname"
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastname"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nom <RequiredIndicator />
              </label>
              <input
                id="lastname"
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Adresse Email <RequiredIndicator />
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label
              htmlFor="telephone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Téléphone <RequiredIndicator />
            </label>
            <input
              id="telephone"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Genre <RequiredIndicator />
              </label>
              <Select
                options={genderOptions}
                value={gender}
                onChange={setGender}
                placeholder="Sélectionner..."
                className="mt-1"
                classNamePrefix="select"
                styles={selectDarkStyles}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rôle / Autorisation <RequiredIndicator />
              </label>
              <Select
                options={authorisationOptions}
                value={authorisation}
                onChange={setAuthorisation}
                placeholder="Sélectionner..."
                className="mt-1"
                classNamePrefix="select"
                styles={selectDarkStyles}
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end space-x-3 border-t border-gray-200 dark:border-slate-600 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-shrink-0 flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-700 rounded-lg shadow-sm hover:bg-primary-800"
              disabled={!isFormValid || isLoading}
            >
              {isLoading
                ? "Enregistrement..."
                : isEditMode
                ? "Mettre à jour"
                : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
// NewUserModal component for creating or editing user information
// This component uses react-modal for the modal UI and react-select for dropdowns.
