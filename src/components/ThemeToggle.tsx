"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { followSystemTheme, setTheme, useTheme } from "@/lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  useEffect(followSystemTheme, []);

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`group relative grid h-9 w-9 place-items-center border border-line text-muted transition-colors hover:border-line-strong hover:text-fg ${className}`}
    >
      {/* Both icons are rendered; CSS picks one from data-theme, so the server markup never mismatches. */}
      <Sun size={15} strokeWidth={1.5} aria-hidden className="theme-icon-sun transition-transform duration-500 group-hover:rotate-45" />
      <Moon size={15} strokeWidth={1.5} aria-hidden className="theme-icon-moon absolute transition-transform duration-500 group-hover:-rotate-12" />
    </button>
  );
}
