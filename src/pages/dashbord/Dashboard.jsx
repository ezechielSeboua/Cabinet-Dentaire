import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";

import DashboardData from "./DashboardData";
import DoctorDashboardData from "./DoctorDashboardData";
import {
  UsersIcon,
  BriefcaseIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "../../components/ui/DashboardIcons";

import * as cdiService from "../../services/cdiService";
import * as authService from "../../services/authService";
import SideBar2 from "../../components/SideBar2";
import Header from "../../components/Header";
import { useSidebarMargin } from "../../hooks/useSidebarMargin";
import StatCard, { StatCardSkeleton } from "./StatCard";

// Helper to format currency
const formatCurrency = (amount) => {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
};

export default function Dashboard() {
  const sidebarMargin = useSidebarMargin();
  const [currentUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    patients: 0,
    insurances: 0,
    upcomingAppointments: 0,
    treatments: [],
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [patientsRes, insurancesRes, appointmentsRes, treatmentsRes] =
          await Promise.all([
            cdiService.patientList(),
            cdiService.insuranceList(),
            cdiService.allAppointments(),
            cdiService.allTreatments(),
          ]);

        setStats({
          patients: patientsRes.data.length,
          insurances: insurancesRes.data.filter((x) => x.insurance !== "NA")
            .length,
          upcomingAppointments: appointmentsRes.data.filter(
            (x) => x.status !== "Terminé"
          ).length,
          treatments: treatmentsRes.data,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error(
          "Impossible de charger les statistiques du tableau de bord."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const financialTotals = useMemo(() => {
    return stats.treatments.reduce(
      (acc, treatment) => {
        acc.total += treatment.treatmentamount || 0;
        acc.patientPart += treatment.partpatient || 0;
        acc.insurancePart +=
          (treatment.partinsurance || 0) + (treatment.partinsurance2 || 0);
        return acc;
      },
      { total: 0, patientPart: 0, insurancePart: 0 }
    );
  }, [stats.treatments]);

  // Determine user role for cleaner rendering logic
  const userRole = currentUser?.body?.roles[0] || null;
  const isAdmin = userRole === "ADMIN";
  const isDoctor = userRole === "DOCTOR";
  const hasSecondaryContent = isAdmin || isDoctor;

  // Define stats data to avoid repetition in JSX
  const commonStats = [
    {
      title: "Patients Enregistrés",
      value: stats.patients,
      icon: <UsersIcon />,
      color: "blue",
    },
    {
      title: "Assurances Partenaires",
      value: stats.insurances,
      icon: <BriefcaseIcon />,
      color: "teal",
    },
    {
      title: "Rendez-vous en attente",
      value: stats.upcomingAppointments,
      icon: <CalendarIcon />,
      color: "orange",
    },
  ];

  const adminStats = [
    ...commonStats,
    {
      title: "Coût Total des Traitements",
      value: formatCurrency(financialTotals.total),
      icon: <CurrencyDollarIcon />,
      color: "purple",
    },
    {
      title: "Revenus des Patients",
      value: formatCurrency(financialTotals.patientPart),
      icon: <CurrencyDollarIcon />,
      color: "green",
    },
    {
      title: "Part des Assurances",
      value: formatCurrency(financialTotals.insurancePart),
      icon: <CurrencyDollarIcon />,
      color: "red",
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200">
      <SideBar2 />
      <div className="h-14 bg-white dark:bg-gray-800 shadow-md fixed w-full z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <Header />
      </div>
      <div className="flex-1 flex flex-col">
        <main className={`flex-1 p-4 md:p-6 lg:p-8 ml-0 ${sidebarMargin} -mt-4`}>
          <div className="w-full max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-4 mt-14">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Tableau de bord.
              </h1>
              <p className="text-sm sm:text-base text-primary-600 dark:text-gray-400 mt-1">
                Bienvenue, {currentUser?.body?.firstname || "Utilisateur"}{" "}
                {currentUser?.body?.lastname || "Utilisateur"} . Voici un aperçu
                de l'activité de la clinique.
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {loading
                ? (isAdmin ? adminStats : commonStats).map((_, index) => (
                    <StatCardSkeleton key={index} />
                  ))
                : (isAdmin ? adminStats : commonStats).map((stat, index) => (
                    <StatCard
                      key={index}
                      title={stat.title}
                      value={stat.value}
                      icon={stat.icon}
                      color={stat.color}
                    />
                  ))}
            </div>

            {/* Main Content Area (Charts, Tables, etc.) */}
            {hasSecondaryContent && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isAdmin && <DashboardData />}
                {isDoctor && <DoctorDashboardData />}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
// This code is a React component for a dashboard page that displays various statistics and data related to a clinic's operations.
// It includes components for displaying statistics, fetching data from services, and rendering different views based on user roles (Admin, Doctor, Cashier).
