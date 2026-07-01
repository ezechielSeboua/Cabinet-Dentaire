import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BsArrowLeftShort, BsFillGridFill } from "react-icons/bs";
import { MdOutlineDashboard, MdExpandMore } from "react-icons/md";
import * as authService from "../services/authService";
import { admin, doc, cas, acc, patient } from "./Data/NewSidebarData";
import { clinicPublic } from "../services/cdiService";
import { useSidebar } from "../context/SidebarContext";

const ROLE_LABEL = {
  ADMIN: "Administrateur",
  DOCTOR: "Médecin dentiste",
  CASHIER: "Caissier",
  ACCOUNTANT: "Comptable",
  PATIENT: "Patient",
};

const getMenuItems = (currentUser) => {
  if (!currentUser) return [];
  const role = currentUser.body.roles[0]?.toString();
  return (
    {
      ADMIN: admin,
      DOCTOR: doc,
      CASHIER: cas,
      ACCOUNTANT: acc,
      PATIENT: patient,
    }[role] || []
  );
};

// ── Sub-menu item ─────────────────────────────────────────────────────────────
const SubMenuItem = ({ menu, open, isMobile, setOpen }) => (
  <NavLink
    to={menu.path}
    title={!open ? menu.title : undefined}
    className={({ isActive }) =>
      `flex items-center gap-3 pl-10 pr-3 py-2 mx-2 rounded-lg text-sm transition-all duration-150
       hover:bg-primary-800/70 hover:text-white
       ${
         isActive
           ? "bg-primary-700 text-white font-semibold border-l-2 border-primary-300"
           : "text-gray-400"
       }`
    }
    onClick={() => isMobile && setOpen(false)}
  >
    <span className="text-base text-primary-400 flex-shrink-0">
      {menu.icon || <MdOutlineDashboard />}
    </span>
    <span
      className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${open ? "opacity-100 w-auto" : "w-0 opacity-0"}`}
    >
      {menu.title}
    </span>
  </NavLink>
);

// ── Menu item ─────────────────────────────────────────────────────────────────
const MenuItem = ({
  menu,
  open,
  isMobile,
  setOpen,
  expandedMenus,
  toggleMenu,
}) => {
  const location = useLocation();
  const hasChildren = Boolean(menu.children?.length);
  const isExpanded = expandedMenus.has(menu.title);
  const isChildActive =
    hasChildren && menu.children.some((c) => location.pathname === c.path);

  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => toggleMenu(menu.title)}
          title={!open ? menu.title : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 my-0.5 mx-2 rounded-lg transition-all duration-150
            hover:bg-primary-800/70 hover:text-white text-gray-300
            ${isChildActive ? "bg-primary-800/50 text-white border-l-2 border-primary-400" : ""}
          `}
          style={{ width: "calc(100% - 1rem)" }}
        >
          <span className="text-xl text-primary-400 flex-shrink-0">
            {menu.icon || <MdOutlineDashboard />}
          </span>
          <span
            className={`flex-1 text-left text-sm overflow-hidden whitespace-nowrap transition-all duration-200 ${open ? "opacity-100 w-auto" : "w-0 opacity-0"}`}
          >
            {menu.title}
          </span>
          {open && (
            <MdExpandMore
              className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              size={18}
            />
          )}
        </button>

        <div
          className={`overflow-hidden transition-all duration-200 ${isExpanded && open ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="flex flex-col gap-0.5 mt-0.5 mb-1">
            {menu.children.map((child, i) => (
              <SubMenuItem
                key={i}
                menu={child}
                open={open}
                isMobile={isMobile}
                setOpen={setOpen}
              />
            ))}
          </div>
        </div>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={menu.path}
        title={!open ? menu.title : undefined}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 my-0.5 mx-2 rounded-lg text-sm transition-all duration-150
           hover:bg-primary-800/70 hover:text-white
           ${
             isActive
               ? "bg-primary-700 text-white font-semibold border-l-2 border-primary-300"
               : "text-gray-300"
           }`
        }
        onClick={() => isMobile && setOpen(false)}
      >
        <span className="text-xl text-primary-400 flex-shrink-0">
          {menu.icon || <MdOutlineDashboard />}
        </span>
        <span
          className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${open ? "opacity-100 w-auto" : "w-0 opacity-0"}`}
        >
          {menu.title}
        </span>
      </NavLink>
    </li>
  );
};

// ── Sidebar header ────────────────────────────────────────────────────────────
const SidebarHeader = ({ open, setOpen, clinicName }) => (
  <div className="flex items-center justify-between px-3 py-3 h-14 border-b border-gray-700/60">
    <div
      className={`flex items-center gap-2.5 overflow-hidden transition-all duration-200 ${open ? "w-44" : "w-0"}`}
    >
      <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
        <BsFillGridFill size={14} className="text-white" />
      </div>
      <span className="text-sm font-bold text-white whitespace-nowrap truncate">
        {clinicName || "Cabinet"}
      </span>
    </div>
    <button
      onClick={() => setOpen(!open)}
      className="p-1.5 rounded-lg hover:bg-gray-700 flex-shrink-0 transition-colors"
      title={open ? "Réduire" : "Agrandir"}
    >
      <BsArrowLeftShort
        className={`text-2xl text-gray-300 transition-transform duration-300 ${!open ? "rotate-180" : ""}`}
      />
    </button>
  </div>
);

// ── User profile footer ───────────────────────────────────────────────────────
const UserFooter = ({ open, currentUser }) => {
  const name = currentUser?.body
    ? `${currentUser.body.firstname || ""} ${currentUser.body.lastname || ""}`.trim()
    : "";
  const role = currentUser?.body?.roles?.[0]?.toString() || "";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="border-t border-gray-700/60 p-3">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
          {initials || "?"}
        </div>
        <div
          className={`overflow-hidden transition-all duration-200 ${open ? "opacity-100 w-auto" : "w-0 opacity-0"}`}
        >
          <p className="text-sm font-semibold text-white whitespace-nowrap truncate">
            {name || "Utilisateur"}
          </p>
          <p className="text-xs text-primary-400 whitespace-nowrap">
            {ROLE_LABEL[role] || role}
          </p>
        </div>
      </div>
      {open && (
        <p className="text-xs text-gray-600 text-center mt-3">
          © {new Date().getFullYear()}
        </p>
      )}
    </div>
  );
};

// ── Main sidebar ──────────────────────────────────────────────────────────────
function SideBar2() {
  const [currentUser] = useState(authService.getCurrentUser());
  const { open, setOpen, isMobile } = useSidebar();
  const menuItems = getMenuItems(currentUser);
  const [clinicName, setClinicName] = useState("");
  const [expandedMenus, setExpandedMenus] = useState(new Set());

  const toggleMenu = (title) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  useEffect(() => {
    clinicPublic().then((res) => setClinicName(res.data?.name || ""));
  }, []);

  return (
    <>
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`
          fixed top-0 left-0 h-full bg-gray-900 text-white flex flex-col z-20
          transition-all duration-300 ease-in-out
          ${
            isMobile
              ? open
                ? "translate-x-0 w-64 shadow-2xl"
                : "-translate-x-full w-64"
              : open
                ? "w-64"
                : "w-16"
          }
        `}
      >
        <SidebarHeader open={open} setOpen={setOpen} clinicName={clinicName} />

        <nav className="flex-grow overflow-y-auto overflow-x-hidden py-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {currentUser && (
            <ul className="space-y-0.5">
              {menuItems.map((menu, i) => (
                <MenuItem
                  key={i}
                  menu={menu}
                  open={open}
                  isMobile={isMobile}
                  setOpen={setOpen}
                  expandedMenus={expandedMenus}
                  toggleMenu={toggleMenu}
                />
              ))}
            </ul>
          )}
        </nav>

        <UserFooter open={open} currentUser={currentUser} />
      </div>
    </>
  );
}

export default SideBar2;
