import { useEffect } from "react";

import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Patient from "./pages/patients/Patient";
import NewPatient from "./pages/patients/NewPatient";
import Users from "./pages/users/Users";
import NewUser from "./pages/users/NewUser";
import Insurances from "./pages/insurances/Insurances";
import Treatment from "./pages/treatments/Treatment";

import Payments from "./pages/payments/Payment";
// import NewPayment from "./pages/payments/NewPayment";

import Reports from "./pages/Reporting/Reports";
import Intervention from "./pages/interventions/intervention";

import ClinicSettings from "./pages/clinicInfo/ClinicSettings";
import Clinic from "./pages/clinicInfo/Clinic";
import OpeningHoursPage from "./pages/clinicInfo/OpeningHoursPage";

import ReportDataAssurance from "./pages/Reporting/ReportDataAssurance";
import ReportDataPatient from "./pages/Reporting/ReportDataPatient";
import ReportDataTreatment from "./pages/Reporting/ReportDataTreatment";
import ExpenseTypes from "./pages/expenses/ExpenseTypes";
import ExpensesHome from "./pages/expenses/ExpensesHome";
import ExpenseTypeList from "./pages/expenses/ExpenseTypeList";
import ExpensesList from "./pages/expenses/ExpensesList";
import ReportDataExpenses from "./pages/Reporting/ReportDataExpenses";

import SendMessage from "./pages/patients/SendMessage";
import MessageList from "./pages/patients/MessageList";

// import ViewMessage from "./pages/patients/ViewMessage";

import PrintTreatment from "./pages/treatments/PrintTreatment";
import TodayTreatments from "./pages/treatments/TodayTreatments";
import InpaidBills from "./pages/payments/UpaidBills";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NotFound from "./pages/NotFound";
import PasswordChange from "./components/passwordmanagement/PasswordChange";

import IntervalTreatments from "./pages/treatments/IntervalTreatments";
import PatientTreatmentHistory from "./pages/treatments/PatientTreatmentHistory";
import InsuranceActivityReport from "./pages/Reporting/InsuranceActivityReport";
import InsuredVsUninsuredReport from "./pages/Reporting/InsuredVsUninsuredReport";
import DoctorStatisticsReport from "./pages/Reporting/DoctorStatisticsReport";
import ReportDataPayment from "./pages/Reporting/ReportDataPayment";
import ReportPaymentStatus from "./pages/Reporting/ReportPaymentStatus";
import WaitingList from "./pages/waiting/WaitingList";
import IntervalBill from "./pages/payments/IntervalBill";
import IntervalExpenses from "./pages/expenses/IntervalExpenses";
import AccountantIntervalExpenses from "./pages/expenses/AccountantIntervalExpenses";
import Blogs from "./pages/blog/Blogs";
import BookedAppointments from "./pages/appointmentBooking/BookedAppointments";
import CommonAppointment from "./pages/appointments/CommonAppointment";
import { getCurrentUser } from "./services/authService";
import { clinicPublic } from "./services/cdiService";
import { normalizeFileUrl } from "./utils/config";
import ProtectedRouteLayout from "./components/ProtectedRouteLayout";
import Dashboard from "./pages/dashbord/Dashboard";
import DashboardWelcome from "./pages/dashbord/DashboardWelcome";
import BillDetailsPage from "./pages/payments/BillDetailsPage";
import FactureDuJour from "./pages/payments/FactureDuJour";
import PrintBill from "./pages/payments/PrintBill";
import { SidebarProvider } from "./context/SidebarContext";

