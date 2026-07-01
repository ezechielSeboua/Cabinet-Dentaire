import React, { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";

import PublicInsurances from "./PublicInsurances";
import PublicBlog from "./blog/PublicBlog";
import BookAppointment from "./appointmentBooking/BookAppointment";
import Navbar from "../components/Navbar";
import { clinicPublic, getPublicOpeningHours } from "../services/cdiService";
import { normalizeFileUrl, TELEGRAM_URL } from "../utils/config";
import {
  ArrowUpIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "../components/ui/Icons";
import { FaWhatsapp as WhatsAppIcon, FaTelegram as TelegramIcon } from "react-icons/fa";
import { MdLocationOn, MdOutlineAttachEmail, MdPhone } from "react-icons/md";
import OpeningHours from "../components/ui/OpeningHours";
import InsuranceTicker from "../components/ui/InsuranceTicker";
import Reveal from "../components/ui/Reveal";
import bgimage from "../assets/hero_bg.jpg";

// ── Icônes SVG dentaires ────────────────────────────────────────────────────
const IC = "w-9 h-9 text-primary-600"; // classe commune

const IcCaries = () => (
  <svg className={IC} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Corps de la dent */}
    <path d="M7 5C7 3.5 8.2 2.5 10 3C11 3.4 12 5 12 5C12 3.4 13 3 14 3C15.8 2.5 17 3.5 17 5C18 4 19 5 18.5 7.5L17 18Q16.5 20.5 12 20.5Q7.5 20.5 7 18L5.5 7.5C5 5 6 4 7 5Z" />
    {/* Carie (zone sombre sur la dent) */}
    <path d="M10 11 C10 9.5 11 9 12 9 C13 9 14 9.5 14 11 C14 12.5 13 13 12 13 C11 13 10 12.5 10 11Z" strokeWidth="1" fill="currentColor" opacity="0.25" />
    <circle cx="12" cy="11" r="1.2" fill="currentColor" opacity="0.6" stroke="none" />
  </svg>
);

const IcDetartrage = () => (
  <svg className={IC} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Corps de la dent */}
    <path d="M7 5C7 3.5 8.2 2.5 10 3C11 3.4 12 5 12 5C12 3.4 13 3 14 3C15.8 2.5 17 3.5 17 5C18 4 19 5 18.5 7.5L17 18Q16.5 20.5 12 20.5Q7.5 20.5 7 18L5.5 7.5C5 5 6 4 7 5Z" />
    {/* Étincelles de propreté */}
    <path d="M18 1 L18.7 3 L21 3.7 L18.7 4.4 L18 6.4 L17.3 4.4 L15 3.7 L17.3 3Z" strokeWidth="1" />
    <path d="M4 2 L4.4 3.2 L5.8 3.7 L4.4 4.2 L4 5.4 L3.6 4.2 L2.2 3.7 L3.6 3.2Z" strokeWidth="1" />
  </svg>
);

const IcExtraction = () => (
  <svg className={IC} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Pince / davier */}
    <path d="M9 2 C8 2 7.5 3 8 4 L9.5 7" />
    <path d="M15 2 C16 2 16.5 3 16 4 L14.5 7" />
    <path d="M9.5 7 C9 8 9 9 10.5 9.5 L13.5 9.5 C15 9 15 8 14.5 7" />
    {/* Petite dent en dessous */}
    <path d="M10 13 C10 12 10.8 11.5 12 11.5 C13.2 11.5 14 12 14 13 C14.5 12.5 15 13 14.8 14.5 L14 19 Q13.5 21 12 21 Q10.5 21 10 19 L9.2 14.5 C9 13 9.5 12.5 10 13Z" />
    {/* Flèche vers le haut (extraction) */}
    <path d="M12 10 L12 8 M11 9.3 L12 8 L13 9.3" strokeWidth="1.3" />
  </svg>
);

const IcProthese = () => (
  <svg className={IC} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Couronne dentaire */}
    <path d="M5 16 L5.5 10 L8 13 L12 8 L16 13 L18.5 10 L19 16 Z" />
    <rect x="5" y="16" width="14" height="4" rx="1.5" />
    {/* Petites dents de la couronne */}
    <path d="M5 16 L5.5 10 M19 16 L18.5 10" strokeWidth="1" />
  </svg>
);

