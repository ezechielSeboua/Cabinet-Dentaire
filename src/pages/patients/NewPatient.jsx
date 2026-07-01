import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import { IoArrowBack, IoSaveOutline, IoArrowForward } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import { AnimatePresence, motion } from "framer-motion";

// Services
import {
  addPatient,
  insuranceList,
  insurance2List,
} from "../../services/cdiService";

// A more visually distinct input field with optional icon and error display
const FormField = ({ label, icon, children, error }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </div>
      )}
      {children}
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

// A reusable styled button for consistency
const ActionButton = ({
  onClick,
  type = "button",
  disabled,
  children,
  variant = "primary",
}) => {
  const baseClasses =
    "w-full md:w-auto flex items-center justify-center gap-2.5 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-150";

  const variants = {
    primary:
      "text-white bg-black hover:bg-green-700 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed",
    secondary:
      "text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-400 disabled:bg-gray-200",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

export default function NewPatient() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    telephone: "",
    dob: "",
    profession: "",
    gender: "",
    insurance: "NA",
    insurance_pourcentage: 0,
    insurance_matricule: "NA",
    insurance2: "NA",
    insurance2_pourcentage: 0,
    insurance2_matricule: "NA",
  });
  const [errors, setErrors] = useState({});
  const [record, setRecord] = useState([]);
  const [recordInsurance2, setRecordInsurance2] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [ins1Res, ins2Res] = await Promise.all([
          insuranceList(),
          insurance2List(),
        ]);
        setRecord(
          ins1Res.data.sort((a, b) => a.insurance.localeCompare(b.insurance))
        );
        setRecordInsurance2(
          ins2Res.data.sort((a, b) => a.insurance2.localeCompare(b.insurance2))
        );
      } catch (error) {
        console.error("Failed to fetch insurance lists:", error);
        toast.error("Could not load insurance data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const insuranceOptions = useMemo(
    () =>
      record.map((item) => ({ value: item.insurance, label: item.insurance })),
    [record]
  );
  const insurance2Options = useMemo(
    () =>
      recordInsurance2.map((item) => ({
        value: item.insurance2,
        label: item.insurance2,
      })),
    [recordInsurance2]
  );
  const genderOptions = [
    { value: "MALE", label: "Masculin" },
    { value: "FEMELE", label: "Féminin" },
    { value: "AUTRE", label: "Autre" },
  ];
  // (masculin, féminin
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstname.trim())
      newErrors.firstname = "First name is required.";
    if (!formData.lastname.trim())
      newErrors.lastname = "Last name is required.";
    if (!formData.dob) newErrors.dob = "Date of birth is required.";
    if (!formData.gender) newErrors.gender = "Gender is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    } else {
      toast.warn("Please fill in all required fields.");
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep1()) {
      toast.error("Please correct the errors on the first page.");
      setStep(1);
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    const patientData = {
      ...formData,
      firstname: formData.firstname.toUpperCase(),
      lastname: formData.lastname.toUpperCase(),
      profession: formData.profession.toUpperCase(),
      email: formData.email.toLowerCase(),
      insurance_pourcentage: Number(formData.insurance_pourcentage) || 0,
      insurance2_pourcentage: Number(formData.insurance2_pourcentage) || 0,
    };
    try {
      await addPatient(patientData);
      toast.success("Patient created successfully!");
      navigate("/patient-upload-picture");
    } catch (error) {
      console.error("Error adding patient:", error);
      toast.error("An error occurred while saving the patient.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom styles for react-select to match your theme
  const selectStyles = (hasError) => ({
    control: (provided) => ({
      ...provided,
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
      minHeight: "36px", // UPDATED: Reduced height
    }),
    container: (provided) => ({
      ...provided,
      backgroundColor: "rgb(243 244 246)",
      border: `1px solid ${hasError ? "rgb(239 68 68)" : "rgb(209 213 219)"}`,
      borderRadius: "0.5rem",
      transition: "border-color 150ms ease-in-out",
      "&:hover": {
        borderColor: hasError ? "rgb(239 68 68)" : "rgb(99 102 241)",
      },
    }),
    input: (base) => ({ ...base, "input:focus": { boxShadow: "none" } }),
    placeholder: (base) => ({
      ...base,
      color: "rgb(107 114 128)",
      fontSize: "0.875rem",
    }),
    singleValue: (base) => ({ ...base, fontSize: "0.875rem" }),
  });

  // Common input class for styling, including error state
  const inputStyle = (hasError) =>
    `w-full h-9 text-sm bg-gray-100 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150 ${
      hasError ? "border-red-500" : "border-gray-300 dark:border-gray-600"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 antialiased">
      <main className="h-full w-full p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* STEP INDICATOR */}
          <div className="flex items-center justify-center mb-8">
            <div
              className={`flex items-center gap-2 ${
                step === 1 ? "text-black dark:text-white" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step >= 1 ? "bg-black text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <span className="font-semibold">Information du Patient</span>
            </div>
            <div
              className={`flex-1 h-0.5 mx-4 ${
                step > 1 ? "bg-black" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center gap-2 ${
                step === 2 ? "text-black dark:text-white" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step >= 2 ? "bg-black text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span className="font-semibold">Insurance</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <CgSpinner className="animate-spin text-black" size={40} />
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <fieldset>
                        <legend className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
                          Information du Patient
                        </legend>
                        {/* UPDATED: Reduced vertical gap with gap-y-3 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                          <FormField
                            label="First Name"
                            error={errors.firstname}
                          >
                            <input
                              type="text"
                              name="firstname"
                              value={formData.firstname}
                              onChange={handleChange}
                              className={`${inputStyle(errors.firstname)} px-3`}
                            />
                          </FormField>
                          <FormField label="Last Name" error={errors.lastname}>
                            <input
                              type="text"
                              name="lastname"
                              value={formData.lastname}
                              onChange={handleChange}
                              className={`${inputStyle(errors.lastname)} px-3`}
                            />
                          </FormField>
                          <FormField label="Date of Birth" error={errors.dob}>
                            <input
                              type="date"
                              name="dob"
                              value={formData.dob}
                              onChange={handleChange}
                              className={`${inputStyle(errors.dob)} px-3`}
                            />
                          </FormField>
                          <FormField label="Gender" error={errors.gender}>
                            <Select
                              options={genderOptions}
                              styles={selectStyles(errors.gender)}
                              placeholder="Select gender..."
                              value={genderOptions.find(
                                (opt) => opt.value === formData.gender
                              )}
                              onChange={(option) =>
                                handleSelectChange("gender", option)
                              }
                            />
                          </FormField>
                          <FormField label="Profession">
                            <input
                              type="text"
                              name="profession"
                              value={formData.profession}
                              onChange={handleChange}
                              className={`${inputStyle()} px-3`}
                            />
                          </FormField>
                          <FormField label="Email Address">
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`${inputStyle()} px-3 lowercase`}
                              placeholder="patient@example.com"
                            />
                          </FormField>
                          <FormField label="Telephone">
                            <input
                              type="tel"
                              name="telephone"
                              value={formData.telephone}
                              onChange={handleChange}
                              className={`${inputStyle()} px-3`}
                              placeholder="+1 (555) 123-4567"
                            />
                          </FormField>
                        </div>
                      </fieldset>
                      <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-end">
                        <ActionButton onClick={handleNextStep}>
                          Prochaine Etape <IoArrowForward size={18} />
                        </ActionButton>
                      </div>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <fieldset>
                        <legend className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-6">
                          Coverture Assurances
                        </legend>
                        <div className="space-y-8">
                          <div className="p-5 border rounded-lg dark:border-gray-700">
                            <h3 className="font-semibold mb-4 text-gray-600 dark:text-gray-300">
                              Primary Insurance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <Select
                                options={insuranceOptions}
                                styles={selectStyles()}
                                isClearable
                                placeholder="Select primary..."
                                value={insuranceOptions.find(
                                  (opt) => opt.value === formData.insurance
                                )}
                                onChange={(option) =>
                                  handleSelectChange("insurance", option)
                                }
                              />
                              <input
                                type="text"
                                name="insurance_matricule"
                                value={formData.insurance_matricule}
                                onChange={handleChange}
                                placeholder="Matricule / ID"
                                className={`${inputStyle()} px-3`}
                              />
                              <input
                                type="number"
                                name="insurance_pourcentage"
                                value={formData.insurance_pourcentage}
                                onChange={handleChange}
                                placeholder="Coverage %"
                                min="0"
                                max="100"
                                className={`${inputStyle()} px-3`}
                              />
                            </div>
                          </div>
                          <div className="p-5 border rounded-lg dark:border-gray-700">
                            <h3 className="font-semibold mb-4 text-gray-600 dark:text-gray-300">
                              Secondary Insurance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <Select
                                options={insurance2Options}
                                styles={selectStyles()}
                                isClearable
                                placeholder="Select secondary..."
                                value={insurance2Options.find(
                                  (opt) => opt.value === formData.insurance2
                                )}
                                onChange={(option) =>
                                  handleSelectChange("insurance2", option)
                                }
                              />
                              <input
                                type="text"
                                name="insurance2_matricule"
                                value={formData.insurance2_matricule}
                                onChange={handleChange}
                                placeholder="Matricule / ID"
                                className={`${inputStyle()} px-3`}
                              />
                              <input
                                type="number"
                                name="insurance2_pourcentage"
                                value={formData.insurance2_pourcentage}
                                onChange={handleChange}
                                placeholder="Coverage %"
                                min="0"
                                max="100"
                                className={`${inputStyle()} px-3`}
                              />
                            </div>
                          </div>
                        </div>
                      </fieldset>
                      <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-between">
                        <ActionButton
                          onClick={handlePrevStep}
                          variant="secondary"
                        >
                          <IoArrowBack size={18} /> Etape Précédente
                        </ActionButton>
                        <ActionButton type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <CgSpinner className="animate-spin" size={20} />{" "}
                              Saving...
                            </>
                          ) : (
                            <>
                              <IoSaveOutline size={20} /> Save Patient
                            </>
                          )}
                        </ActionButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
// This code is a React component for creating a new patient record with multi-step form functionality.
// It includes form validation, dynamic insurance selection, and a responsive design.
