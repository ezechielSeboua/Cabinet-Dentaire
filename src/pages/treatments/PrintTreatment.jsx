import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { TreatmentPDF } from "./TreatmentPDF"; // For A4 printing
import * as cdiService from "../../services/cdiService";
import { normalizeFileUrl } from "../../utils/config";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";
import { IoArrowBack, IoPrintOutline } from "react-icons/io5";
import logo1 from "../../assets/logo1.jpg";
import cachet from "../../assets/cachet.jpg";
import "../../print-styles.css"; // Import the print-specific styles

const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="w-16 h-16 border-4 border-primary-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

export default function PrintTreatment() {
  const sidebarMargin = useSidebarMargin();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const autoPrint = searchParams.get("autoprint") === "1";
  const [treatment, setTreatment] = useState(null);
  const [clinicInfo, setClinicInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [t, c] = await Promise.all([
          cdiService.listSignleTreatment(id),
          cdiService.clinicPublic(),
        ]);
        setTreatment(t.data);
        setClinicInfo(c.data);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const canPrint = !isLoading && !!treatment && !!clinicInfo;

  useEffect(() => {
    if (canPrint && autoPrint) {
      window.print();
    }
  }, [canPrint, autoPrint]);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    const doc = <TreatmentPDF treatment={treatment} clinicInfo={clinicInfo} />;
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${treatment.patientname.replace(/\s/g, "_")}-${
      treatment.patientno
    }.pdf`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setIsGenerating(false);
  };

  const handlePosPrint = () => {
    window.print();
  };

  const formatInterventions = (interventions) => {
    if (Array.isArray(interventions)) {
      return interventions.join(", ");
    }
    return interventions;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <SideBar2 />
      <div className="h-14 bg-white shadow-md fixed w-full z-10 top-0 left-0">
        <Header />
      </div>
      <div className={`h-full ml-0 ${sidebarMargin} mt-14 p-4 md:p-8`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center no-print">
            <Link
              to="/treatment"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 transition-all duration-150"
            >
              <IoArrowBack size={16} />
              Retour
            </Link>
            <div className="flex gap-4">
              {canPrint ? (
                <>
                  <button
                    onClick={handlePosPrint}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md"
                  >
                    <IoPrintOutline size={20} />
                    Reçu POS (Pour petite imprimante)
                  </button>
                  <button
                    onClick={handleGeneratePdf}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-md disabled:bg-gray-400"
                  >
                    <IoPrintOutline size={20} />
                    {isGenerating ? "..." : "télécharger PDF A4 (Pour imprimante classique)"}
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-md"
                >
                  <IoPrintOutline size={20} />
                  Chargement...
                </button>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="no-print">
              <Spinner />
            </div>
          )}
          {!isLoading && !canPrint && (
            <div className="text-center text-red-500 no-print">
              Impossible de charger les détails.
            </div>
          )}

          {canPrint && (
            <div
              id="printable-area"
              className="mt-8 p-6 bg-white border rounded-lg shadow-sm"
            >
              <div>
                <div className="text-center">
                  <img src={clinicInfo.logo ? normalizeFileUrl(clinicInfo.logo) : logo1} alt="Logo" className="receipt-logo" />
                  <h3>{clinicInfo.name}</h3>
                  <p>{clinicInfo.address}</p>
                  <p>Tel: {clinicInfo.telephonemobile}</p>
                </div>
                <div className="dashed-line"></div>
                <p>
                  Date:{" "}
                  {new Date(treatment.registeredOn).toLocaleDateString("fr-FR")}
                </p>
                <p>Ticket N°: {treatment.id}</p>
                <p>Patient: {treatment.patientname}</p>
                <p>N° Patient: {treatment.patientno}</p>
                <p>Docteur: {treatment.doctorname}</p>
                <div className="dashed-line"></div>
                <p>
                  <b>Interventions:</b>{" "}
                  {formatInterventions(treatment.interventions)}
                </p>
                <p>
                  <b>Prescription:</b> {treatment.prescription || "Aucune"}
                </p>
                {Array.isArray(treatment.teeth) && treatment.teeth.length > 0 && (
                  <p>
                    <b>Dents traitées:</b>{" "}
                    {[...treatment.teeth]
                      .sort((a, b) => Number(a) - Number(b))
                      .join(", ")}
                  </p>
                )}
                <div className="dashed-line"></div>
                <h3 className="text-center">Résumé</h3>

                {/* --- DYNAMIC INSURANCE NAMES --- */}
                {treatment.insurance && (
                  <div className="kv-row">
                    <span>{treatment.insurance}:</span>
                    <span>{treatment.partinsurance || 0} CFA</span>
                  </div>
                )}
                {treatment.insurance2 && (
                  <div className="kv-row">
                    <span>{treatment.insurance2}:</span>
                    <span>{treatment.partinsurance2 || 0} CFA</span>
                  </div>
                )}

                <div className="kv-row">
                  <b>Part Patient:</b>
                  <b>{treatment.partpatient} CFA</b>
                </div>
                <div className="dashed-line"></div>
                <div className="text-center">
                  <img src={cachet} alt="Cachet" className="receipt-cachet" />
                  <p>Merci de votre confiance.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