const IcOrthodontie = () => (
  <svg className={IC} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* 3 dents */}
    <path d="M4 7 C4 5.5 5 5 6 5.5 L7 6 L8 5.5 C9 5 10 5.5 10 7 L9 14 Q8.5 15.5 7 15.5 Q5.5 15.5 5 14 Z" />
    <path d="M10 6.5 C10 5.5 10.8 5 12 5 C13.2 5 14 5.5 14 6.5 L13 14 Q12.5 16 12 16 Q11.5 16 11 14 Z" />
    <path d="M14 7 C14 5.5 15 5 16 5.5 L17 6 L18 5.5 C19 5 20 5.5 20 7 L19 14 Q18.5 15.5 17 15.5 Q15.5 15.5 15 14 Z" />
    {/* Fil d'orthodontie */}
    <path d="M6 9.5 Q9 8.5 12 9.5 Q15 10.5 18 9.5" strokeWidth="1.8" />
    {/* Brackets */}
    <rect x="5.5" y="8.8" width="3" height="1.5" rx="0.4" />
    <rect x="10.5" y="9.1" width="3" height="1.5" rx="0.4" />
    <rect x="15.5" y="8.8" width="3" height="1.5" rx="0.4" />
  </svg>
);

const IcUrgence = () => (
  <svg className={IC} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Corps de la dent */}
    <path d="M7 5C7 3.5 8.2 2.5 10 3C11 3.4 12 5 12 5C12 3.4 13 3 14 3C15.8 2.5 17 3.5 17 5C18 4 19 5 18.5 7.5L17 18Q16.5 20.5 12 20.5Q7.5 20.5 7 18L5.5 7.5C5 5 6 4 7 5Z" />
    {/* Croix médicale */}
    <line x1="12" y1="9" x2="12" y2="15" strokeWidth="2" />
    <line x1="9" y1="12" x2="15" y2="12" strokeWidth="2" />
  </svg>
);
import cabinetIllustration from "../assets/cabinet_dentaire.png";
import fauteuilIllustration from "../assets/fauteuil_dentaire.png";
// clinic_telegram removed — only used inside a commented-out block
import SurveyForm from "../components/SurveyForm";

const JS_TO_ENUM = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];

function getNow() {
  const d = new Date();
  return {
    todayEnum: JS_TO_ENUM[d.getDay()],
    currentTime: d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0"),
  };
}

const DAY_ORDER = ["LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI","SAMEDI","DIMANCHE"];
const DAY_FR = { LUNDI:"Lundi", MARDI:"Mardi", MERCREDI:"Mercredi", JEUDI:"Jeudi", VENDREDI:"Vendredi", SAMEDI:"Samedi", DIMANCHE:"Dimanche" };

function getNextOpening(openingHours, now) {
  if (!openingHours?.length) return null;
  const { todayEnum, currentTime } = now;
  const todayIdx = DAY_ORDER.indexOf(todayEnum);
  for (let i = 0; i < 7; i++) {
    const nextDay = DAY_ORDER[(todayIdx + i) % 7];
    const entry = openingHours.find((h) => (h.day || "").toUpperCase() === nextDay);
    if (!entry || entry.isClosed) continue;
    if (i === 0) {
      if (currentTime >= entry.openTime) continue;
      return { label: "aujourd'hui", time: entry.openTime };
    }
    return { label: i === 1 ? "demain" : DAY_FR[nextDay], time: entry.openTime };
  }
  return null;
}

function getCurrentClinicStatus(openingHours, now) {
  if (!openingHours?.length) return "closed";
  const { todayEnum, currentTime } = now;
  const entry = openingHours.find((h) => (h.day || "").toUpperCase() === todayEnum);
  if (!entry) return "closed";
  if (entry.isClosed) return "closed";
  if (currentTime < entry.openTime) return "closed";
  if (currentTime >= entry.closeTime) return "closed";
  return "open";
}

