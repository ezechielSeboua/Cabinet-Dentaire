import {
  MdSick,
  MdAnalytics,
  MdCheckCircle,
  MdBarChart,
  MdOutlinePassword,
  MdHome,
  MdSettings,
  MdPeople,
} from "react-icons/md";
import { FaUserClock } from "react-icons/fa";
import {
  BsCalendarCheck,
  BsFiles,
  BsActivity,
  BsFillHospitalFill,
  BsEnvelopeCheck,
  BsOpencollective,
} from "react-icons/bs";
import { TbMessage2Up } from "react-icons/tb";
import { GiTakeMyMoney, GiReceiveMoney } from "react-icons/gi";
import { FaUserDoctor } from "react-icons/fa6";
import { AiFillInsurance, AiFillDashboard } from "react-icons/ai";
import { LiaBloggerB } from "react-icons/lia";

export const admin = [
  { title: "Accueil", path: "/dashboardwelcome", icon: <MdHome /> },
  { title: "Tableau de bord", path: "/dashboard", icon: <AiFillDashboard /> },
  { title: "Patients", path: "/patients", icon: <BsActivity /> },
  { title: "Rendez-vous", path: "/appointments", icon: <MdCheckCircle /> },
  { title: "Salle d'attente", path: "/waiting", icon: <FaUserClock /> },
  { title: "Traitements", path: "/treatment", icon: <MdSick /> },
  { title: "Factures", path: "/bill", icon: <GiTakeMyMoney /> },
  { title: "Trésorerie", path: "/expenses", icon: <GiReceiveMoney /> },
  {
    title: "Rapports",
    icon: <BsFiles />,
    children: [
      { title: "Tous les rapports", path: "/report", icon: <BsFiles /> },
      {
        title: "Rapp. Assurances",
        path: "/report/insurance-activity",
        icon: <AiFillInsurance />,
      },
      {
        title: "Stat. Médecins",
        path: "/report/doctor-stats",
        icon: <MdBarChart />,
      },
    ],
  },
  // { title: "Messages",       path: "/message",                   icon: <BsEnvelopeCheck /> },
  { title: "Blog", path: "/blog", icon: <LiaBloggerB /> },
  { title: "Assurances", path: "/insurance", icon: <AiFillInsurance /> },
  { title: "Interventions", path: "/intervention", icon: <MdAnalytics /> },
  { title: "Utilisateurs", path: "/user", icon: <FaUserDoctor /> },
  { title: "Paramètres", path: "/clinic", icon: <BsFillHospitalFill /> },
  {
    title: "Ouverture",
    path: "/clinic/opening-hours",
    icon: <BsOpencollective />,
  },

  {
    title: "Mot de passe",
    path: "/change-password",
    icon: <MdOutlinePassword />,
  },
];

export const doc = [
  { title: "Accueil", path: "/dashboardwelcome", icon: <MdHome /> },
  { title: "Patients", path: "/patients", icon: <BsActivity /> },
  { title: "Rendez-vous", path: "/appointments", icon: <BsCalendarCheck /> },
  { title: "Salle d'attente", path: "/waiting", icon: <FaUserClock /> },
  { title: "Traitements", path: "/treatment", icon: <MdSick /> },
  {
    title: "Rapports",
    icon: <BsFiles />,
    children: [
      {
        title: "Rapp. Assurances",
        path: "/report/insurance-activity",
        icon: <AiFillInsurance />,
      },
      {
        title: "Stat. Médecins",
        path: "/report/doctor-stats",
        icon: <MdBarChart />,
      },
    ],
  },
  // { title: "Messages",       path: "/message",                   icon: <BsEnvelopeCheck /> },
  {
    title: "Mot de passe",
    path: "/change-password",
    icon: <MdOutlinePassword />,
  },
];

export const cas = [
  { title: "Accueil", path: "/dashboardwelcome", icon: <MdHome /> },
  { title: "Patients", path: "/patients", icon: <BsActivity /> },
  { title: "Rendez-vous", path: "/appointments", icon: <BsCalendarCheck /> },
  { title: "Salle d'attente", path: "/waiting", icon: <FaUserClock /> },
  { title: "Traitements", path: "/treatment", icon: <MdSick /> },
  { title: "Factures", path: "/bill", icon: <GiTakeMyMoney /> },
  { title: "Trésorerie", path: "/expenses", icon: <GiReceiveMoney /> },
  {
    title: "Rapports",
    icon: <BsFiles />,
    children: [
      { title: "Tous les rapports", path: "/report", icon: <BsFiles /> },
      {
        title: "Rapp. Assurances",
        path: "/report/insurance-activity",
        icon: <AiFillInsurance />,
      },
      {
        title: "Stat. Médecins",
        path: "/report/doctor-stats",
        icon: <MdBarChart />,
      },
    ],
  },
  // { title: "Messages",       path: "/message",                   icon: <BsEnvelopeCheck /> },
  {
    title: "Mot de passe",
    path: "/change-password",
    icon: <MdOutlinePassword />,
  },
];

export const acc = [
  { title: "Accueil", path: "/dashboardwelcome", icon: <MdHome /> },
  { title: "Assurances", path: "/insurance", icon: <AiFillInsurance /> },
  { title: "Patients", path: "/patients", icon: <BsActivity /> },
  { title: "Rendez-vous", path: "/appointments", icon: <BsCalendarCheck /> },
  { title: "Salle d'attente", path: "/waiting", icon: <FaUserClock /> },
  { title: "Traitements", path: "/treatment", icon: <MdSick /> },
  { title: "Factures", path: "/bill", icon: <GiTakeMyMoney /> },
  { title: "Trésorerie", path: "/expenses", icon: <GiReceiveMoney /> },
  {
    title: "Ouverture",
    path: "/clinic/opening-hours",
    icon: <BsOpencollective />,
  },

  {
    title: "Rapports",
    icon: <BsFiles />,
    children: [
      { title: "Tous les rapports", path: "/report", icon: <BsFiles /> },
      {
        title: "Rapp. Assurances",
        path: "/report/insurance-activity",
        icon: <AiFillInsurance />,
      },
      {
        title: "Stat. Médecins",
        path: "/report/doctor-stats",
        icon: <MdBarChart />,
      },
    ],
  },
  {
    title: "Mot de passe",
    path: "/change-password",
    icon: <MdOutlinePassword />,
  },
];

export const patient = [
  { title: "Accueil", path: "/dashboardwelcome", icon: <MdHome /> },
  { title: "Rendez-vous", path: "/appointments", icon: <BsCalendarCheck /> },
  { title: "Message", path: "/send-message", icon: <TbMessage2Up /> },
  {
    title: "Mot de passe",
    path: "/change-password",
    icon: <MdOutlinePassword />,
  },
];
