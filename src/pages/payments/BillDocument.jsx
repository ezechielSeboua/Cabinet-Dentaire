import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logo1 from "../../assets/logo1.jpg";
import cachet from "../../assets/cachet.jpg";
import cabinetdentaireivoire from "../../assets/cabinetdentaireivoire.png";
import { normalizeFileUrl } from "../../utils/config";

const brandColor = "#005a9c";
const lightGray = "#F7F7F7";
const darkGray = "#333333";

// --- NEW HELPER FUNCTION ---
/**
 * Formats a number using French conventions (space as thousands separator).
 * @param {number | string} num The number to format.
 * @returns {string} The formatted number string.
 */
const formatNumberForFrance = (num) => {
  if (num === null || num === undefined) return "0";
  // Ensure we are working with a number and handle potential decimal parts
  const [integerPart, decimalPart] = String(parseFloat(num)).split(".");
  // Add spaces for thousands separators to the integer part
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    " "
  );
  // Re-join with the decimal part if it exists
  return decimalPart
    ? `${formattedIntegerPart},${decimalPart}`
    : formattedIntegerPart;
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    lineHeight: 1.5,
    color: darkGray,
  },
  headerContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E4",
    paddingBottom: 20,
  },
  logo: { width: 60, height: 60, marginBottom: 8 },
  companyTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: brandColor,
  },
  infoAndStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  billTo: { paddingRight: 30 },
  billToText: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  invoiceInfo: { textAlign: "right" },
  statusBadge: {
    marginTop: 10,
    padding: "3px 8px",
    borderRadius: 5,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "white",
    alignSelf: "flex-end",
  },
  table: { display: "table", width: "auto", marginTop: 20 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E4",
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: brandColor,
    color: "white",
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  tableCol: { width: "70%", padding: 8 },
  tableColAmount: { width: "30%", padding: 8, textAlign: "right" },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  summaryBox: { width: "45%" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "4px 0",
  },
  summaryTotal: {
    fontFamily: "Helvetica-Bold",
    backgroundColor: lightGray,
    padding: 8,
    marginTop: 5,
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 9,
    color: "#888888",
    borderTopWidth: 1,
    borderTopColor: "#E4E4E4",
    paddingTop: 8,
    flexDirection: "column",
    alignItems: "center",
  },
  signature: { width: 80, height: 80, marginBottom: 2 },
  posPage: {
    padding: 10,
    fontSize: 10,
    fontFamily: "Helvetica",
    width: "80mm",
  },
  posHeader: { alignItems: "center", marginBottom: 10 },
  posLogo: { width: 40, height: 40, marginBottom: 5 },
  posTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "center" },
  posLine: {
    borderBottomWidth: 1,
    borderBottomStyle: "dashed",
    marginVertical: 5,
  },
  posText: { marginBottom: 3 },
  posTotal: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 5 },
  posSignature: { width: 50, height: 50, alignSelf: "center", marginTop: 5 },
  posFooterText: {
    textAlign: "center",
    marginTop: 4,
    fontSize: 9,
  },
});

