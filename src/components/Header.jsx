import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import { IoChevronDown, IoLogOutOutline, IoMenu } from "react-icons/io5";
import { useSidebar } from "../context/SidebarContext";

// Custom hook to detect clicks outside of a component
const useClickAway = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
};

export default function Header() {
  const [currentUser] = useState(authService.getCurrentUser());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { setOpen } = useSidebar();

  // Use the custom hook to close the menu when clicking outside
  useClickAway(menuRef, () => setIsMenuOpen(false));

  const logout = () => {
    authService.logout(); // Clear user session
    navigate("/");
    window.location.reload(); // Force a reload to clear all state
  };

  const userEmail = currentUser?.body?.email || "guest@example.com";
  const userName = userEmail.split("@")[0]; // Simple way to get a display name

  return (
    <header className="sticky w-full top-0 bg-gray-900 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">
          {/* Header: Left side */}
          <div className="flex items-center space-x-4">
            {/* Hamburger button (visible on mobile) */}
            <button
              className="text-gray-300 hover:text-white lg:hidden"
              aria-controls="sidebar"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
            >
              <span className="sr-only">Open sidebar</span>
              <IoMenu size={24} />
            </button>

            {/* You can add a search bar or breadcrumbs here for desktop view */}
            {/* <div className="hidden lg:block"> Search... </div> */}
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            <div className="relative inline-flex" ref={menuRef}>
              <button
                className="inline-flex justify-center items-center group"
                aria-haspopup="true"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <img
                  className="w-8 h-8 rounded-full cursor-pointer"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userName
                  )}&background=white&color=0369A1&size=128`}
                  width="32"
                  height="32"
                  alt="User"
                />
                <div className="flex items-center truncate ml-2">
                  <span className="truncate cursor-pointer text-sm font-medium text-white dark:text-gray-300 group-hover:text-primary-800 dark:group-hover:text-white">
                    {userName}
                  </span>
                  <IoChevronDown className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400" />
                </div>
              </button>

              {/* --- Dropdown Menu --- */}
              {isMenuOpen && (
                <div className="origin-top-right z-10 absolute top-full right-0 min-w-[180px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1">
                  <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium cursor-pointer text-gray-800 dark:text-gray-100 capitalize">
                      {userName}
                    </div>
                    <div className="text-xs cursor-pointer text-gray-500 dark:text-gray-400 italic">
                      {currentUser?.body?.roles[0]}
                    </div>
                  </div>
                  <ul>
                    <li>
                      <button
                        className="font-medium cursor-pointer text-sm text-red-500 hover:text-red-600 flex items-center py-1 px-3 w-full"
                        onClick={logout}
                      >
                        <IoLogOutOutline className="mr-2" />
                        <span>Sign Out</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
