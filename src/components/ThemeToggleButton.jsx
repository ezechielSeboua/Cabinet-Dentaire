import React from "react";
// import { useTheme } from "../context/ThemeContext";
// import { SunIcon, MoonIcon } from "./ui/Icons"; // Adjust path to your icons
import { useTheme } from "../context/ThemeContext";
import { MoonIcon, SunIcon } from "lucide-react";

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <MoonIcon className="w-6 h-6" />
      ) : (
        <SunIcon className="w-6 h-6" />
      )}
    </button>
  );
};

export default ThemeToggleButton;