const BillDocument = ({ bill, clinic, format = "a4" }) => {
  const remainder = parseFloat(bill.partpatient) - parseFloat(bill.amountpaid);
  const clinicName = clinic?.name || "Clinique CDI";

  const getStatus = () => {
    if (remainder <= 0)
      return {
        text: "PAYÉE",
        style: { backgroundColor: "#28a745", alignItems: "center" },
      };
    if (remainder > 0 && parseFloat(bill.amountpaid) > 0)
      return {
        text: "PARTIELLEMENT PAYÉE",
        style: { backgroundColor: "#fd7e14", alignItems: "center" },
      };
    return {
      text: "NON PAYÉE",
      style: { backgroundColor: "#dc3545", alignItems: "center" },
    };
  };
  const status = getStatus();

  const A4View = () => (
    <Page size="A4" style={styles.page}>
      <View style={styles.headerContainer}>
        <Image style={styles.logo} src={clinic?.logo ? normalizeFileUrl(clinic.logo) : logo1} />
        <Text style={styles.companyTitle}>{clinicName}</Text>
      </View>
      <View style={styles.infoAndStatusContainer}>
        <View style={styles.billTo}>
          <Text>Facturé à:</Text>
          <Text style={styles.billToText}>{bill.patientname}</Text>
          <Text>ID Patient: {bill.patientno}</Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12 }}>
            FACTURE #{bill.id}
          </Text>

          <Text>
            Date: {new Date(bill.registeredOn).toLocaleDateString("fr-FR")}
          </Text>
          <Text style={[styles.statusBadge, status.style]}>{status.text}</Text>
        </View>
      </View>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCol}>Description</Text>
          <Text style={styles.tableColAmount}>Montant</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCol}>Part Patient du Traitement</Text>
          <Text style={styles.tableColAmount}>
            {formatNumberForFrance(bill.partpatient)} F
          </Text>
        </View>
      </View>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text>Total Dû:</Text>
            <Text>{formatNumberForFrance(bill.partpatient)} F</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Montant Payé:</Text>
            <Text>{formatNumberForFrance(bill.amountpaid)} F</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={{ fontSize: 12 }}>Reste à Payer:</Text>
            <Text style={{ fontSize: 12 }}>
              {formatNumberForFrance(remainder)} F
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <Image style={styles.signature} src={cachet} />
        <Text style={{ marginBottom: 5 }}>La Direction</Text>
        <Text>
          {clinicName} - {clinic?.address || "Votre Adresse"} - Tél:{" "}
          {clinic?.telephonemobile || clinic?.telephonemobile2}
        </Text>
        <Text>Merci de votre confiance.</Text>
        <Image style={styles.signature} src={clinic?.qrcode ? normalizeFileUrl(clinic.qrcode) : cabinetdentaireivoire} />
      </View>
    </Page>
  );

  const POSView = () => (
    <Page size={{ width: "80mm", height: "160mm" }} style={styles.posPage}>
      <View style={styles.posHeader}>
        <Image style={styles.posLogo} src={logo1} />
        <Text style={styles.posTitle}>{clinicName}</Text>
      </View>
      <Text style={{ textAlign: "center", fontSize: 11, marginBottom: 5 }}>
        Reçu de Paiement
      </Text>
      <View style={styles.posLine} />
      <View>
        <Text style={styles.posText}>
          Date:{" "}
          {new Date(bill.registeredOn).toLocaleString("fr-FR", {
            timeZone: "UTC",
          })}
        </Text>
        <Text style={styles.posText}>Facture #: {bill.id}</Text>
        <Text style={styles.posText}>Patient: {bill.patientname}</Text>
        <Text style={styles.posText}>ID Patient: {bill.patientno}</Text>
      </View>
      <View style={styles.posLine} />
      <View>
        <Text style={styles.posText}>
          Part Patient: {formatNumberForFrance(bill.partpatient)} F
        </Text>
        <Text style={styles.posText}>
          Payé: {formatNumberForFrance(bill.amountpaid)} F
        </Text>
        <View style={styles.posLine} />
        <Text style={[styles.statusBadge, status.style]}>{status.text}</Text>
        <Text style={styles.posTotal}>
          RESTE A PAYER: {formatNumberForFrance(remainder)} F
        </Text>
      </View>
      <View style={styles.posLine} />
      <Image style={styles.posSignature} src={cachet} />
      <Text style={styles.posFooterText}>
        {clinic?.address || "Votre Adresse"}
      </Text>
      <Text style={styles.posFooterText}>
        Tél: {clinic?.telephonemobile || clinic?.telephonemobile2}
      </Text>
      <Text style={styles.posFooterText}>Merci de votre confiance.</Text>
      <Image style={styles.posSignature} src={cabinetdentaireivoire} />
    </Page>
  );

  return (
    <Document author={clinicName} title={`Facture #${bill.id}`}>
      {format === "pos" ? <POSView /> : <A4View />}
    </Document>
  );
};

export default BillDocument;
