import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";

import BillDocument from "../payments/BillDocument";
// import Spinner from "../Spinner"; // Assuming Spinner.jsx is in src/components/
// import BillDocument from "../pdf/BillDocument"; // Assuming BillDocument.jsx is in src/components/pdf/

export default function PrintModal({ bill, clinic, format, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-70">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-600">
          <h2 className="text-xl font-bold dark:text-white">
            Aperçu: Format {format.toUpperCase()}
          </h2>
          <PDFDownloadLink
            document={
              <BillDocument bill={bill} clinic={clinic} format={format} />
            }
            fileName={`facture-${bill.id}-${format}.pdf`}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          >
            {({ loading }) => (loading ? "..." : "Télécharger")}
          </PDFDownloadLink>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:text-red-500"
          >
            ×
          </button>
        </div>
        <div className="flex-grow">
          <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
            <BillDocument bill={bill} clinic={clinic} format={format} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
