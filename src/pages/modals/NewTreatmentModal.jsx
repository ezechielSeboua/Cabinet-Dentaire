import { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import useDarkMode from "../../hooks/useDarkMode";

import { toast } from "react-toastify";
import * as authService from "../../services/authService";
import {
  updateTreatment,
  addTreatment,
  interventionList,
  getAllUsers,
  ListSignlepatient,
} from "../../services/cdiService";
import { IoPersonCircleOutline } from "react-icons/io5";
import TeethSelector from "../../components/ui/TeethSelector";

const CustomLoader = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
  </div>
);

const PriceInput = ({ value, onChange, disabled, placeholder = "0" }) => (
  <input
    type="number"
    min="0"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full text-sm border border-gray-300 dark:border-slate-600 rounded-md h-9 px-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
    placeholder={placeholder}
    disabled={disabled}
  />
);

export default function NewTreatmentModal({
  isOpen,
  onClose,
  onSuccess,
  patient,
  treatmentToEdit,
}) {
  const isDark = useDarkMode();
  const [currentUser] = useState(authService.getCurrentUser());
  const isEditMode = Boolean(treatmentToEdit);
  const isDoctor = useMemo(
    () => currentUser?.body?.roles?.includes("DOCTOR"),
    [currentUser]
  );
  const isCashier = useMemo(
    () => currentUser?.body?.roles?.includes("CASHIER"),
    [currentUser]
  );
  const isAccountant = useMemo(
    () => currentUser?.body?.roles?.includes("ACCOUNTANT"),
    [currentUser]
  );
  const isAdmin = useMemo(
    () => currentUser?.body?.roles?.includes("ADMIN"),
    [currentUser]
  );
  const canFullyEdit = isDoctor || isCashier || isAccountant || isAdmin;

  const [doctors, setDoctors] = useState([]);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [allInterventions, setAllInterventions] = useState([]);
  const [selectedInterventions, setSelectedInterventions] = useState([]);
  const [treatmentStatus, setTreatmentStatus] = useState({
    value: "En-cours",
    label: "En-cours",
  });
  const [prescription, setPrescription] = useState("");
  const [loading, setLoading] = useState(false);
  // Each entry: { label, price, priceIns1, priceIns2 }
  // price       = clinic's actual charge (always used for totalAmount)
  // priceIns1   = insurance 1 agreed tariff (only relevant when both insurances)
  // priceIns2   = insurance 2 agreed tariff (only relevant when both insurances)
  const [interventionDetails, setInterventionDetails] = useState([]);
  const [displayPatientPart, setDisplayPatientPart] = useState(0);
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [editPatientData, setEditPatientData] = useState(null);

  const displayPatient = isEditMode ? treatmentToEdit : patient;
  const { id, insurance, insurance2 } = displayPatient || {};

  const nonAssuredValues = ["NA", "NON ASSURE", "NON ASSURÉ"];
  const isInsurance1Assured =
    insurance && !nonAssuredValues.includes(insurance.toUpperCase());
  const isInsurance2Assured =
    insurance2 &&
    insurance2 !== "undefined" &&
    !nonAssuredValues.includes(insurance2.toUpperCase());
  const bothInsured = isInsurance1Assured && isInsurance2Assured;

  // In edit mode use the freshly-fetched patient record for percentages
  const ins1Pct = (isEditMode ? editPatientData : displayPatient)?.insurance_pourcentage ?? 0;
  const ins2Pct = (isEditMode ? editPatientData : displayPatient)?.insurance2_pourcentage ?? 0;

  const isFormDisabled = loading || (isEditMode && !canFullyEdit);

  // Fetch doctor list for non-doctor users; auto-set for doctors
  useEffect(() => {
    if (!isOpen) return;
    if (isDoctor) {
      setSelectedDoctor({
        value: currentUser.body.email,
        label: `Dr. ${currentUser.body.lastname} ${currentUser.body.firstname}`,
      });
      return;
    }
    setIsDoctorsLoading(true);
    getAllUsers()
      .then((allUsers) => {
        const usersArray = Array.isArray(allUsers) ? allUsers : [];
        const doctorUsers = usersArray.filter((u) => {
          const auth = u.authorisation?.toLowerCase() ?? "";
          const hasDocRole =
            Array.isArray(u.roles) &&
            u.roles.some((r) => {
              const name = (typeof r === "string" ? r : String(r.name ?? "")).toLowerCase();
              return name === "doctor" || name === "role_doctor";
            });
          return auth === "doctor" || hasDocRole;
        });
        setDoctors(
          doctorUsers
            .map((d) => ({
              value: d.email,
              label: `Dr. ${d.lastname} ${d.firstname}`,
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
        );
      })
      .catch(() => toast.error("Impossible de charger la liste des médecins."))
      .finally(() => setIsDoctorsLoading(false));
  }, [isOpen, isDoctor, currentUser]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const patientFetch =
        isEditMode && treatmentToEdit?.patient
          ? ListSignlepatient(treatmentToEdit.patient).catch(() => null)
          : Promise.resolve(null);

      Promise.all([interventionList(), patientFetch])
        .then(([res, patientRes]) => {
          const allInterventionData = res.data;
          setAllInterventions(allInterventionData);

          if (isEditMode) {
            const patientData = patientRes?.data ?? null;
            setEditPatientData(patientData);

            const fetchedIns1Pct = patientData?.insurance_pourcentage ?? 0;
            const fetchedIns2Pct = patientData?.insurance2_pourcentage ?? 0;

            if (!isDoctor && treatmentToEdit.doctor) {
              setSelectedDoctor({
                value: treatmentToEdit.doctor,
                label: treatmentToEdit.doctorname || treatmentToEdit.doctor,
              });
            }
            setPrescription(treatmentToEdit.prescription || "");
            setTreatmentStatus({
              value: treatmentToEdit.treatmentstatus,
              label: treatmentToEdit.treatmentstatus,
            });

            const matched = allInterventionData.filter((i) =>
              treatmentToEdit.interventions.includes(i.name)
            );
            setSelectedInterventions(
              matched.map((i) => ({ value: i.id, label: i.name }))
            );

            // Build per-intervention lookup maps by name
            const interSeanceMap = {};
            const priceMap = {};
            const priceIns1Map = {};
            const priceIns2Map = {};
            (treatmentToEdit.interventions || []).forEach((name, idx) => {
              interSeanceMap[name] = (treatmentToEdit.interSeance || [])[idx] || "";
              const storedPrice = (treatmentToEdit.interventionPrices || [])[idx];
              const storedIns1  = (treatmentToEdit.interventionTarifsIns1 || [])[idx];
              const storedIns2  = (treatmentToEdit.interventionTarifsIns2 || [])[idx];
              if (storedPrice != null) priceMap[name]    = storedPrice;
              if (storedIns1  != null) priceIns1Map[name] = storedIns1;
              if (storedIns2  != null) priceIns2Map[name] = storedIns2;
            });

            // Distribute stored totals evenly across interventions.
            // If tarifAssurance was never saved (=0), back-calculate from partinsurance + patient pct.
            const count = matched.length;
            const priceEach =
              count > 0
                ? Math.round((treatmentToEdit.treatmentamount || 0) / count)
                : 0;

            const stored1 = treatmentToEdit.tarifAssurance || 0;
            const tarif1 =
              stored1 > 0
                ? stored1
                : fetchedIns1Pct > 0
                ? Math.round(((treatmentToEdit.partinsurance || 0) * 100) / fetchedIns1Pct)
                : 0;
            const ins1Each = count > 0 ? Math.round(tarif1 / count) : 0;

            const stored2 = treatmentToEdit.tarifAssurance2 || 0;
            const tarif2 =
              stored2 > 0
                ? stored2
                : fetchedIns2Pct > 0
                ? Math.round(((treatmentToEdit.partinsurance2 || 0) * 100) / fetchedIns2Pct)
                : 0;
            const ins2Each = count > 0 ? Math.round(tarif2 / count) : 0;

            // For single-insured patients, item.price drives ins1TarifBase (= totalAmount).
            // treatmentamount is saved as 0 for insured patients, so priceEach = 0.
            // Use ins1Each / ins2Each instead so tarifAssurance recalculates correctly on save.
            const priceForDisplay =
              !bothInsured && isInsurance1Assured && ins1Each > 0
                ? ins1Each
                : !bothInsured && isInsurance2Assured && ins2Each > 0
                ? ins2Each
                : priceEach;

            setInterventionDetails(
              matched.map((i) => ({
                label: i.name,
                price: priceMap[i.name] != null ? String(priceMap[i.name]) : String(priceForDisplay),
                priceIns1: priceIns1Map[i.name] != null ? String(priceIns1Map[i.name]) : (ins1Each > 0 ? String(ins1Each) : ""),
                priceIns2: priceIns2Map[i.name] != null ? String(priceIns2Map[i.name]) : (ins2Each > 0 ? String(ins2Each) : ""),
                interSeance: interSeanceMap[i.name] || "",
              }))
            );
            setDisplayPatientPart(Math.max(0, treatmentToEdit.partpatient));
            setSelectedTeeth(treatmentToEdit.teeth || []);
          } else {
            setEditPatientData(null);
            setSelectedInterventions([]);
            setInterventionDetails([]);
            setPrescription("");
            setTreatmentStatus({ value: "En-cours", label: "En-cours" });
            setDisplayPatientPart(0);
            setSelectedTeeth([]);
            if (!isDoctor) setSelectedDoctor(null);
          }
        })
        .catch(() => toast.error("Erreur de chargement."))
        .finally(() => setLoading(false));
    }
  }, [isOpen, isEditMode, treatmentToEdit]);

  // ── Derived financial values ──────────────────────────────────────────────

  // Sum of clinic prices ("Prix Clinique" column, or "Prix" for single/uninsured)
  const totalAmount = useMemo(
    () => interventionDetails.reduce((acc, d) => acc + (parseFloat(d.price) || 0), 0),
    [interventionDetails]
  );

  // Raw tariff bases — the amounts each insurance uses before applying its %
  // For single insured these equal totalAmount; for dual insured they come from their own columns
  const ins1TarifBase = useMemo(() => {
    if (!isInsurance1Assured) return 0;
    if (bothInsured)
      return interventionDetails.reduce((acc, d) => acc + (parseFloat(d.priceIns1) || 0), 0);
    return totalAmount;
  }, [isInsurance1Assured, bothInsured, interventionDetails, totalAmount]);

  const ins2TarifBase = useMemo(() => {
    if (!isInsurance2Assured) return 0;
    if (bothInsured)
      return interventionDetails.reduce((acc, d) => acc + (parseFloat(d.priceIns2) || 0), 0);
    return totalAmount;
  }, [isInsurance2Assured, bothInsured, interventionDetails, totalAmount]);

  // What each insurance actually pays
  // In edit mode, if the percentage isn't stored on Treatment, fall back to the saved amount
  const ins1Amount = useMemo(() => {
    if (isEditMode && ins1Pct === 0) return treatmentToEdit?.partinsurance ?? 0;
    return Math.round((ins1TarifBase * ins1Pct) / 100);
  }, [ins1TarifBase, ins1Pct, isEditMode, treatmentToEdit]);
  const ins2Amount = useMemo(() => {
    if (isEditMode && ins2Pct === 0) return treatmentToEdit?.partinsurance2 ?? 0;
    return Math.round((ins2TarifBase * ins2Pct) / 100);
  }, [ins2TarifBase, ins2Pct, isEditMode, treatmentToEdit]);

  // Auto-set patient part based on insurance situation
  useEffect(() => {
    if (bothInsured) {
      setDisplayPatientPart(0);
    } else if (!isInsurance1Assured && !isInsurance2Assured) {
      setDisplayPatientPart(totalAmount);
    } else {
      // Single insured: patient pays the uncovered portion of the tariff
      const tarif = isInsurance1Assured ? ins1TarifBase : ins2TarifBase;
      const ins  = isInsurance1Assured ? ins1Amount    : ins2Amount;
      setDisplayPatientPart(Math.max(0, tarif - ins));
    }
  }, [totalAmount, ins1TarifBase, ins2TarifBase, ins1Amount, ins2Amount,
      bothInsured, isInsurance1Assured, isInsurance2Assured]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleInterventionChange = (selectedOptions) => {
    const newSelected = selectedOptions || [];
    setSelectedInterventions(newSelected);
    const newDetails = newSelected.map((option) => {
      const existing = interventionDetails.find((d) => d.label === option.label);
      return (
        existing || { label: option.label, price: "", priceIns1: "", priceIns2: "", interSeance: "" }
      );
    });
    setInterventionDetails(newDetails);
  };

  const handleDetailChange = (index, field, value) => {
    setInterventionDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      toast.error("Veuillez sélectionner un médecin.");
      return;
    }
    setLoading(true);
    const finalPatientAmount = Math.max(0, displayPatientPart);

    const isAnyInsured = isInsurance1Assured || isInsurance2Assured;

    if (isEditMode) {
      const dataToUpdate = {
        ...treatmentToEdit,
        treatmentstatus: treatmentStatus.value,
        prescription,
        partpatient: finalPatientAmount,
      };
      dataToUpdate.teeth = selectedTeeth;
      if (canFullyEdit) {
        dataToUpdate.interventions = selectedInterventions.map((i) => i.label);
        dataToUpdate.interSeance = interventionDetails.map((d) => d.interSeance || "");
        dataToUpdate.interventionPrices = interventionDetails.map((d) => String(parseFloat(d.price) || 0));
        dataToUpdate.interventionTarifsIns1 = interventionDetails.map((d) => String(parseFloat(d.priceIns1) || 0));
        dataToUpdate.interventionTarifsIns2 = interventionDetails.map((d) => String(parseFloat(d.priceIns2) || 0));
        dataToUpdate.treatmentamount = isAnyInsured ? 0 : totalAmount;
        dataToUpdate.tarifAssurance = ins1TarifBase || treatmentToEdit.tarifAssurance || 0;
        dataToUpdate.tarifAssurance2 = ins2TarifBase || treatmentToEdit.tarifAssurance2 || 0;
        // Preserve existing insurance amounts — Treatment has no insurance_pourcentage,
        // so ins1Pct=0 and recalculating would zero them out.
        dataToUpdate.partinsurance = ins1Pct > 0 ? ins1Amount : (treatmentToEdit.partinsurance ?? 0);
        dataToUpdate.partinsurance2 = ins2Pct > 0 ? ins2Amount : (treatmentToEdit.partinsurance2 ?? 0);
      }
      updateTreatment(treatmentToEdit.id, dataToUpdate)
        .then(() => {
          toast.success("Le traitement a été mis à jour!", {
            theme: "colored",
            autoClose: 1000,
            position: "top-center",
          });
          onSuccess(dataToUpdate);
        })
        .catch(() => {
          toast.error("Erreur de mise à jour.");
          setLoading(false);
        });
    } else {
      const dataToAdd = {
        interventions: selectedInterventions.map((i) => i.label),
        interSeance: interventionDetails.map((d) => d.interSeance || ""),
        doctor: selectedDoctor.value,
        doctorname: selectedDoctor.label,
        patient: parseInt(id),
        patientname: `${patient.lastname} ${patient.firstname}`,
        patientno: patient.patientno,
        patienttelephone: patient.telephone,
        treatmentstatus: treatmentStatus.value,
        treatmentamount: isAnyInsured ? 0 : totalAmount,
        statuspayment: finalPatientAmount <= 0 ? "Payé" : "Impayé",
        insurance: patient.insurance || "NON ASSURÉ",
        insurance2: patient.insurance2 || "NON ASSURÉ",
        prescription,
        tarifAssurance: ins1TarifBase,
        tarifAssurance2: ins2TarifBase,
        partinsurance: ins1Amount,
        partinsurance2: ins2Amount,
        partpatient: finalPatientAmount,
        teeth: selectedTeeth,
        interventionPrices: interventionDetails.map((d) => String(parseFloat(d.price) || 0)),
        interventionTarifsIns1: interventionDetails.map((d) => String(parseFloat(d.priceIns1) || 0)),
        interventionTarifsIns2: interventionDetails.map((d) => String(parseFloat(d.priceIns2) || 0)),
      };
      addTreatment(dataToAdd)
        .then((res) => {
          toast.success("Traitement sauvegardé!");
          onSuccess(res.data);
        })
        .catch(() => {
          toast.error("Erreur de sauvegarde.");
          setLoading(false);
        });
    }
  };

  // ── Options & styles ──────────────────────────────────────────────────────

  const interventionOptions = useMemo(
    () => allInterventions.map((i) => ({ value: i.id, label: i.name })),
    [allInterventions]
  );

  const statusOptions = [
    { value: "En-cours", label: "En-cours" },
    { value: "Terminé", label: "Terminé" },
  ];

  const customSelectStyles = {
    control: (p) => ({
      ...p,
      minHeight: "40px",
      height: "40px",
      borderColor: isDark ? "#475569" : "#D1D5DB",
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
    }),
    menu: (p) => ({
      ...p,
      zIndex: 50,
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
    }),
    menuList: (p) => ({
      ...p,
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
    }),
    option: (p, { isFocused, isSelected }) => ({
      ...p,
      backgroundColor: isSelected
        ? "#db2777"
        : isFocused
        ? isDark ? "#831843" : "#fdf2f8"
        : isDark ? "#1e293b" : "#ffffff",
      color: isDark ? "#e2e8f0" : "#111827",
    }),
    singleValue: (p) => ({
      ...p,
      color: isDark ? "#e2e8f0" : "#111827",
    }),
    multiValue: (p) => ({
      ...p,
      backgroundColor: isDark ? "#831843" : "#fdf2f8",
    }),
    multiValueLabel: (p) => ({
      ...p,
      color: isDark ? "#fbcfe8" : "#be185d",
    }),
    multiValueRemove: (p) => ({
      ...p,
      color: isDark ? "#fbcfe8" : "#be185d",
      ":hover": { backgroundColor: "#db2777", color: "white" },
    }),
    input: (p) => ({
      ...p,
      color: isDark ? "#e2e8f0" : "#111827",
    }),
    placeholder: (p) => ({
      ...p,
      color: isDark ? "#94a3b8" : "#9ca3af",
    }),
    valueContainer: (p) => ({ ...p, height: "40px", padding: "0 6px" }),
    indicatorsContainer: (p) => ({ ...p, height: "40px" }),
    indicatorSeparator: (p) => ({
      ...p,
      backgroundColor: isDark ? "#475569" : "#D1D5DB",
    }),
    dropdownIndicator: (p) => ({
      ...p,
      color: isDark ? "#94a3b8" : "#6b7280",
    }),
    clearIndicator: (p) => ({
      ...p,
      color: isDark ? "#94a3b8" : "#6b7280",
    }),
  };

  const fmt = (n) => n.toLocaleString("fr-FR", { minimumFractionDigits: 0 });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-transparent bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b dark:border-slate-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? "Modifier le Traitement" : "Nouveau Traitement"}
          </h1>
          <p className="text-xs text-primary-600 dark:text-slate-400">
            {isEditMode
              ? `Mise à jour pour ${displayPatient.patientname}.`
              : `Création pour ${patient.lastname} ${patient.firstname}`}
          </p>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {loading ? (
            <CustomLoader />
          ) : (
            <form id="treatment-form" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                {/* ── Left column ── */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Patient info */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-white border-b dark:border-slate-600 pb-2 mb-3 flex items-center gap-2">
                      <IoPersonCircleOutline
                        className="text-primary-600"
                        size={20}
                      />
                      Informations Patient
                    </h2>

                    {!isDoctor && (
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Médecin traitant{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Select
                          options={doctors}
                          value={selectedDoctor}
                          onChange={setSelectedDoctor}
                          isLoading={isDoctorsLoading}
                          placeholder="Sélectionner un médecin..."
                          noOptionsMessage={() => "Aucun médecin trouvé."}
                          styles={customSelectStyles}
                          isDisabled={loading || isEditMode}
                        />
                      </div>
                    )}

                    <div className="text-sm space-y-1 text-gray-800 dark:text-gray-200">
                      <p>
                        <span className="font-semibold">Nom:</span>{" "}
                        {isEditMode
                          ? displayPatient.patientname
                          : `${patient.lastname} ${patient.firstname}`}
                      </p>
                      <p>
                        <span className="font-semibold">N° Patient:</span>{" "}
                        {displayPatient.patientno}
                      </p>
                      {isInsurance1Assured && (
                        <p>
                          <span className="font-semibold">{insurance}:</span>{" "}
                          {ins1Pct}% de couverture
                        </p>
                      )}
                      {isInsurance2Assured && (
                        <p>
                          <span className="font-semibold">{insurance2}:</span>{" "}
                          {ins2Pct}% de couverture
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Interventions & prices */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-white border-b dark:border-slate-600 pb-2 mb-3">
                      Interventions & Prix
                    </h2>
                    <Select
                      isMulti
                      options={interventionOptions}
                      value={selectedInterventions}
                      onChange={handleInterventionChange}
                      styles={customSelectStyles}
                      placeholder="Sélectionner des interventions..."
                      isDisabled={isFormDisabled}
                    />

                    {interventionDetails.length > 0 &&
                      (bothInsured ? (
                        /* Card layout for two-insurance case — each input gets full width */
                        <div className="mt-4 space-y-2">
                          {interventionDetails.map((item, index) => (
                            <div
                              key={index}
                              className="border dark:border-slate-600 rounded-lg p-3 bg-gray-50 dark:bg-slate-800"
                            >
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 pb-1.5 border-b dark:border-slate-600">
                                {item.label}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-primary-700 dark:text-primary-400 mb-1">
                                    Tarif {insurance} (FCFA)
                                  </label>
                                  <PriceInput
                                    value={item.priceIns1}
                                    onChange={(v) =>
                                      handleDetailChange(index, "priceIns1", v)
                                    }
                                    disabled={isFormDisabled}
                                    placeholder={`Tarif ${insurance}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                                    Tarif {insurance2} (FCFA)
                                  </label>
                                  <PriceInput
                                    value={item.priceIns2}
                                    onChange={(v) =>
                                      handleDetailChange(index, "priceIns2", v)
                                    }
                                    disabled={isFormDisabled}
                                    placeholder={`Tarif ${insurance2}`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">
                                    Inter-séance
                                  </label>
                                  <textarea
                                    value={item.interSeance || ""}
                                    onChange={(e) =>
                                      handleDetailChange(
                                        index,
                                        "interSeance",
                                        e.target.value,
                                      )
                                    }
                                    rows={2}
                                    className="w-full text-sm border border-purple-200 dark:border-purple-900 rounded-md px-2 py-1.5 resize-y bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    placeholder="Notes inter-séance..."
                                    disabled={isFormDisabled}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Table layout for single-insurance / no-insurance cases */
                        <div className="overflow-x-auto border dark:border-slate-600 rounded-lg mt-4">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-slate-700 text-left">
                              <tr>
                                <th className="px-3 py-2 font-medium text-gray-600 dark:text-gray-300">
                                  Soin
                                </th>
                                {isInsurance1Assured ? (
                                  <th className="px-3 py-2 font-medium text-primary-700">
                                    Tarif {insurance} (FCFA)
                                  </th>
                                ) : isInsurance2Assured ? (
                                  <th className="px-3 py-2 font-medium text-emerald-700">
                                    Tarif {insurance2} (FCFA)
                                  </th>
                                ) : (
                                  <th className="px-3 py-2 font-medium text-gray-600 dark:text-gray-300">
                                    Prix (FCFA)
                                  </th>
                                )}
                                <th className="px-3 py-2 font-medium text-primary-700 min-w-[190px]">
                                  Inter-séance
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {interventionDetails.map((item, index) => (
                                <tr
                                  key={index}
                                  className="border-t dark:border-slate-600"
                                >
                                  <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                                    {item.label}
                                  </td>
                                  <td className="px-3 py-1.5">
                                    <PriceInput
                                      value={item.price}
                                      onChange={(v) =>
                                        handleDetailChange(index, "price", v)
                                      }
                                      disabled={isFormDisabled}
                                    />
                                  </td>
                                  <td className="px-3 py-1.5 min-w-[190px]">
                                    <textarea
                                      value={item.interSeance || ""}
                                      onChange={(e) =>
                                        handleDetailChange(
                                          index,
                                          "interSeance",
                                          e.target.value,
                                        )
                                      }
                                      rows={2}
                                      className="w-full text-sm border border-purple-200 dark:border-purple-900 rounded-md px-2 py-1.5 resize-y bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                      placeholder="Notes inter-séance..."
                                      disabled={isFormDisabled}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                  </div>

                  {/* Teeth selector */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm">
                    <TeethSelector
                      selectedTeeth={selectedTeeth}
                      onChange={setSelectedTeeth}
                      disabled={isFormDisabled}
                    />
                  </div>

                  {/* Treatment details */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-white border-b dark:border-slate-600 pb-2 mb-3">
                      Détails du Traitement
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Statut
                        </label>
                        <Select
                          options={statusOptions}
                          value={treatmentStatus}
                          onChange={setTreatmentStatus}
                          styles={customSelectStyles}
                          isDisabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Prescription
                        </label>
                        <textarea
                          rows="3"
                          value={prescription}
                          onChange={(e) => setPrescription(e.target.value)}
                          className="block w-full text-sm border border-gray-300 dark:border-slate-600 rounded-md px-2 py-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Right column — financial summary ── */}
                <div className="lg:col-span-2">
                  <div className="sticky top-6 bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b dark:border-slate-600 pb-2">
                      Résumé Financier
                    </h2>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {bothInsured ? (
                        <>
                          <div className="flex justify-between">
                            <p>Tarif {insurance}:</p>
                            <p className="font-medium">
                              {fmt(ins1TarifBase)} FCFA
                            </p>
                          </div>
                          <div className="flex justify-between text-primary-700">
                            <p>
                              Part {insurance}{" "}
                              <span className="text-xs text-gray-400">
                                ({ins1Pct}%)
                              </span>
                              :
                            </p>
                            <p className="font-medium">
                              − {fmt(ins1Amount)} FCFA
                            </p>
                          </div>
                          <div className="flex justify-between mt-1">
                            <p>Tarif {insurance2}:</p>
                            <p className="font-medium">
                              {fmt(ins2TarifBase)} FCFA
                            </p>
                          </div>
                          <div className="flex justify-between text-emerald-700">
                            <p>
                              Part {insurance2}{" "}
                              <span className="text-xs text-gray-400">
                                ({ins2Pct}%)
                              </span>
                              :
                            </p>
                            <p className="font-medium">
                              − {fmt(ins2Amount)} FCFA
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <p>Montant Total:</p>
                            <p className="font-medium">
                              {fmt(totalAmount)} FCFA
                            </p>
                          </div>
                          {isInsurance1Assured && (
                            <div className="flex justify-between text-primary-700">
                              <p>
                                Part {insurance}{" "}
                                <span className="text-xs text-gray-400">
                                  ({ins1Pct}%)
                                </span>
                                :
                              </p>
                              <p className="font-medium">
                                − {fmt(ins1Amount)} FCFA
                              </p>
                            </div>
                          )}
                          {isInsurance2Assured && (
                            <div className="flex justify-between text-emerald-700">
                              <p>
                                Part {insurance2}{" "}
                                <span className="text-xs text-gray-400">
                                  ({ins2Pct}%)
                                </span>
                                :
                              </p>
                              <p className="font-medium">
                                − {fmt(ins2Amount)} FCFA
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="border-t dark:border-slate-600 pt-3">
                      <div className="flex justify-between items-center text-gray-900 dark:text-white">
                        <label
                          htmlFor="partPatientInput"
                          className="text-base font-bold"
                        >
                          Part Patient:
                        </label>
                        {bothInsured ? (
                          <span className="text-xl font-bold text-green-600">
                            Gratuit
                          </span>
                        ) : (
                          <input
                            id="partPatientInput"
                            type="number"
                            step="any"
                            min="0"
                            value={displayPatientPart}
                            onChange={(e) =>
                              setDisplayPatientPart(
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-32 text-right text-xl font-bold border border-gray-300 dark:border-slate-600 rounded-md shadow-sm h-12 px-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                            disabled={loading}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 dark:bg-slate-800 border-t dark:border-slate-700 flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-rose-500 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            form="treatment-form"
            className="flex-shrink-0 flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-700 rounded-lg shadow-sm hover:bg-primary-800"
            disabled={loading}
          >
            {loading
              ? "Sauvegarde..."
              : isEditMode
                ? "Mettre à Jour"
                : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}
