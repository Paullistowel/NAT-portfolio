"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { navItems, site } from "@/content/site";

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [active, setActive] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section occupying the upper-middle band of the viewport.
  useEffect(() => {
    if (!onHome) return;
    const sections = navItems
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [onHome]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  const currentId = onHome ? active : pathname.startsWith("/projects") ? "projects" : "";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled || open ? "border-b border-line bg-ink/75 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <motion.div aria-hidden style={{ scaleX: progress }} className="absolute inset-x-0 bottom-0 h-px origin-left bg-silver/70" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-fg focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <nav aria-label="Primary" className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="group flex items-baseline gap-3" onClick={() => setOpen(false)}>
          <span className="text-[15px] font-semibold tracking-[0.28em]">{site.name}</span>
          <span className="hidden font-mono text-[10px] tracking-[0.2em] text-faint uppercase transition-colors group-hover:text-muted sm:inline">
            Portfolio
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = currentId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={href(item.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative px-3 py-2 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors ${
                    isActive ? "text-fg" : "text-faint hover:text-fg"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-0.5 h-px bg-fg"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2 lg:ml-3">
        <ThemeToggle />
        <button
          type="button"
          className="relative -mr-2 flex h-10 w-10 items-center justify-center lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`absolute h-px w-5 bg-fg transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
          <span className={`absolute h-px w-5 bg-fg transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
        </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - 4rem)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <ul className="container-x flex flex-col pt-6">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-line"
                >
                  <a
                    href={href(item.id)}
                    onClick={() => setOpen(false)}
                    className={`flex items-baseline justify-between py-4 text-3xl font-medium tracking-[-0.02em] ${
                      currentId === item.id ? "text-fg" : "text-muted"
                    }`}
                  >
                    {item.label}
                    <span className="font-mono text-[11px] tracking-[0.2em] text-faint">0{i + 1}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
