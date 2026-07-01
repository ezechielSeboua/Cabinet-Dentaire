import React, { useRef, useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import { toast, Bounce } from "react-toastify";
import { updatePatientPhoto } from "../../services/cdiService";

import defaultPatientImage from "../../assets/default-patitent.png";

export default function ImageUploadModal({
  isOpen,
  onClose,
  onSuccess,
  patient,
  existingImageUrl,
}) {
  const [processedFile, setProcessedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const hiddenFileInput = useRef(null);

  // Ensure a safe initial image
  const safeInitialUrl =
    typeof existingImageUrl === "string" && existingImageUrl.trim() !== ""
      ? existingImageUrl
      : defaultPatientImage;

  const [displayImageSrc, setDisplayImageSrc] = useState(safeInitialUrl);

  // Sync changes to image
  useEffect(() => {
    if (processedFile) {
      const objectUrl = URL.createObjectURL(processedFile);
      setDisplayImageSrc(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    const newSafeUrl =
      typeof existingImageUrl === "string" && existingImageUrl.trim() !== ""
        ? existingImageUrl
        : defaultPatientImage;

    setDisplayImageSrc(newSafeUrl);
  }, [existingImageUrl, processedFile]);

  const handleClose = () => {
    setProcessedFile(null);
    onClose();
  };

  const handleImageClick = () => {
    if (!isUploading) {
      hiddenFileInput.current.click();
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imgname = file.name;
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = Math.max(img.width, img.height);
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(
          img,
          (maxSize - img.width) / 2,
          (maxSize - img.height) / 2
        );
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const finalFile = new File([blob], imgname, {
                type: "image/png",
                lastModified: Date.now(),
              });
              setProcessedFile(finalFile);
            }
          },
          "image/jpeg",
          0.8
        );
      };
    };
  };

  const handleUpload = async () => {
    if (!processedFile) {
      toast.warn("Veuillez sélectionner une image.");
      return;
    }
    if (!patient || !patient.patientno) {
      toast.error("Erreur: Les informations du patient sont manquantes.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", processedFile, processedFile.name);
    formData.append("patientno", patient.patientno);

    try {
      await updatePatientPhoto(formData);
      toast.success("La photo du patient a été mise à jour !", {
        position: "top-center",
        autoClose: 1000,
        theme: "light",
        transition: Bounce,
      });
      onSuccess();
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Une erreur s'est produite lors du téléversement!", {
        position: "top-center",
        autoClose: 1500,
        theme: "dark",
        transition: Bounce,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen || !patient) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-70"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg transform rounded-2xl bg-white dark:bg-slate-800 shadow-2xl transition-all m-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-600">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Changer la Photo du Patient
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 dark:hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Cliquer sur l'image pour changer la photo de
          </p>
          <p className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">
            {`${patient.firstname} ${patient.lastname}`}
          </p>

          <div
            onClick={handleImageClick}
            className="w-48 h-48 mx-auto border-2 border-dashed border-gray-300 dark:border-slate-500 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-700 overflow-hidden cursor-pointer hover:border-primary-500 transition-colors"
            title="Cliquez pour changer l'image"
          >
            <img
              src={displayImageSrc || defaultPatientImage}
              alt="Aperçu du patient"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultPatientImage;
              }}
            />
          </div>

          <input
            type="file"
            ref={hiddenFileInput}
            onChange={handleImageChange}
            style={{ display: "none" }}
            accept="image/png, image/jpeg, image/gif"
          />

          {processedFile && (
            <p className="text-sm text-gray-500 mt-3">{processedFile.name}</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-b-2xl">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-sm cursor-pointer font-medium text-rose-500 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-500"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || !processedFile}
            className="inline-flex items-center cursor-pointer justify-center w-40 px-5 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed"
          >
            {isUploading && (
              <CgSpinner className="animate-spin mr-2" size={20} />
            )}
            <span>{isUploading ? "Mise à jour..." : "Mettre à jour"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
