import React, { useEffect, useState } from "react";
import logo from "../constantimages/logo.png";
import { navItems } from "../constants";
import { normalizeFileUrl } from "../utils/config";
import { Menu, X, LogIn, Phone } from "lucide-react";
import { clinicPublic } from "../services/cdiService";
import { Link as ScrollLink } from "react-scroll";

function Navbar() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [record, setRecord] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    clinicPublic().then((res) => setRecord(res.data)).catch(() => {});

    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = () => setMobileDrawerOpen(false);

  return (
    <>
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700"
          : "bg-gray-900/70 backdrop-blur-sm border-b border-white/10"
      }`}
    >
      <div className="container px-4 mx-auto">
        <div className="flex justify-between items-center h-16">

          {/* Logo + Clinic name */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full object-cover shadow"
              src={record?.logo ? normalizeFileUrl(record.logo) : logo}
              alt="Logo"
            />
            {record && (
              <span
                className={`text-lg font-bold tracking-tight transition-colors duration-300 ${
                  scrolled ? "text-gray-800 dark:text-white" : "text-white drop-shadow"
                }`}
              >
                {record.name}
              </span>
            )}
          </div>

          {/* Desktop nav links */}
          <ul className="hidden lg:flex items-center gap-8">
            {navItems.map((item, index) => (
              <li key={index}>
                <ScrollLink
                  to={item.href.replace("#", "")}
                  smooth={true}
                  duration={500}
                  offset={-70}
                  className={`cursor-pointer text-sm font-medium transition-colors duration-200 hover:text-primary-400 relative group ${
                    scrolled
                      ? "text-gray-700 dark:text-gray-200"
                      : "text-white/90"
                  }`}
                >
                  {item.label}
                  {/* Underline hover effect */}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-400 group-hover:w-full transition-all duration-300 rounded-full" />
                </ScrollLink>
              </li>
            ))}
          </ul>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="/login"
              className="flex items-center gap-2 text-sm font-semibold py-2 px-5 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/30 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <LogIn size={15} />
              Connexion
            </a>
          </div>

          {/* Mobile: hamburger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className={`p-2 rounded-lg transition-colors ${
                scrolled
                  ? "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label="Toggle menu"
            >
              {mobileDrawerOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

      </div>
    </nav>

      {/* ── Mobile full-screen overlay menu (outside <nav> to escape its stacking context) ── */}
      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-all duration-300 ease-in-out ${
          mobileDrawerOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeMobile}
        />

        {/* Slide-in panel from right */}
        <div
          className={`absolute top-0 right-0 h-full w-4/5 max-w-xs bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
            mobileDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <img
                className="h-9 w-9 rounded-full object-cover shadow"
                src={record?.logo ? normalizeFileUrl(record.logo) : logo}
                alt="Logo"
              />
              <span className="text-sm font-bold text-gray-800 dark:text-white leading-tight">
                {record?.name || "Cabinet Dentaire"}
              </span>
            </div>
            <button
              onClick={closeMobile}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-1">
            {navItems.map((item, index) => (
              <ScrollLink
                key={index}
                to={item.href.replace("#", "")}
                smooth={true}
                duration={500}
                offset={-70}
                onClick={closeMobile}
                className="cursor-pointer flex items-center text-gray-700 dark:text-gray-200 font-medium text-base py-3.5 px-4 rounded-xl hover:bg-primary-50 hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {item.label}
              </ScrollLink>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="px-4 pb-8 pt-4 border-t border-gray-100 flex flex-col gap-3">
            {/* Bouton appel rapide */}
            {record?.telephonemobile && (
              <a
                href={`tel:${record.telephonemobile.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 text-sm font-semibold py-3 px-5 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors w-full"
              >
                <Phone size={16} />
                Appeler maintenant
              </a>
            )}
            <a
              href="/login"
              onClick={closeMobile}
              className="flex items-center justify-center gap-2 text-sm font-semibold py-3 px-5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors shadow-md w-full"
            >
              <LogIn size={16} />
              Connexion
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
