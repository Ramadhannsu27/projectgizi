"use client";

import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={theme === "light" ? "Mode Gelap" : "Mode Terang"}
      className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}
