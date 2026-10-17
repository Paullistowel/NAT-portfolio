"use client";

import { ArrowDown, ArrowRight, Download, Move3d } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroModel } from "@/components/viewer/LazyViewer";
import type { HeroModelInfo } from "@/components/viewer/HeroModel";
import type { ModelEntry } from "@/content/models";
import { site } from "@/content/site";

type Props = {
  models: ModelEntry[];
  stats: { label: string; value: number }[];
  heroVideo: { src: string; poster?: string } | null;
  hasResume: boolean;
};

const fmt = (n: number) => (n >= 100 ? Math.round(n).toString() : n.toFixed(1));

export function Hero({ models, stats, heroVideo, hasResume }: Props) {
  const root = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState(models[0].id);
  const [info, setInfo] = useState<HeroModelInfo | null>(null);
  const active = models.find((m) => m.id === activeId) ?? models[0];
  const onReady = useCallback((i: HeroModelInfo) => setInfo(i), []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "expo.out", duration: 1.4 } })
          .fromTo("[data-hero='frame']", { clipPath: "inset(12% 12% 12% 12%)", autoAlpha: 0 }, { clipPath: "inset(0% 0% 0% 0%)", autoAlpha: 1, duration: 1.8 }, 0)
          .fromTo("[data-hero='line']", { yPercent: 115, autoAlpha: 1 }, { yPercent: 0, stagger: 0.08 }, 0.1)
          .fromTo("[data-hero='fade']", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 1.1 }, 0.45)
          .fromTo("[data-hero='rule']", { scaleX: 0 }, { scaleX: 1, duration: 1.6, transformOrigin: "left" }, 0.3);

        // Hand-off into the projects: copy lifts away, the model recedes, as the hero scrolls out.
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 } })
          .to("[data-hero='copy']", { y: -90, autoAlpha: 0, ease: "none" }, 0)
          .to("[data-hero='stage']", { y: 120, scale: 0.88, autoAlpha: 0.2, ease: "none" }, 0)
          .to("[data-hero='bar']", { autoAlpha: 0, y: 30, ease: "none" }, 0);
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-hero='line'], [data-hero='fade'], [data-hero='frame']", { autoAlpha: 1, yPercent: 0, y: 0, clipPath: "none" });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const words = site.headline.split(" ");
  const lines = [words.slice(0, 2).join(" "), words.slice(2).join(" ")];

  return (
    <section id="home" ref={root} aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col overflow-hidden pt-16">
      {heroVideo && <HeroVideo {...heroVideo} />}

      <div className="container-x relative grid flex-1 grid-cols-1 items-center gap-6 pt-8 pb-6 lg:grid-cols-12 lg:gap-8 lg:pt-6">
        {/* Copy */}
        <div data-hero="copy" className="relative z-10 lg:col-span-6 xl:col-span-6">
          <div data-hero="fade" className="hero-anim mb-7 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-2.5 border border-line-strong px-2.5 py-1 font-mono text-[10px] tracking-[0.22em] text-fg uppercase">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping bg-silver/60 motion-reduce:hidden" />
                <span className="relative inline-flex h-1.5 w-1.5 bg-fg" />
              </span>
              {site.name} — Portfolio
            </span>
            <span className="eyebrow">{site.professionalTitle}</span>
          </div>

          <h1 id="hero-title" className="text-[clamp(2.7rem,5.4vw,5.4rem)] leading-[0.95] font-semibold tracking-[-0.05em]">
            {lines.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.07em]">
                <span
                  data-hero="line"
                  className={`hero-anim block ${i === 1 ? "bg-gradient-to-r from-fg via-silver to-faint bg-clip-text text-transparent" : ""}`}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <div data-hero="rule" className="my-7 h-px w-full max-w-lg bg-gradient-to-r from-line-strong via-line to-transparent" />

          <p data-hero="fade" className="hero-anim max-w-md text-[clamp(1rem,1.3vw,1.15rem)] leading-relaxed text-muted">
            {site.intro}
          </p>

          <div data-hero="fade" className="hero-anim mt-9 flex flex-wrap gap-3">
            <a href="#projects" className="btn-primary group">
              Explore My Work
              <ArrowRight size={16} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            {hasResume ? (
              <a href="#resume" className="btn-ghost group">
                View My Resume <Download size={15} strokeWidth={1.5} className="opacity-60 transition-opacity group-hover:opacity-100" />
              </a>
            ) : (
              <a href="#resume" className="btn-ghost">
                View My Resume
              </a>
            )}
          </div>

          <p data-hero="fade" className="hero-anim mt-10 font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
            {site.roles.join("  ·  ")}
          </p>
        </div>

        {/* Live model stage */}
        <div data-hero="stage" className="relative lg:col-span-6 xl:col-span-6">
          <div data-hero="frame" className="hero-anim relative -mx-4 h-[52vh] min-h-[320px] sm:mx-0 lg:h-[70vh]">
            {/* Technical frame */}
            <div aria-hidden className="pointer-events-none absolute inset-0 border border-line">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,var(--glow),transparent_65%)]" />
              {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "right-0 bottom-0 border-r border-b"].map((c) => (
                <span key={c} className={`absolute h-4 w-4 border-silver/50 ${c}`} />
              ))}
              <span className="absolute top-1/2 left-0 h-px w-3 bg-line-strong" />
              <span className="absolute top-1/2 right-0 h-px w-3 bg-line-strong" />
              <span className="absolute top-0 left-1/2 h-3 w-px bg-line-strong" />
              <span className="absolute bottom-0 left-1/2 h-3 w-px bg-line-strong" />
            </div>

            <HeroModel model={active} onReady={onReady} />

            {/* Live readout */}
            <div className="pointer-events-none absolute top-4 left-4 font-mono text-[10px] leading-5 tracking-[0.16em] text-faint uppercase">
              <div className="text-muted">Live STL · {active.file.split("/").pop()}</div>
              <div>{info ? `${info.triangles.toLocaleString("en-US")} tris` : "—"}</div>
              <div title="Bounding box in the STL's native units">{info ? `Envelope ${info.dimensions.map(fmt).join(" × ")}` : ""}</div>
            </div>
            <div className="pointer-events-none absolute top-4 right-4 hidden items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-faint uppercase lg:flex">
              <Move3d size={13} strokeWidth={1.5} /> Drag to rotate
            </div>

            {/* Model switcher */}
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="eyebrow">Now showing</div>
                <div className="mt-1 truncate text-[15px] font-medium tracking-[-0.01em]">{active.title.split(" — ")[0]}</div>
              </div>
              <div role="group" aria-label="Switch hero model" className="flex shrink-0 gap-1.5">
                {models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveId(m.id)}
                    aria-pressed={m.id === activeId}
                    aria-label={`Show ${m.title}`}
                    className={`relative h-12 w-14 overflow-hidden border bg-ink/60 backdrop-blur transition-colors ${
                      m.id === activeId ? "border-silver/70" : "border-line hover:border-line-strong"
                    }`}
                  >
                    <Image src={m.preview} alt="" fill sizes="56px" className="object-contain p-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar: stats + scroll cue */}
      <div data-hero="bar" className="container-x relative z-10 pb-7">
        <div data-hero="fade" className="hero-anim flex flex-wrap items-end justify-between gap-6 border-t border-line pt-5">
          <dl className="flex gap-8 sm:gap-12">
            {stats.map((s) => (
              <div key={s.label}>
                <dd className="text-2xl font-medium tracking-[-0.03em]">{String(s.value).padStart(2, "0")}</dd>
                <dt className="mt-0.5 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">{s.label}</dt>
              </div>
            ))}
          </dl>
          <a href="#projects" className="group flex items-center gap-4 font-mono text-[10px] tracking-[0.2em] text-faint uppercase hover:text-fg" aria-label="Scroll to selected works">
            Scroll to explore
            <span className="relative block h-10 w-px overflow-hidden bg-line">
              <span className="animate-scroll-cue absolute inset-x-0 top-0 h-1/2 bg-fg" />
            </span>
            <ArrowDown size={12} className="transition-transform group-hover:translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/** Muted, looping background clip (only rendered when the file exists). Static poster under reduced motion. */
function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []); // eslint-disable-line react-hooks/set-state-in-effect
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 opacity-25 mix-blend-luminosity">
      {reduce ? (
        poster && <Image src={poster} alt="" fill className="object-cover" sizes="100vw" />
      ) : (
        <video className="h-full w-full object-cover" src={src} poster={poster} autoPlay muted loop playsInline preload="metadata" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/30 to-ink" />
    </div>
  );
}
