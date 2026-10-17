"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./theme-script";

export type Theme = "light" | "dark";
export { THEME_KEY };

const read = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** Current theme, kept in sync with the <html data-theme> attribute. Renders "dark" on the server. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "dark");
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  root.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // storage unavailable (private mode) — the choice still applies for this visit
  }
  window.setTimeout(() => root.classList.remove("theme-switching"), 400);
}

/** Follow system changes live, but only until the visitor makes an explicit choice. */
export function followSystemTheme() {
  const mq = matchMedia("(prefers-color-scheme: light)");
  const onChange = () => {
    try {
      if (localStorage.getItem(THEME_KEY)) return;
    } catch {}
    document.documentElement.dataset.theme = mq.matches ? "light" : "dark";
  };
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
