import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import SummaryCard from "./SummaryCard";
import LoadingSkeleton from "./LoadingSkeleton";
import * as cdiService from "../../services/cdiService";
import { ClipboardIcon, UsersIcon } from "../../components/ui/DashboardIcons";

export default function DashboardData() {
  const [data, setData] = useState({
    users: [],
    patients: [],
    treatments: [],
    bills: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, patientsRes, treatmentsRes, billsRes] =
          await Promise.all([
            cdiService.usersList(),
            cdiService.patientList(),
            cdiService.allTreatments(),
            cdiService.allBills(),
          ]);

        setData({
          users: usersRes.data,
          patients: patientsRes.data,
          treatments: treatmentsRes.data,
          bills: billsRes.data,
        });
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
        toast.error("Impossible de charger les données du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // useMemo to calculate user stats efficiently
  const userStats = useMemo(() => {
    const roles = {
      ADMIN: 0,
      ACCOUNTANT: 0,
      CASHIER: 0,
      DOCTOR: 0,
      PATIENT: 0,
    };
    data.users.forEach((user) => {
      const roleName = user.roles[0]?.name;
      if (roleName in roles) {
        roles[roleName]++;
      }
    });
    return { total: data.users.length, ...roles };
  }, [data.users]);

  // useMemo for treatment stats
  const treatmentStats = useMemo(() => {
    const total = data.treatments.length;
    const completed = data.treatments.filter(
      (t) => t.treatmentstatus === "Terminé"
    ).length;
    return { total, completed, pending: total - completed };
  }, [data.treatments]);

  // useMemo for patient and billing stats
  const patientStats = useMemo(() => {
    const total = data.patients.length;
    const insured = data.patients.filter((p) => p.insurance !== "NA").length;
    return {
      total,
      insured,
      uninsured: total - insured,
      paidBills: data.bills.length,
    };
  }, [data.patients, data.bills]);

  if (loading) {
    return (
      <>
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <>
      {/* Users Breakdown Card */}
      <SummaryCard
        title="Répartition des Utilisateurs"
        icon={<UsersIcon className="w-7 h-7" />}
        metrics={[
          { label: "Total des Utilisateurs", value: userStats.total },
          { label: "Administrateurs", value: userStats.ADMIN },
          { label: "Comptables", value: userStats.ACCOUNTANT },
          { label: "Caissiers", value: userStats.CASHIER },
          { label: "Docteurs", value: userStats.DOCTOR },
          { label: "Comptes Patients", value: userStats.PATIENT },
        ]}
      />
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
