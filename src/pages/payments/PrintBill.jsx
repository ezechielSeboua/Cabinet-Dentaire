import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { IoArrowBack, IoPrintOutline } from "react-icons/io5";
import { billDetails, clinicInfo, listSignleTreatment } from "../../services/cdiService";
import { normalizeFileUrl } from "../../utils/config";
import Header from "../../components/Header";
import SideBar2 from "../../components/SideBar2";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";
import logo1 from "../../assets/logo1.jpg";
import cachet from "../../assets/cachet.jpg";
import qrCode from "../../assets/cabinetdentaireivoire.png";
import "../../print-styles.css";

const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="w-16 h-16 border-4 border-primary-500 border-dashed rounded-full animate-spin"></div>
  </div>
);

const fmt = (n) => (n || 0).toLocaleString("fr-FR");

const NON_ASSURED = ["NA", "NON ASSURE", "NON ASSURÉ", "UNDEFINED", ""];
const hasInsurance = (name) =>
  !!name && !NON_ASSURED.includes(name.trim().toUpperCase());

export default function PrintBill() {
  const sidebarMargin = useSidebarMargin();
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [teeth, setTeeth] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, cRes] = await Promise.all([billDetails(id), clinicInfo()]);
        const billData = bRes.data;
        setBill(billData);
        setClinic(cRes.data);
        if (billData.treatment) {
          const tRes = await listSignleTreatment(billData.treatment);
          const t = tRes.data?.teeth;
          if (Array.isArray(t) && t.length > 0) setTeeth(t);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const canPrint = !isLoading && !!bill && !!clinic;
  const remainder = canPrint
    ? parseFloat(bill.partpatient) - parseFloat(bill.amountpaid)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <SideBar2 />
      <div className="h-14 bg-white shadow-md fixed w-full z-10 top-0 left-0">
        <Header />
      </div>
      <div className={`h-full ml-0 ${sidebarMargin} mt-14 p-4 md:p-8`}>
        <div className="max-w-sm mx-auto">
          {/* action bar */}
          <div className="mb-6 flex justify-between items-center no-print">
            <Link
              to="/bill"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300 transition-all duration-150"
            >
              <IoArrowBack size={16} />
              Retour
            </Link>
            {canPrint ? (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-md hover:bg-primary-800"
              >
                <IoPrintOutline size={20} />
                Imprimer ticket
              </button>
            ) : (
              <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-md">
                <IoPrintOutline size={20} />
                Chargement...
              </button>
            )}
          </div>

          {isLoading && (
            <div className="no-print">
              <Spinner />
            </div>
          )}
          {!isLoading && !canPrint && (
            <p className="text-center text-red-500 no-print">
              Impossible de charger les détails de la facture.
            </p>
          )}

          {canPrint && (
            <div id="printable-area" className="mt-4 p-4 bg-white border rounded-lg shadow-sm text-sm">
              {/* header */}
              <div className="text-center">
                <img src={clinic.logo ? normalizeFileUrl(clinic.logo) : logo1} alt="Logo" className="receipt-logo" />
                <h3 className="font-bold text-base mt-1">{clinic.name}</h3>
                <p>{clinic.address}</p>
                <p>Tel: {clinic.telephonemobile}</p>
              </div>

              <div className="dashed-line" />

              <p>Date: {new Date(bill.registeredOn).toLocaleDateString("fr-FR")}</p>
              <p>Facture N°: {bill.id}</p>
              <p>Patient: {bill.patientname}</p>
              <p>N° Patient: {bill.patientno}</p>

              {teeth.length > 0 && (
                <p>
                  <b>Dents traitées:</b>{" "}
                  {[...teeth].sort((a, b) => Number(a) - Number(b)).join(", ")}
                </p>
              )}

              <div className="dashed-line" />

              <h3 className="text-center font-bold">Résumé</h3>

              <p className="font-bold mt-1">Coût total traitement:</p>
              {/* <div className="kv-row">
                <span>Montant total:</span>
                <span>{fmt(bill.treatmentamount)} CFA</span>
              </div> */}

              <div className="dashed-line" />

              {hasInsurance(bill.insurance) && (
                <div className="kv-row">
                  <span>{bill.insurance}:</span>
                  <span>{fmt(bill.partinsurance)} CFA</span>
                </div>
              )}
              {hasInsurance(bill.insurance2) && (
                <div className="kv-row">
                  <span>{bill.insurance2}:</span>
                  <span>{fmt(bill.partinsurance2)} CFA</span>
                </div>
              )}

              <div className="kv-row mt-1">
                <span>Part patient:</span>
                <span>{fmt(bill.partpatient)} CFA</span>
              </div>
              <div className="kv-row">
                <span>Montant payé:</span>
                <span className="font-bold">{fmt(bill.amountpaid)} CFA</span>
              </div>
              <div className="kv-row">
                <span>Reste à payer:</span>
                <span className={`font-bold ${remainder > 0 ? "text-red-600" : "text-green-600"}`}>
                  {fmt(remainder)} CFA
                </span>
              </div>

              {bill.paymentmethod && (
                <>
                  <div className="dashed-line" />
                  <div className="kv-row">
                    <span>Mode de paiement:</span>
                    <span>{bill.paymentmethod}</span>
                  </div>
                  {/* {bill.paidvia && (
                    <div className="kv-row">
                      <span>Payé via:</span>
                      <span>{bill.paidvia}</span>
                    </div>
                  )} */}
                </>
              )}

              <div className="dashed-line" />
              <div className="text-center">
                <img src={cachet} alt="Cachet" className="receipt-cachet" />
              </div>
              <p className="text-center mt-2">Merci de votre confiance.</p>
              <div className="text-center mt-2">
                <img src={clinic.qrcode ? normalizeFileUrl(clinic.qrcode) : qrCode} alt="QR Code site web" className="receipt-qr mx-auto block" />
                <p className="text-xs mt-1">Scannez pour visiter notre site</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
