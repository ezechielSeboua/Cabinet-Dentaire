import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import SummaryCard from "./SummaryCard";
import LoadingSkeleton from "./LoadingSkeleton";
import {
  allBills,
  allTreatments,
  patientList,
} from "../../services/cdiService";
import { ClipboardIcon, UsersIcon } from "../../components/ui/DashboardIcons";

export default function DoctorDashboardData() {
  const [data, setData] = useState({
    patients: [],
    treatments: [],
    bills: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsRes, treatmentsRes, billsRes] = await Promise.all([
          patientList(),
          allTreatments(),
          allBills(),
        ]);

        setData({
          patients: patientsRes.data,
          treatments: treatmentsRes.data,
          bills: billsRes.data,
        });
      } catch (error) {
        console.error("Failed to fetch doctor dashboard data:", error);
        toast.error("Impossible de charger les données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Use useMemo to calculate stats only when the source data changes
  const treatmentStats = useMemo(() => {
    const total = data.treatments.length;
    const completed = data.treatments.filter(
      (t) => t.treatmentstatus === "Terminé"
    ).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [data.treatments]);

  const patientStats = useMemo(() => {
    const total = data.patients.length;
    const insured = data.patients.filter((p) => p.insurance !== "NA").length;
    const uninsured = total - insured;
    const paidBills = data.bills.length;
    return { total, insured, uninsured, paidBills };
  }, [data.patients, data.bills]);

  if (loading) {
    return (
      <>
        <LoadingSkeleton />
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <>
      {/* Treatments Card */}
      <SummaryCard
        title="Aperçu des Traitements"
        icon={<ClipboardIcon className="w-7 h-7" />}
        metrics={[
          { label: "Total des Traitements", value: treatmentStats.total },
          { label: "Terminés", value: treatmentStats.completed },
          { label: "En cours", value: treatmentStats.pending },
        ]}
      />

      {/* Patients & Bills Card */}
      <SummaryCard
        title="Patients & Facturation"
        icon={<UsersIcon className="w-7 h-7" />}
        metrics={[
          { label: "Total des Patients", value: patientStats.total },
          { label: "Patients Assurés", value: patientStats.insured },
          { label: "Patients Non Assurés", value: patientStats.uninsured },
          { label: "Factures Réglées", value: patientStats.paidBills },
        ]}
      />
    </>
  );
}
