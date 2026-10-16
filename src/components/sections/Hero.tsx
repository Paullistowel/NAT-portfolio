"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { HeroModel } from "@/components/viewer/LazyViewer";
import type { ModelEntry } from "@/content/models";
import { site } from "@/content/site";

export function Hero({ model }: { model: ModelEntry }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "expo.out", duration: 1.4 } })
          .fromTo("[data-hero='rule']", { scaleX: 0 }, { scaleX: 1, duration: 1.6, transformOrigin: "left" })
          .fromTo("[data-hero='line']", { yPercent: 110, autoAlpha: 1 }, { yPercent: 0, stagger: 0.09 }, 0.15)
          .fromTo("[data-hero='fade']", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 1.1 }, 0.55);
        // Gentle parallax: the model drifts slower than the copy as the hero scrolls away.
        const onScroll = () => {
          const y = Math.min(window.scrollY, window.innerHeight);
          gsap.set("[data-hero='model']", { y: y * 0.25 });
          gsap.set("[data-hero='copy']", { y: y * -0.05, autoAlpha: 1 - y / (window.innerHeight * 0.9) });
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-hero='line'], [data-hero='fade']", { autoAlpha: 1, yPercent: 0, y: 0 });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={root}
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-16"
    >
      <div className="blueprint-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_45%,black_20%,transparent_75%)]" />
      <div className="pointer-events-none absolute top-[10%] right-[-10%] h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgba(201,205,211,0.10)_0%,transparent_65%)]" />

      <div className="container-x relative grid flex-1 grid-rows-[auto_1fr] gap-8 lg:grid-cols-12 lg:grid-rows-1 lg:items-center">
        {/* Copy */}
        <div data-hero="copy" className="relative z-10 pt-10 lg:col-span-6 lg:pt-0 xl:col-span-5">
          <div data-hero="fade" className="hero-anim eyebrow mb-8 flex items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 bg-fg" />
            {site.roles.join("  |  ")}
          </div>
          <h1 id="hero-title" className="sr-only">
            {site.name} — {site.headline}
          </h1>
          <div aria-hidden className="text-[clamp(4.5rem,13vw,10.5rem)] leading-[0.82] font-semibold tracking-[-0.06em]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-hero="line" className="hero-anim block">
                {site.name}
              </span>
            </span>
          </div>
          <div data-hero="rule" className="my-8 h-px w-full max-w-md bg-line-strong" />
          <p aria-hidden className="max-w-xl text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.05] font-medium tracking-[-0.03em] text-balance">
            {site.headline.split(" ").reduce<string[][]>((rows, w, i) => {
              const r = Math.floor(i / 3);
              (rows[r] ??= []).push(w);
              return rows;
            }, []).map((row, i) => (
              <span key={i} className="block overflow-hidden pb-[0.04em]">
                <span data-hero="line" className="hero-anim block">
                  {row.join(" ")}
                </span>
              </span>
            ))}
          </p>
          <p data-hero="fade" className="hero-anim mt-6 max-w-md text-[15px] leading-relaxed text-muted">
            {site.intro}
          </p>
          <div data-hero="fade" className="hero-anim mt-9 flex flex-wrap gap-3">
            <a href="#projects" className="btn-primary group">
              Explore My Work
              <ArrowRight size={16} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#resume" className="btn-ghost">
              View My Resume
            </a>
          </div>
        </div>

        {/* Model */}
        <div
          data-hero="model"
          className="relative -mx-4 h-[46vh] min-h-[300px] sm:mx-0 lg:absolute lg:inset-y-0 lg:right-0 lg:left-[38%] lg:h-auto"
        >
          <HeroModel model={model} />
          <div data-hero="fade" className="hero-anim pointer-events-none absolute right-4 bottom-6 text-right font-mono text-[10px] leading-5 tracking-[0.16em] text-faint uppercase sm:right-0 lg:bottom-24">
            <div className="text-muted">Live model · {model.file.split("/").pop()}</div>
            <div>{model.title}</div>
          </div>
        </div>
      </div>

      <a
        href="#projects"
        data-hero="fade"
        className="hero-anim container-x relative z-10 flex items-center gap-4 pb-8 font-mono text-[10px] tracking-[0.2em] text-faint uppercase hover:text-fg"
        aria-label="Scroll to selected works"
      >
        <span className="relative block h-10 w-px overflow-hidden bg-line">
          <span className="animate-scroll-cue absolute inset-x-0 top-0 h-1/2 bg-fg" />
        </span>
        Scroll <ArrowDown size={12} />
      </a>
    </section>
  );
}
