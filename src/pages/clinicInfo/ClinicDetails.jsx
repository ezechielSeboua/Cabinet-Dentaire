import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as cdiService from "../../services/cdiService";
import {
  updateClinicSettingsNoId,
  uploadClinicLogo,
  uploadClinicFavicon,
  uploadClinicBackgroundImage,
  uploadClinicQrCode,
} from "../../services/cdiService";
import { normalizeFileUrl } from "../../utils/config";
import EmptyState from "../../components/ui/EmptyState";
import InfoRow from "../../components/ui/InfoRow";

import {
  CiEdit,
  CiMail,
  CiPhone,
  CiLocationOn,
  CiUser,
  CiImageOn,
} from "react-icons/ci";
import {
  BsGlobe2,
  BsFacebook,
  BsYoutube,
  BsLinkedin,
  BsTwitterX,
  BsTelegram,
} from "react-icons/bs";
import {
  MdChatBubbleOutline,
  MdQrCode2,
  MdOutlineVisibility,
  MdOutlineFlag,
  MdCloudUpload,
  MdClose,
  MdCheck,
} from "react-icons/md";

// ── Helpers ──────────────────────────────────────────────────────────────────

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500" />
  </div>
);

function SectionTitle({ icon, label }) {
  return (
    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
      {icon} {label}
    </h3>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function FileUploadField({ label, currentUrl, file, onFileChange, accept = "image/*" }) {
  const inputRef = useRef(null);
  const preview = file
    ? URL.createObjectURL(file)
    : currentUrl
    ? normalizeFileUrl(currentUrl)
    : null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      {preview && (
        <img
          src={preview}
          alt={label}
          className="h-16 w-auto object-contain rounded border border-gray-200 dark:border-slate-600 p-1 bg-white"
        />
      )}
      <div
        className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-dashed border-gray-300 dark:border-slate-500 rounded-md hover:border-primary-500 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <MdCloudUpload size={18} className="text-primary-500 flex-shrink-0" />
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
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

// ── CSS class constants ───────────────────────────────────────────────────────

const INP =
  "block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-colors";
const TA = `${INP} min-h-[80px] resize-y`;
const SECTION = "border-t border-gray-200 dark:border-slate-700 pt-6";

// ── Main component ────────────────────────────────────────────────────────────

export default function ClinicDetails() {
  const [clinicData, setClinicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchClinicSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cdiService.clinicInfo();
      setClinicData(res.data || null);
    } catch (error) {
      console.error("Failed to fetch clinic info:", error);
      setClinicData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClinicSettings();
  }, [fetchClinicSettings]);

  const enterEditMode = () => {
    if (!clinicData) return;
    setForm({
      name: clinicData.name || "",
      ownerName: clinicData.ownerName || "",
      address: clinicData.address || "",
      about: clinicData.about || "",
      welcomeword: clinicData.welcomeword || "",
      googlelocationurl: clinicData.googlelocationurl || "",
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
      logo: clinicData.logo || "",
      favicon: clinicData.favicon || "",
      backgroundimage: clinicData.backgroundimage || "",
      qrcode: clinicData.qrcode || "",
    });
    setLogoFile(null);
    setFaviconFile(null);
    setBgFile(null);
    setQrFile(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setLogoFile(null);
    setFaviconFile(null);
    setBgFile(null);
    setQrFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // eslint-disable-next-line no-unused-vars
      const { logo, favicon, backgroundimage, qrcode, ...textData } = form;
      await updateClinicSettingsNoId(textData);
      if (logoFile) await uploadClinicLogo(logoFile);
      if (faviconFile) await uploadClinicFavicon(faviconFile);
      if (bgFile) await uploadClinicBackgroundImage(bgFile);
      if (qrFile) await uploadClinicQrCode(qrFile);
      toast.success("Clinique mise à jour avec succès !", {
        position: "top-center",
        autoClose: 2000,
      });
      setIsEditing(false);
      await fetchClinicSettings();
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!clinicData)
    return (
      <EmptyState
        title="Aucune information sur la clinique"
        message="Veuillez ajouter les détails de la clinique pour les afficher sur cette page."
        buttonText="Ajouter les Informations"
        buttonLink="/clinic/add"
      />
    );

  return (
    <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden">
      {/* ── Page header ── */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {isEditing ? form.name || clinicData.name : clinicData.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isEditing
              ? "Mode édition — modifiez les champs puis sauvegardez."
              : "Détails et informations de contact de la clinique."}
          </p>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-slate-500 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                <MdClose size={16} />
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-700 rounded-lg hover:bg-primary-800 disabled:opacity-60 transition-colors cursor-pointer"
              >
                <MdCheck size={16} />
                {saving ? "Enregistrement…" : "Sauvegarder"}
              </button>
            </>
          ) : (
            <button
              onClick={enterEditMode}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-700 rounded-lg hover:bg-primary-800 transition-colors cursor-pointer"
            >
              <CiEdit size={18} />
              Modifier
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-6 space-y-8">

        {/* ── Section : Informations générales ── */}
        {isEditing ? (
          <div>
            <SectionTitle icon={<CiUser size={16} />} label="Informations générales" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Nom de la clinique">
                <input type="text" name="name" value={form.name} onChange={handleChange} className={INP} placeholder="Nom de la clinique" />
              </Field>
              <Field label="Nom du responsable">
                <input type="text" name="ownerName" value={form.ownerName} onChange={handleChange} className={INP} placeholder="Dr. Prénom Nom" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Adresse">
                  <textarea name="address" value={form.address} onChange={handleChange} className={TA} placeholder="Adresse complète" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="À propos de nous">
                  <textarea name="about" value={form.about} onChange={handleChange} className={TA} placeholder="Décrivez votre clinique" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Message de bienvenue">
                  <textarea name="welcomeword" value={form.welcomeword} onChange={handleChange} className={TA} placeholder="Message affiché sur le site public" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Lien Google Maps">
                  <input type="url" name="googlelocationurl" value={form.googlelocationurl} onChange={handleChange} className={INP} placeholder="https://maps.google.com/..." />
                </Field>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              <InfoRow icon={<CiUser size={20} />} label="Nom de la clinique" value={clinicData.name} />
              {clinicData.ownerName && <InfoRow icon={<CiUser size={20} />} label="Responsable" value={clinicData.ownerName} />}
              <InfoRow icon={<CiLocationOn size={20} />} label="Adresse" value={clinicData.address} />
              <InfoRow icon={<BsGlobe2 size={20} />} label="À propos de nous" value={clinicData.about} />
              {clinicData.welcomeword && <InfoRow icon={<MdChatBubbleOutline size={20} />} label="Message de bienvenue" value={clinicData.welcomeword} />}
              {clinicData.googlelocationurl && (
                <div className="py-3 flex items-start gap-3">
                  <CiLocationOn size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Google Maps</p>
                    <a href={clinicData.googlelocationurl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline break-all">
                      Voir sur la carte
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              <InfoRow icon={<CiMail size={20} />} label="Email" value={clinicData.email} />
              <InfoRow icon={<CiPhone size={20} />} label="Téléphone Fixe" value={clinicData.telephone} />
              <InfoRow icon={<CiPhone size={20} />} label="Téléphone Mobile 1" value={clinicData.telephonemobile} />
              <InfoRow icon={<CiPhone size={20} />} label="Téléphone Mobile 2" value={clinicData.telephonemobile2} />
            </div>
          </div>
        )}

        {/* ── Section : Contact (edit only) ── */}
        {isEditing && (
          <div className={SECTION}>
            <SectionTitle icon={<CiMail size={16} />} label="Contact" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Email">
                <input type="email" name="email" value={form.email} onChange={handleChange} className={INP} placeholder="contact@clinique.fr" />
              </Field>
              <Field label="Téléphone Fixe">
                <input type="text" name="telephone" value={form.telephone} onChange={handleChange} className={INP} placeholder="+225 XX XX XX XX" />
              </Field>
              <Field label="Téléphone Mobile 1">
                <input type="text" name="telephonemobile" value={form.telephonemobile} onChange={handleChange} className={INP} placeholder="+225 XX XX XX XX" />
              </Field>
              <Field label="Téléphone Mobile 2">
                <input type="text" name="telephonemobile2" value={form.telephonemobile2} onChange={handleChange} className={INP} placeholder="+225 XX XX XX XX" />
              </Field>
            </div>
          </div>
        )}

        {/* ── Section : Vision & Mission ── */}
        {(clinicData.vision || clinicData.mission || isEditing) && (
          <div className={SECTION}>
            <SectionTitle icon={<MdOutlineVisibility size={18} />} label="Vision & Mission" />
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Vision">
                  <textarea name="vision" value={form.vision} onChange={handleChange} className={TA} placeholder="Votre vision" />
                </Field>
                <Field label="Mission">
                  <textarea name="mission" value={form.mission} onChange={handleChange} className={TA} placeholder="Votre mission" />
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clinicData.vision && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <MdOutlineVisibility size={14} /> Vision
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">{clinicData.vision}</p>
                  </div>
                )}
                {clinicData.mission && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                      <MdOutlineFlag size={14} /> Mission
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">{clinicData.mission}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Section : Réseaux Sociaux ── */}
        {(isEditing || clinicData.faceBook || clinicData.youTube || clinicData.linkedIn || clinicData.twitter || clinicData.telegram) && (
          <div className={SECTION}>
            <SectionTitle icon={<BsGlobe2 size={16} />} label="Réseaux Sociaux" />
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Facebook">
                  <input type="url" name="faceBook" value={form.faceBook} onChange={handleChange} className={INP} placeholder="https://facebook.com/..." />
                </Field>
                <Field label="YouTube">
                  <input type="url" name="youTube" value={form.youTube} onChange={handleChange} className={INP} placeholder="https://youtube.com/..." />
                </Field>
                <Field label="LinkedIn">
                  <input type="url" name="linkedIn" value={form.linkedIn} onChange={handleChange} className={INP} placeholder="https://linkedin.com/..." />
                </Field>
                <Field label="Twitter / X">
                  <input type="url" name="twitter" value={form.twitter} onChange={handleChange} className={INP} placeholder="https://twitter.com/..." />
                </Field>
                <Field label="Telegram">
                  <input type="url" name="telegram" value={form.telegram} onChange={handleChange} className={INP} placeholder="https://t.me/..." />
                </Field>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {clinicData.faceBook && <a href={clinicData.faceBook} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"><BsFacebook size={16} className="text-blue-600" /> Facebook</a>}
                {clinicData.youTube && <a href={clinicData.youTube} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-300 hover:border-red-500 hover:text-red-600 transition-colors"><BsYoutube size={16} className="text-red-600" /> YouTube</a>}
                {clinicData.linkedIn && <a href={clinicData.linkedIn} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-300 hover:border-blue-700 hover:text-blue-700 transition-colors"><BsLinkedin size={16} className="text-blue-700" /> LinkedIn</a>}
                {clinicData.twitter && <a href={clinicData.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-gray-100 transition-colors"><BsTwitterX size={16} /> Twitter / X</a>}
                {clinicData.telegram && <a href={clinicData.telegram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm text-gray-700 dark:text-gray-300 hover:border-sky-500 hover:text-sky-500 transition-colors"><BsTelegram size={16} className="text-sky-500" /> Telegram</a>}
              </div>
            )}
          </div>
        )}

        {/* ── Section : Médias ── */}
        {(isEditing || clinicData.logo || clinicData.favicon || clinicData.backgroundimage || clinicData.qrcode) && (
          <div className={SECTION}>
            <SectionTitle icon={<CiImageOn size={18} />} label="Médias" />
            {isEditing ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <FileUploadField label="Logo" currentUrl={form.logo} file={logoFile} onFileChange={setLogoFile} />
                <FileUploadField label="Favicon" currentUrl={form.favicon} file={faviconFile} onFileChange={setFaviconFile} accept="image/*,.ico" />
                <FileUploadField label="Image de fond" currentUrl={form.backgroundimage} file={bgFile} onFileChange={setBgFile} />
                <FileUploadField label="QR Code" currentUrl={form.qrcode} file={qrFile} onFileChange={setQrFile} />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {clinicData.logo && (
                  <div className="flex flex-col items-center gap-1">
                    <img src={normalizeFileUrl(clinicData.logo)} alt="Logo" className="h-16 w-auto object-contain rounded border border-gray-200 dark:border-slate-600 p-1 bg-white" />
                    <span className="text-xs text-gray-500">Logo de la clinique</span>
                  </div>
                )}
                {clinicData.favicon && (
                  <div className="flex flex-col items-center gap-1">
                    <img src={normalizeFileUrl(clinicData.favicon)} alt="Favicon" className="h-16 w-auto object-contain rounded border border-gray-200 dark:border-slate-600 p-1 bg-white" />
                    <span className="text-xs text-gray-500">Icon de la clinique</span>
                  </div>
                )}
                {clinicData.backgroundimage && (
                  <div className="flex flex-col items-center gap-1">
                    <img src={normalizeFileUrl(clinicData.backgroundimage)} alt="Image de fond" className="h-16 w-auto object-cover rounded border border-gray-200 dark:border-slate-600" />
                    <span className="text-xs text-gray-500">Image de fond de la clinique</span>
                  </div>
                )}
                {clinicData.qrcode && (
                  <div className="flex flex-col items-center gap-1">
                    <img src={normalizeFileUrl(clinicData.qrcode)} alt="QR Code" className="h-16 w-16 object-contain rounded border border-gray-200 dark:border-slate-600 p-1 bg-white" />
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <MdQrCode2 size={12} /> QR Code de la clinique
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Barre de sauvegarde bas de page (mode édition) ── */}
        {isEditing && (
          <div className="border-t border-gray-200 dark:border-slate-700 pt-4 flex justify-end gap-3">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-slate-500 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-primary-700 rounded-lg hover:bg-primary-800 disabled:opacity-60 transition-colors cursor-pointer"
            >
              <MdCheck size={16} />
              {saving ? "Enregistrement…" : "Sauvegarder"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
