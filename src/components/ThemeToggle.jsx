import { Sun, Moon } from "lucide-react";
import React, { useState, useEffect } from "react";

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (storedTheme) {
      if (storedTheme === "dark") {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove("dark");
      }
    } else {
      if (prefersDark) {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove("dark");
      }
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (!localStorage.getItem("theme")) {
        if (e.matches) {
          setIsDarkMode(true);
          document.documentElement.classList.add("dark");
        } else {
          setIsDarkMode(false);
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors duration-300 focus:outline-none flex items-center justify-center"
    >
      {isDarkMode ? (
        <Sun className="h-6 w-6 text-yellow-300" />
      ) : (
        <Moon className="h-6 w-6 text-blue-900" />
      )}
    </button>
  );
};

export default ThemeToggle;