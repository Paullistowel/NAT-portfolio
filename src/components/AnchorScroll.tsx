"use client";

import { useEffect } from "react";

const OFFSET = 72; // fixed header height + breathing room

/**
 * Smooth in-page navigation that lands accurately. Layout can shift while a smooth scroll is in
 * flight (lazy viewers mounting, the pinned gallery recalculating as images load), so after the
 * scroll settles we re-measure the target and correct if it moved.
 */
export function AnchorScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const targetTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY - (el.id === "home" ? 0 : OFFSET);

    const go = (el: HTMLElement, attempt = 0) => {
      window.scrollTo({ top: targetTop(el), behavior: reduce.matches || attempt > 0 ? "auto" : "smooth" });
      let done = false;
      const settle = () => {
        if (done) return;
        done = true;
        window.removeEventListener("scrollend", settle);
        if (attempt < 2 && Math.abs(el.getBoundingClientRect().top - (el.id === "home" ? 0 : OFFSET)) > 8) go(el, attempt + 1);
      };
      window.addEventListener("scrollend", settle, { once: true });
      window.setTimeout(settle, 1600); // browsers without `scrollend`
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      history.pushState(null, "", url.hash);
      go(el);
    };

    // Capture phase so we run before the browser's default jump; React handlers (e.g. closing
    // the mobile menu) still run because we don't stop propagation.
    window.addEventListener("click", onClick, { capture: true });
    return () => window.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
