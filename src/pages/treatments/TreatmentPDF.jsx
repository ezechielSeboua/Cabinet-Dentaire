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
import { normalizeFileUrl } from "../../utils/config";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#333" },
  header: { textAlign: "center", marginBottom: 20 },
  logo: { width: 60, height: 60, marginBottom: 10, alignSelf: "center" },
  clinicName: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 5 },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    borderStyle: "dashed",
    marginVertical: 15,
  },
  infoSection: { marginBottom: 15 },
  infoText: { marginBottom: 5, fontSize: 12 },
  infoLabel: { fontFamily: "Helvetica-Bold" },
  mainSection: { marginBottom: 15 },
  mainSectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  contentBox: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  financialSummary: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 5,
    marginTop: 10,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  patientPartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#dbeafe",
  },
  bold: { fontFamily: "Helvetica-Bold" },
  footer: { marginTop: 40, textAlign: "center" },
  cachet: { width: 100, height: "auto", alignSelf: "center", marginBottom: 10 },
});

const formatInterventions = (interventions) => {
  if (Array.isArray(interventions)) {
    return interventions.join(", ");
  }
  return interventions;
};

export const TreatmentPDF = ({ treatment, clinicInfo }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image style={styles.logo} src={clinicInfo?.logo ? normalizeFileUrl(clinicInfo.logo) : logo1} />
        <Text style={styles.clinicName}>{clinicInfo.name}</Text>
        <Text>{clinicInfo.address}</Text>
        <Text>Tel: {clinicInfo.telephonemobile}</Text>
      </View>
      <View style={styles.line} />
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Date:</Text>{" "}
          {new Date(treatment.registeredOn).toLocaleDateString("fr-FR")}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Ticket N°:</Text> {treatment.id}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Patient:</Text> {treatment.patientname}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>N° Patient:</Text>{" "}
          {treatment.patientno}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Docteur:</Text> {treatment.doctorname}
        </Text>
      </View>
      <View style={styles.line} />
      <View style={styles.mainSection}>
        <Text style={styles.mainSectionTitle}>Interventions Effectuées</Text>
        <View style={styles.contentBox}>
          <Text>{formatInterventions(treatment.interventions)}</Text>
        </View>
      </View>
      <View style={styles.mainSection}>
        <Text style={styles.mainSectionTitle}>Prescription Médicale</Text>
        <View style={styles.contentBox}>
          <Text>{treatment.prescription || "Aucune"}</Text>
        </View>
      </View>
      {Array.isArray(treatment.teeth) && treatment.teeth.length > 0 && (
        <View style={styles.mainSection}>
          <Text style={styles.mainSectionTitle}>Dents Traitées</Text>
          <View style={styles.contentBox}>
            <Text>
              {[...treatment.teeth]
                .sort((a, b) => Number(a) - Number(b))
                .join(", ")}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.line} />
      <View style={styles.mainSection}>
        <Text style={styles.mainSectionTitle}>Résumé Financier</Text>
        <View style={styles.financialSummary}>
          {/* --- DYNAMIC INSURANCE NAMES --- */}
          {treatment.insurance && (
            <View style={styles.financialRow}>
              <Text>{treatment.insurance}:</Text>
              <Text style={styles.bold}>
                {treatment.partinsurance || 0} CFA
              </Text>
            </View>
          )}
          {treatment.insurance2 && (
            <View style={styles.financialRow}>
              <Text>{treatment.insurance2}:</Text>
              <Text style={styles.bold}>
                {treatment.partinsurance2 || 0} CFA
              </Text>
            </View>
          )}

          <View style={styles.patientPartRow}>
            <Text style={styles.bold}>Part Patient:</Text>
            <Text style={styles.bold}>{treatment.partpatient} CFA</Text>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <Image style={styles.cachet} src={cachet} />
        <Text>Cachet & Signature du Docteur</Text>
        <Text style={{ marginTop: 10 }}>Merci de votre confiance.</Text>
      </View>
    </Page>
  </Document>
);