function App() {
  useEffect(() => {
    clinicPublic().then((res) => {
      if (res.data?.favicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = normalizeFileUrl(res.data.favicon);
      }
    }).catch(() => {});
  }, []);

  return (
    <SidebarProvider>
    <div>
      <Routes>
        {/* <Route path="" element={<Login />} />
        {/* <Route path="" element={<Welcome />} /> */}
        {/* <Route path="forgot-password" element={<ForgotPasswordForm />} />
        <Route path="otpVerification" element={<OtpForm />} />
        <Route path="resetpassword" element={<PasswordResetForm />} />
        <Route path="/" element={<Navigate to="/login" replace />} /> */}
        {/* The following setting is for online deployment */}
        <Route path="login" element={<Login />} />
        <Route path="" element={<Welcome />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/" element={<Navigate to="/welcome" replace />} />

        {/* --- PROTECTED ROUTES --- */}
        {/* All routes inside this wrapper will now be protected. */}
        {/* If a user is not logged in, ProtectedRouteLayout will redirect them to /login. */}
        <Route element={<ProtectedRouteLayout />}>
          <Route path="clinic" element={<Clinic />} />
          <Route path="clinic/add" element={<ClinicSettings />} />
          <Route path="clinic/opening-hours" element={<OpeningHoursPage />} />

          <Route path="patients" element={<Patient />} />

          <Route path="patient/new" element={<NewPatient />} />
          <Route path="send-message" element={<SendMessage />} />
          <Route path="message" element={<MessageList />} />
          {/* <Route path="message/get/:id" element={<ViewMessage />} /> */}
          <Route path="intervention" element={<Intervention />} />

          <Route path="user" element={<Users />} />
          <Route path="user/new" element={<NewUser />} />

          <Route path="blog" element={<Blogs />} />

          <Route path="insurance" element={<Insurances />} />

          <Route path="treatment" element={<Treatment />} />

          <Route path="treatment/print/:id" element={<PrintTreatment />} />
          <Route path="treatment/of-the-day" element={<TodayTreatments />} />
          <Route path="treatment/between" element={<IntervalTreatments />} />
          <Route path="treatment/patient-history" element={<PatientTreatmentHistory />} />
          <Route path="bill" element={<Payments />} />
          <Route path="/bill/details/:id" element={<BillDetailsPage />} />
          <Route path="/bill/print/:id" element={<PrintBill />} />
          <Route path="bill/unpaid-bills" element={<InpaidBills />} />
          <Route path="bill/of-the-day" element={<FactureDuJour />} />
          <Route path="bill/between" element={<IntervalBill />} />
          {/* <Route
            path="bill/new/:id/:partpatient/:treatmentamount/:partinsurance/:partinsurance2"
            element={<NewPayment />}
          /> */}
          <Route path="appointments" element={<CommonAppointment />} />

          <Route path="booked-appointments" element={<BookedAppointments />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboardwelcome" element={<DashboardWelcome />} />

          <Route path="waiting" element={<WaitingList />} />

          <Route path="report" element={<Reports />} />
          <Route path="report/assurances" element={<ReportDataAssurance />} />
          <Route path="report/patients" element={<ReportDataPatient />} />
          <Route path="report/expenses" element={<ReportDataExpenses />} />
          <Route path="report/insurance-activity" element={<InsuranceActivityReport />} />
          <Route path="report/insured-vs-uninsured" element={<InsuredVsUninsuredReport />} />
          <Route path="report/doctor-stats" element={<DoctorStatisticsReport />} />
          <Route path="report/payments" element={<ReportDataPayment />} />
          <Route path="report/payment-status" element={<ReportPaymentStatus />} />
          <Route
            path="report/treatments-rendezvous"
            element={<ReportDataTreatment />}
          />
          <Route path="expenses" element={<ExpensesHome />} />
          <Route path="expenses/between" element={<IntervalExpenses />} />
          <Route
            path="expenses/accountant"
            element={<AccountantIntervalExpenses />}
          />
          <Route path="expense-types" element={<ExpenseTypes />} />
          <Route path="expense-types-list" element={<ExpenseTypeList />} />
          <Route path="expense-list" element={<ExpensesList />} />
          <Route path="change-password" element={<PasswordChange />} />

          {/* Handle other routes */}
        </Route>
        {/* Optional: A default route for logged-in users */}
        {/* If a logged-in user visits the root "/", redirect them to the dashboard */}
        <Route
          path="/"
          element={
            getCurrentUser() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
    </SidebarProvider>
  );
}

export default App;
