import  { useState, useEffect, useCallback } from "react";
import { IoClose, IoCameraOutline } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import { toast } from "react-toastify";
import { ListSignlepatient } from "../../services/cdiService";
import ImageUploadModal from "./ImageUploadModal";
import defaultPatientImage from "../../assets/default-patitent.png";

// Helper component for displaying fields
const DetailField = ({ label, value, isDate = false }) => {
  let displayValue = value || (
    <span className="text-gray-400 dark:text-slate-500 italic">Non renseigné</span>
  );

  if (isDate && value) {
    try {
      const parts = value.split("-");
      displayValue = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch (e) {
      console.error("Date formatting error:", e);
      displayValue = value;
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-md text-gray-800 dark:text-gray-100">{displayValue}</p>
    </div>
  );
};

export default function PatientDetailModal({
  isOpen,
  onClose,
  patientId,
  onUpdate,
}) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageHasError, setImageHasError] = useState(false);

  const fetchPatientData = useCallback(async () => {
    if (!patientId || !isOpen) return;

    try {
      setLoading(true);
      // Reset image state for each new request
      setImageHasError(false);
      setImageUrl(null);

      const response = await ListSignlepatient(patientId);
      const patientData = response.data;
      setPatient(patientData);

      // Takes the relative path directly from your corrected backend.
      const relativePath = patientData.photoUrl;
      console.log("Using relative path from server for image:", relativePath);
      setImageUrl(relativePath);
    } catch (error) {
      // <--- THIS LINE IS NOW CORRECTED
      console.error("Failed to fetch patient data:", error);
      toast.error("Impossible de charger les informations du patient.");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [patientId, isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchPatientData();
    }
  }, [isOpen, fetchPatientData]);

  const handleImageUpdateSuccess = () => {
    setIsImageModalOpen(false);
    toast.success("Photo mise à jour !");
    fetchPatientData(); // Refetch all data to get the new image URL
    if (onUpdate) onUpdate();
  };

  const handleImageError = () => {
    if (!imageHasError) {
      console.warn(
        `Failed to load image from proxied path: ${imageUrl}. Falling back to default.`
      );
      setImageHasError(true);
    }
  };

  if (!isOpen) {
    return null;
  }

  const imageSrc = imageHasError || !imageUrl ? defaultPatientImage : imageUrl;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-70">
        <div className="relative w-full max-w-4xl transform rounded-2xl bg-white dark:bg-slate-800 shadow-2xl m-4 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-slate-600">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Détails du patient
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 dark:hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <CgSpinner className="animate-spin text-primary-600" size={50} />
              </div>
            ) : patient ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 flex flex-col items-center">
                  <div
                    className="relative group w-48 h-48 rounded-full shadow-lg cursor-pointer overflow-hidden bg-gray-200"
                    onClick={() => setIsImageModalOpen(true)}
                    title="Cliquez pour changer la photo"
                    aria-label="Photo du patient"
                  >
                    {/* The Image Tag - No changes here */}
                    <img
                      key={imageUrl || patientId}
                      src={imageSrc}
                      alt={`${patient.firstname} ${patient.lastname}`}
                      className="w-full h-full object-cover rounded-full"
                      onError={handleImageError}
                    />

                    {/* The Overlay - CORRECTED VERSION */}
                    <div
                      className="
                        absolute inset-0 rounded-full  /* Positioning */
                        flex items-center justify-center /* Centering the icon */
                        bg-black opacity-0               /* Hidden by default */
                        group-hover:opacity-50           /* Becomes semi-transparent on hover */
                        transition-opacity duration-300  /* Smooth transition */
                        "
                    >
                      <IoCameraOutline size={40} className="text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-center mt-4">{`${patient.firstname} ${patient.lastname}`}</h2>

                  <p className="text-gray-500">{patient.patientno}</p>
                </div>
                {/* IGNORE_WHEN_COPYING_START */}
                {/* Right Column: Details */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-slate-600 pb-3 mb-4">
                    Informations Personnelles
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                    <DetailField label="Prénom" value={patient.firstname} />
                    <DetailField
                      label="Nom de famille"
                      value={patient.lastname}
                    />
                    <DetailField
                      label="Date de Naissance"
                      value={patient.dob}
                      isDate
                    />
                    <DetailField label="Genre" value={patient.gender} />
                    <DetailField label="Téléphone" value={patient.telephone} />
                    <DetailField label="Email" value={patient.email} />
                    <DetailField
                      label="Profession"
                      value={patient.profession}
                    />
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-slate-600 pb-3 my-4 mt-8">
                    Informations d'Assurance
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-200">
                        Assurance Principale
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
                        <DetailField
                          label="Assurance"
                          value={patient.insurance}
                        />
                        <DetailField
                          label="Matricule"
                          value={patient.insurance_matricule}
                        />
                        <DetailField
                          label="Couverture"
                          value={
                            patient.insurance_pourcentage
                              ? `${patient.insurance_pourcentage}%`
                              : null
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-200">
                        Assurance Secondaire
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
                        <DetailField
                          label="Assurance"
                          value={patient.insurance2}
                        />
                        <DetailField
                          label="Matricule"
                          value={patient.insurance2_matricule}
                        />
                        <DetailField
                          label="Couverture"
                          value={
                            patient.insurance2_pourcentage
                              ? `${patient.insurance2_pourcentage}%`
                              : null
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center h-96 flex flex-col justify-center">
                <p className="text-red-500">
                  Impossible de charger les données du patient.
                </p>
                <button
                  onClick={fetchPatientData}
                  className="mt-4 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSuccess={handleImageUpdateSuccess}
        patient={patient}
        existingImageUrl={imageUrl} // <-- ADD THIS LINE
      />
    </>
  );
}
