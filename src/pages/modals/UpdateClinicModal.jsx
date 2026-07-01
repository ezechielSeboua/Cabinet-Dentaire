import React, { useEffect, useRef, useState } from "react";
import { Bounce, toast } from "react-toastify";
import {
  updateClinicSettingsNoId,
  uploadClinicLogo,
  uploadClinicFavicon,
  uploadClinicBackgroundImage,
  uploadClinicQrCode,
} from "../../services/cdiService";
import Stepper from "../clinicInfo/Stepper";
import { IoClose } from "react-icons/io5";
import { MdCloudUpload } from "react-icons/md";

const steps = [
  { id: 1, name: "Informations" },
  { id: 2, name: "Contact" },
  { id: 3, name: "Vision & Mission" },
  { id: 4, name: "Réseaux Sociaux" },
  { id: 5, name: "Médias & Web" },
];

function FileUploadField({ label, currentUrl, file, onFileChange, accept = "image/*" }) {
  const inputRef = useRef(null);
  const preview = file ? URL.createObjectURL(file) : currentUrl;
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {preview && (
        <img
          src={preview}
          alt={label}
          className="h-16 w-auto object-contain rounded border border-gray-200 dark:border-slate-600 mb-2"
        />
      )}
      <div
        className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-dashed border-gray-300 dark:border-slate-500 rounded-md hover:border-primary-500 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <MdCloudUpload size={20} className="text-primary-500" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {file ? file.name : "Choisir un fichier…"}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFileChange(e.target.files[0] || null)}
      />
    </div>
  );
}

