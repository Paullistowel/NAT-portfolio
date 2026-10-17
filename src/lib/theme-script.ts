/** Shared by the server layout and the client theme store (no "use client" — must stay a plain module). */
export const THEME_KEY = "theme";

/**
 * Runs before first paint (see layout.tsx): applies the saved theme, or the system preference
 * when the visitor hasn't chosen one, so there's no flash of the wrong theme.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.dataset.theme=t}catch(e){}})();`;