export default function Welcome() {
  const [clinicData, setClinicData] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [openingHours, setOpeningHours] = useState([]);
  const [now, setNow] = useState(getNow());
  const [hasBlog, setHasBlog] = useState(true); // optimistic default to avoid layout flash

  useEffect(() => {
    clinicPublic()
      .then((res) => {
        if (res.data) setClinicData(res.data);
      })
      .catch(() => setFetchError(true));
    getPublicOpeningHours().then((res) => {
      if (res.data) setOpeningHours(res.data.map((h) => ({ ...h, day: h.day?.toUpperCase() })));
    });

    const t = setTimeout(() => setHeroVisible(true), 100);
    const tick = setInterval(() => {
      setNow(getNow());
      getPublicOpeningHours().then((res) => { if (res.data) setOpeningHours(res.data.map((h) => ({ ...h, day: h.day?.toUpperCase() }))); });
    }, 30_000);

    const onPageScroll = () => setScrolling(window.scrollY > 300);
    window.addEventListener("scroll", onPageScroll);
    return () => {
      clearTimeout(t);
      clearInterval(tick);
      window.removeEventListener("scroll", onPageScroll);
    };
  }, []);

  const address = clinicData?.address || "Bouaké, Côte d'Ivoire";
  const addressParts = address.split(" - ");
  const cleanedAddress = addressParts.length > 1 ? addressParts[1] : address;

  // OpenStreetMap embed — free, no API key needed
  const mapEmbedUrl = (() => {
    const url = clinicData?.googlelocationurl;
    if (!url) return null;
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      const delta = 0.005;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta},${lat - delta},${lng + delta},${lat + delta}&layer=mapnik&marker=${lat},${lng}`;
    }
    return null;
  })();

  const clinicStatus = getCurrentClinicStatus(openingHours, now);
  const nextOpening = clinicStatus === "closed" ? getNextOpening(openingHours, now) : null;
  const todayEntry = openingHours.find((h) => (h.day || "").toUpperCase() === now.todayEnum);

  const heroStyle = (delay = 0) => ({
    opacity: heroVisible ? 1 : 0,
    transform: heroVisible ? "translateY(0)" : "translateY(36px)",
    transition: `opacity 1s ease ${delay}s, transform 1s ease ${delay}s`,
  });

  if (fetchError) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500 dark:text-gray-400">
      <p className="text-lg">Impossible de charger les données du cabinet.</p>
      <button
        onClick={() => window.location.reload()}
        className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-sm transition-colors"
      >
        Réessayer
      </button>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="w-full mt-16 font-sans text-gray-800 dark:text-gray-200 antialiased">
        {/* ===== Hero Section ===== */}
        <section className="relative min-h-[600px] flex items-center justify-center text-center text-white py-40 overflow-hidden">
          {/* Background image + overlay */}
          <div className="absolute inset-0">
            <img
              src={clinicData?.backgroundimage ? normalizeFileUrl(clinicData.backgroundimage) : bgimage}
              alt="Smiling patient in a modern dental clinic"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            {/* Subtle vignette */}
          </div>

          {/* Hero content */}
          <div className="relative z-10 px-4 sm:px-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div style={heroStyle(0)} className="mb-6 flex items-center justify-center flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 backdrop-blur-sm px-5 py-2 text-sm font-medium">
                <span className="w-2 h-2 bg-primary-400 rounded-full hero-shimmer" />
                {clinicData?.name || "Cabinet Dentaire Ivoire"}
              </span>
              {clinicStatus === "open" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-400/40 bg-green-500/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-green-200">
                  <span className="w-2 h-2 bg-green-400 rounded-full hero-shimmer flex-shrink-0" />
                  Ouvert
                  {todayEntry?.closeTime && (
                    <span className="font-normal text-white/60 ml-1">· Ferme à {todayEntry.closeTime}</span>
                  )}
                </span>
              )}
              {clinicStatus === "closed" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/20 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-red-200">
                  <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                  Fermé
                  {nextOpening && (
                    <span className="font-normal text-white/60 ml-1">
                      · Ouvre {nextOpening.label} à {nextOpening.time}
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Title */}
            <div style={heroStyle(0.2)}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-4 drop-shadow-lg">
                {clinicData?.welcomeword || "Une vie meilleure commence par un beau sourire."}
              </h1>
            </div>

            {/* Subtitle */}
            <div style={heroStyle(0.4)}>
              <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 font-semibold text-white/90 drop-shadow">
                Bienvenue au cabinet du dentiste {clinicData?.ownerName || ""}. <br />
                {cleanedAddress}
              </p>
            </div>

            {/* CTAs */}
            <div
              style={heroStyle(0.55)}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <ScrollLink
                to="book-appointment"
                smooth={true}
                duration={500}
                offset={-80}
                className="cursor-pointer bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Prendre rendez-vous
              </ScrollLink>
              <ScrollLink
                to="nos-contacts"
                smooth={true}
                duration={500}
                offset={-80}
                className="cursor-pointer bg-transparent hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-full border border-white/50 transition-all duration-300 hover:scale-105"
              >
                Nous contacter
              </ScrollLink>
            </div>

            {/* Telegram QR */}
            {/* {(clinicData?.qrcode || clinic_telegram) && (
              <div style={heroStyle(0.7)} className="w-[10%] mx-auto mt-8">
                <img
                  src={clinicData?.qrcode ? normalizeFileUrl(clinicData.qrcode) : clinic_telegram}
                  alt="Cabinet Dentaire Ivoire QR Code"
                  className="rounded-lg shadow-2xl w-full h-auto object-cover"
                />
              </div>
            )} */}
          </div>

          {/* Scroll indicator */}
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 1s ease 1.3s",
            }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          >
            <span className="text-white/50 text-xs tracking-widest uppercase">
              Défiler
            </span>
            <div className="w-6 h-10 rounded-full border-2 border-white/40 flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-white/70 rounded-full scroll-bob" />
            </div>
          </div>
        </section>

        {/* ===== Insurance Ticker Banner ===== */}
        <InsuranceTicker />

        <main>
          {/* ===== 1. Le praticien ===== */}
          {clinicData && (
            <section className="py-16 lg:py-24 bg-white">
              <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  <Reveal direction="left">
                    <div>
                      <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">
                        Votre dentiste
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 leading-tight">
                        {clinicData.ownerName || "Dr. Votre Dentiste"}
                      </h2>
                      {clinicData.about && (
                        <p className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base">
                          {clinicData.about}
                        </p>
                      )}
                      {clinicData.vision && (
                        <blockquote className="border-l-4 border-primary-400 pl-5 py-1 italic text-gray-500 text-sm">
                          "{clinicData.vision}"
                        </blockquote>
                      )}
                      <a
                        href="#book-appointment"
                        onClick={(e) => { e.preventDefault(); document.getElementById("book-appointment")?.scrollIntoView({ behavior: "smooth" }); }}
                        className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-full transition-colors shadow-md shadow-primary-200"
                      >
                        Prendre rendez-vous
                      </a>
                    </div>
                  </Reveal>
                  <Reveal direction="right" delay={0.15}>
                    <img
                      src={cabinetIllustration}
                      alt="Dentiste avec patient"
                      className="w-full max-w-md mx-auto drop-shadow-lg"
                    />
                  </Reveal>
                </div>
              </div>
            </section>
          )}

          {/* ===== 2. Nos soins ===== */}
          <section className="py-16 lg:py-24 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
              <Reveal direction="up">
                <div className="text-center mb-12">
                  <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary-600 mb-3">
                    Ce que nous proposons
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Nos prestations
                  </h2>
                  <p className="text-gray-500 mt-3 text-sm sm:text-base">
                    Des soins de qualité pour toute la famille.
                  </p>
                </div>
              </Reveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
                {[
                  { Icon: IcCaries,     title: "Soins de caries",    desc: "Traitement et obturation des caries à tous stades." },
                  { Icon: IcDetartrage, title: "Détartrage",          desc: "Nettoyage professionnel et polissage des dents." },
                  { Icon: IcExtraction, title: "Extraction",          desc: "Extraction simple ou complexe réalisée en sécurité." },
                  { Icon: IcProthese,   title: "Prothèses",           desc: "Couronnes, bridges et dentiers sur mesure." },
                  { Icon: IcOrthodontie,title: "Orthodontie",         desc: "Alignement dentaire pour enfants et adultes." },
                  { Icon: IcUrgence,    title: "Urgences dentaires",  desc: "Prise en charge rapide des douleurs et traumatismes." },
                ].map((soin) => (
                  <Reveal key={soin.title} direction="up">
                    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-200 h-full">
                      <div className="mb-4 w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                        <soin.Icon />
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1.5">{soin.title}</h3>
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{soin.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal direction="up" delay={0.2}>
                <div className="mt-10 flex justify-center">
                  <img
                    src={fauteuilIllustration}
                    alt="Fauteuil dentaire"
                    className="w-full max-w-sm opacity-80 drop-shadow-md"
                  />
                </div>
              </Reveal>
            </div>
          </section>

          {/* ===== 3. Appointment Section ===== */}
          <section
            id="book-appointment"
            className="py-16 lg:py-24 bg-primary-50"
          >
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
              <Reveal direction="up">
                {clinicData && <BookAppointment clinicData={clinicData} />}
              </Reveal>
            </div>
          </section>

          {/* ===== 4. Insurances Section ===== */}
          <section
            id="assurance"
            className="py-16 lg:py-20 bg-white"
          >
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
              <Reveal direction="up">
                <PublicInsurances />
              </Reveal>
            </div>
          </section>

          {/* ===== 5. Blog Section (hidden when no articles) ===== */}
          {hasBlog && (
            <section
              id="conseils"
              className="py-16 lg:py-24 bg-primary-50"
            >
              <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <Reveal direction="up">
                  <PublicBlog onHasContent={setHasBlog} />
                </Reveal>
              </div>
            </section>
          )}

          {/* ===== 6. Satisfaction Survey (dernière section avant footer) ===== */}
          <section
            id="observation"
            className="py-16 lg:py-24 bg-gray-50"
          >
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
              <Reveal direction="up">
                <SurveyForm />
              </Reveal>
            </div>
          </section>
        </main>

        {/* ===== Contact & Footer Section ===== */}
        {clinicData && (
          <section
            id="nos-contacts"
            className="w-full py-12 lg:py-16 bg-gray-900 text-white"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
              <Reveal direction="up">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  Contact et Horaires
                </h2>
                <p className="text-lg text-gray-200 mb-10">
                  Nous sommes là pour vous aider. Contactez-nous ou prenez
                  rendez-vous.
                </p>
              </Reveal>

              {/* Map */}
              <Reveal direction="up" delay={0.05}>
                {mapEmbedUrl && (
                  <div className="mb-12 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                    <iframe
                      title="Cabinet Dentaire Ivoire — Localisation"
                      src={mapEmbedUrl}
                      width="100%"
                      height="380"
                      style={{ border: 0, display: "block" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}
                {clinicData?.googlelocationurl && (
                  <div className="mb-12 text-center">
                    <a
                      href={clinicData.googlelocationurl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold py-2.5 px-7 rounded-full shadow-lg hover:bg-primary-700 hover:scale-105 transition-all duration-300"
                    >
                      <MapPinIcon className="w-5 h-5" />
                      Obtenir l'itinéraire
                    </a>
                  </div>
                )}
              </Reveal>

              {/* Contact grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 text-left">
                <Reveal direction="up" delay={0.05}>
                  <div className="flex flex-col gap-4 p-6 bg-gray-800/60 rounded-2xl border border-gray-700 hover:border-primary-500/40 hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
                      <MdLocationOn size={24} className="text-primary-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Adresse</p>
                      <p className="text-gray-300">{clinicData?.address}</p>
                    </div>
                  </div>
                </Reveal>

                <Reveal direction="up" delay={0.15}>
                  <div className="flex flex-col gap-4 p-6 bg-gray-800/60 rounded-2xl border border-gray-700 hover:border-primary-500/40 hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
                      <MdOutlineAttachEmail size={24} className="text-primary-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Email</p>
                      <a
                        href={`mailto:${clinicData?.email}`}
                        className="text-gray-300 hover:text-primary-400 transition-colors"
                      >
                        {clinicData?.email}
                      </a>
                    </div>
                  </div>
                </Reveal>

                <Reveal direction="up" delay={0.25}>
                  <div className="flex flex-col gap-4 p-6 bg-gray-800/60 rounded-2xl border border-gray-700 hover:border-primary-500/40 hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/15 flex items-center justify-center shrink-0">
                      <MdPhone size={24} className="text-primary-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Téléphone</p>
                      {[
                        clinicData?.telephone,
                        clinicData?.telephonemobile,
                        clinicData?.telephonemobile2,
                      ]
                        .filter(Boolean)
                        .flatMap((entry) => entry.split("/").map((n) => n.trim()))
                        .filter(Boolean)
                        .map((number, index) => (
                          <a
                            key={index}
                            href={`tel:${number.replace(/\s+/g, "")}`}
                            className="text-gray-300 hover:text-primary-400 font-medium transition-colors block"
                          >
                            {number}
                          </a>
                        ))}
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Social links */}
              <Reveal direction="up" delay={0.1}>
                <div className="mb-12">
                  <h3 className="text-2xl font-semibold mb-6">Suivez-nous</h3>
                  <div className="flex flex-wrap justify-center items-center gap-4">
                    <a
                      href={`https://wa.me/${clinicData?.telephonemobile?.replace(/\s+/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-gray-800 hover:bg-primary-500/20 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                    >
                      <WhatsAppIcon className="w-6 h-6" />
                      <span>Whatsapp</span>
                    </a>
                    {/* <a
                      href={`https://wa.me/${clinicData?.telephonemobile2?.replace(/\s+/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-gray-800 hover:bg-primary-500/20 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                    >
                      <WhatsAppIcon className="w-6 h-6" />
                      <span>{clinicData?.telephonemobile2}</span>
                    </a> */}
                    {(clinicData?.telegram || TELEGRAM_URL) && (
                      <a
                        href={clinicData?.telegram || TELEGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-gray-800 hover:bg-primary-500/20 text-white px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                      >
                        <TelegramIcon className="w-6 h-6" />
                        <span>Telegram</span>
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>

              <Reveal direction="up" delay={0.15}>
                <OpeningHours clinicData={clinicData} />
              </Reveal>

              {/* Footer enrichi */}
              <div className="mt-12 border-t border-gray-700 pt-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8 text-left">
                  {/* Liens rapides */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Navigation</p>
                    <ul className="space-y-2">
                      {[
                        { label: "Accueil", to: "hero" },
                        { label: "Nos soins", to: "book-appointment" },
                        { label: "Prendre rendez-vous", to: "book-appointment" },
                        { label: "Assurances", to: "assurance" },
                        { label: "Contact", to: "nos-contacts" },
                      ].map((l) => (
                        <li key={l.label}>
                          <ScrollLink
                            to={l.to}
                            smooth
                            duration={500}
                            offset={-70}
                            className="text-sm text-gray-400 hover:text-primary-400 cursor-pointer transition-colors"
                          >
                            {l.label}
                          </ScrollLink>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Contact rapide */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Contact</p>
                    <ul className="space-y-2">
                      {clinicData.telephone && (
                        <li>
                          <a href={`tel:${clinicData.telephone.replace(/\s/g, "")}`} className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2">
                            <MdPhone size={14} /> {clinicData.telephone}
                          </a>
                        </li>
                      )}
                      {clinicData.telephonemobile && (
                        <li>
                          <a href={`tel:${clinicData.telephonemobile.replace(/\s/g, "")}`} className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2">
                            <MdPhone size={14} /> {clinicData.telephonemobile}
                          </a>
                        </li>
                      )}
                      {clinicData.email && (
                        <li>
                          <a href={`mailto:${clinicData.email}`} className="text-sm text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2">
                            <MdOutlineAttachEmail size={14} /> {clinicData.email}
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Réseaux sociaux */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Suivez-nous</p>
                    <div className="flex flex-wrap gap-3">
                      {clinicData.telephonemobile && (
                        <a href={`https://wa.me/${clinicData.telephonemobile.replace(/\s/g, "")}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors">
                          <WhatsAppIcon className="w-5 h-5" /> WhatsApp
                        </a>
                      )}
                      {(clinicData.telegram || TELEGRAM_URL) && (
                        <a href={clinicData.telegram || TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors">
                          <TelegramIcon className="w-5 h-5" /> Telegram
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Copyright */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 border-t border-gray-800 pt-6">
                  <p>© {new Date().getUTCFullYear()} {clinicData.name}. Tous droits réservés.</p>
                  <a href="/login" className="text-gray-500 hover:text-primary-400 transition-colors">
                    Espace professionnel
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Scroll to Top */}
        {scrolling && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 bg-black dark:bg-gray-700 hover:bg-primary-600 dark:hover:bg-primary-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 transform hover:scale-110"
            aria-label="Scroll to top"
          >
            <ArrowUpIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </>
  );
}