export default function UpdateClinicModal({ isOpen, onClose, clinicData, onUpdateSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = steps.length;

  const [data, setData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (clinicData) {
      setData({
        name: clinicData.name || "",
        ownerName: clinicData.ownerName || "",
        address: clinicData.address || "",
        about: clinicData.about || "",
        email: clinicData.email || "",
        telephone: clinicData.telephone || "",
        telephonemobile: clinicData.telephonemobile || "",
        telephonemobile2: clinicData.telephonemobile2 || "",
        vision: clinicData.vision || "",
        mission: clinicData.mission || "",
        faceBook: clinicData.faceBook || "",
        youTube: clinicData.youTube || "",
        linkedIn: clinicData.linkedIn || "",
        twitter: clinicData.twitter || "",
        telegram: clinicData.telegram || "",
        welcomeword: clinicData.welcomeword || "",
        googlelocationurl: clinicData.googlelocationurl || "",
        logo: clinicData.logo || "",
        favicon: clinicData.favicon || "",
        backgroundimage: clinicData.backgroundimage || "",
        qrcode: clinicData.qrcode || "",
      });
      setCurrentStep(1);
      setLogoFile(null);
      setFaviconFile(null);
      setBgFile(null);
      setQrFile(null);
    }
  }, [clinicData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setCurrentStep((p) => Math.min(p + 1, totalSteps));
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      // eslint-disable-next-line no-unused-vars
      const { logo, favicon, backgroundimage, qrcode, ...textData } = data;
      await updateClinicSettingsNoId(textData);

      if (logoFile) await uploadClinicLogo(logoFile);
      if (faviconFile) await uploadClinicFavicon(faviconFile);
      if (bgFile) await uploadClinicBackgroundImage(bgFile);
      if (qrFile) await uploadClinicQrCode(qrFile);

      toast.success("Clinique mise à jour avec succès!", {
        position: "top-center",
        autoClose: 2000,
        theme: "light",
        transition: Bounce,
      });
      onUpdateSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue lors de la mise à jour.");
    } finally {
      setUploading(false);
    }
  };

  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const inputClasses =
    "block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm";
  const textAreaClasses = `${inputClasses} min-h-[80px]`;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b dark:border-slate-600">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Paramètres de la clinique
          </h1>
          <button
            onClick={onClose}
            className="p-2 rounded-full cursor-pointer text-rose-500 hover:bg-rose-500 hover:text-white focus:outline-none"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          <div className="mb-8">
            <Stepper currentStep={currentStep} steps={steps} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Step 1 — Informations */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 gap-y-6">
                  <div>
                    <label htmlFor="name" className={labelClasses}>Nom de la clinique</label>
                    <input type="text" name="name" id="name" value={data.name || ""} onChange={handleChange} className={inputClasses} placeholder="Nom de la clinique" />
                  </div>
                  <div>
                    <label htmlFor="ownerName" className={labelClasses}>Nom du responsable</label>
                    <input type="text" name="ownerName" id="ownerName" value={data.ownerName || ""} onChange={handleChange} className={inputClasses} placeholder="Dr. Prénom Nom" />
                  </div>
                  <div>
                    <label htmlFor="address" className={labelClasses}>Adresse</label>
                    <textarea name="address" id="address" value={data.address || ""} onChange={handleChange} className={textAreaClasses} placeholder="Votre adresse complète" />
                  </div>
                  <div>
                    <label htmlFor="about" className={labelClasses}>À propos de nous</label>
                    <textarea name="about" id="about" value={data.about || ""} onChange={handleChange} className={textAreaClasses} placeholder="Décrivez brièvement votre clinique" />
                  </div>
                </div>
              )}

              {/* Step 2 — Contact */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="email" className={labelClasses}>Adresse Email</label>
                    <input type="email" name="email" id="email" value={data.email || ""} onChange={handleChange} className={inputClasses} placeholder="contact@exemple.com" />
                  </div>
                  <div>
                    <label htmlFor="telephone" className={labelClasses}>N° Téléphone Fixe</label>
                    <input type="text" name="telephone" id="telephone" value={data.telephone || ""} onChange={handleChange} className={inputClasses} placeholder="+225 XX XX XX XX" />
                  </div>
                  <div>
                    <label htmlFor="telephonemobile" className={labelClasses}>N° Téléphone Mobile 1</label>
                    <input type="text" name="telephonemobile" id="telephonemobile" value={data.telephonemobile || ""} onChange={handleChange} className={inputClasses} placeholder="+225 XX XX XX XX" required />
                  </div>
                  <div>
                    <label htmlFor="telephonemobile2" className={labelClasses}>N° Téléphone Mobile 2</label>
                    <input type="text" name="telephonemobile2" id="telephonemobile2" value={data.telephonemobile2 || ""} onChange={handleChange} className={inputClasses} placeholder="+225 XX XX XX XX" />
                  </div>
                </div>
              )}

              {/* Step 3 — Vision & Mission */}
              {currentStep === 3 && (
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="vision" className={labelClasses}>Vision</label>
                    <textarea name="vision" id="vision" value={data.vision || ""} onChange={handleChange} className={textAreaClasses} placeholder="Votre vision" />
                  </div>
                  <div>
                    <label htmlFor="mission" className={labelClasses}>Mission</label>
                    <textarea name="mission" id="mission" value={data.mission || ""} onChange={handleChange} className={textAreaClasses} placeholder="Votre mission" />
                  </div>
                </div>
              )}

              {/* Step 4 — Réseaux Sociaux */}
              {currentStep === 4 && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label htmlFor="faceBook" className={labelClasses}>Lien Facebook</label>
                    <input type="url" name="faceBook" id="faceBook" value={data.faceBook || ""} onChange={handleChange} className={inputClasses} placeholder="https://facebook.com/..." />
                  </div>
                  <div>
                    <label htmlFor="youTube" className={labelClasses}>Lien YouTube</label>
                    <input type="url" name="youTube" id="youTube" value={data.youTube || ""} onChange={handleChange} className={inputClasses} placeholder="https://youtube.com/..." />
                  </div>
                  <div>
                    <label htmlFor="linkedIn" className={labelClasses}>Lien LinkedIn</label>
                    <input type="url" name="linkedIn" id="linkedIn" value={data.linkedIn || ""} onChange={handleChange} className={inputClasses} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label htmlFor="twitter" className={labelClasses}>Lien Twitter</label>
                    <input type="url" name="twitter" id="twitter" value={data.twitter || ""} onChange={handleChange} className={inputClasses} placeholder="https://twitter.com/..." />
                  </div>
                  <div>
                    <label htmlFor="telegram" className={labelClasses}>Lien Telegram</label>
                    <input type="url" name="telegram" id="telegram" value={data.telegram || ""} onChange={handleChange} className={inputClasses} placeholder="https://t.me/..." />
                  </div>
                </div>
              )}

              {/* Step 5 — Médias & Web */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="welcomeword" className={labelClasses}>Message de bienvenue</label>
                    <textarea name="welcomeword" id="welcomeword" value={data.welcomeword || ""} onChange={handleChange} className={textAreaClasses} placeholder="Bienvenue dans notre clinique..." />
                  </div>
                  <div>
                    <label htmlFor="googlelocationurl" className={labelClasses}>Lien Google Maps</label>
                    <input type="url" name="googlelocationurl" id="googlelocationurl" value={data.googlelocationurl || ""} onChange={handleChange} className={inputClasses} placeholder="https://maps.google.com/..." />
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-2 border-t border-gray-200 dark:border-slate-600">
                    <FileUploadField label="Logo" currentUrl={data.logo} file={logoFile} onFileChange={setLogoFile} />
                    <FileUploadField label="Favicon" currentUrl={data.favicon} file={faviconFile} onFileChange={setFaviconFile} accept="image/*,.ico" />
                    <FileUploadField label="Image de fond" currentUrl={data.backgroundimage} file={bgFile} onFileChange={setBgFile} />
                    <FileUploadField label="QR Code" currentUrl={data.qrcode} file={qrFile} onFileChange={setQrFile} />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t dark:border-slate-600 flex justify-between items-center bg-gray-50 dark:bg-slate-700 rounded-b-lg">
          <button
            type="button"
            onClick={prevStep}
            className={`inline-flex justify-center cursor-pointer rounded-md border border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              currentStep === 1 ? "invisible" : ""
            }`}
          >
            Précédent
          </button>

          <div>
            {currentStep < totalSteps && (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex justify-center cursor-pointer rounded-md border border-transparent bg-primary-700 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Suivant
              </button>
            )}
            {currentStep === totalSteps && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={uploading}
                className="inline-flex justify-center cursor-pointer rounded-md border border-transparent bg-primary-700 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {uploading ? "Enregistrement…" : "Sauvegarder"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
