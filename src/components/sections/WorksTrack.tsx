"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Box, Images } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type WorkCard = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  cover: { src: string; alt: string; width: number; height: number };
  imageCount: number;
  hasModel: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Featured projects as a horizontal gallery. On large screens it's pinned and driven by vertical
 * scroll (with gentle in-panel image parallax); on touch / small screens / reduced motion it's a
 * native swipeable, snap-scrolling row — no scroll hijacking.
 */
export function WorksTrack({ cards }: { cards: WorkCard[] }) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        // Pinned mode drives the row with transforms, so native horizontal scrolling is switched off
        // only while this media query matches (reduced motion / small screens keep the swipeable row).
        el.scrollLeft = 0;
        el.classList.add("is-pinned");
        const distance = () => el.scrollWidth - window.innerWidth;
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
              setCurrent(Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1))));
            },
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -5 },
            { xPercent: 5, ease: "none", scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true } },
          );
        });
        return () => el.classList.remove("is-pinned");
      });
    }, section);
    // Images change layout height once decoded; recompute pin distances.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [cards.length]);

  // Native-scroll fallback: track the centred card for the counter.
  const onScroll = (e: React.UIEvent<HTMLOListElement>) => {
    const el = e.currentTarget;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    const p = el.scrollLeft / max;
    if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    setCurrent(Math.round(p * (cards.length - 1)));
  };

  return (
    <div ref={section} className="relative flex flex-col justify-center overflow-hidden lg:h-screen">
      <div className="container-x mb-6 flex items-end justify-between gap-6 lg:mb-8">
        <p className="max-w-md text-[14px] leading-relaxed text-muted">
          Scroll or swipe through the work — select a project for the full story, images and model.
        </p>
        <div className="shrink-0 font-mono text-[11px] tracking-[0.16em] text-faint" aria-live="polite">
          <span className="text-fg">{pad(current + 1)}</span> / {pad(cards.length)}
        </div>
      </div>

      <ol
        ref={track}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-8 lg:gap-8 lg:px-12 [&.is-pinned]:snap-none [&.is-pinned]:overflow-visible [&.is-pinned]:pb-0 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {cards.map((c, i) => (
          <li key={c.slug} className="w-[86vw] shrink-0 snap-center sm:w-[70vw] lg:w-[min(58vw,860px)]">
            <Link href={`/projects/${c.slug}`} className="group block" aria-label={`View project: ${c.title}`}>
              <div className="relative aspect-[16/11] overflow-hidden bg-paper">
                <div data-parallax className="absolute -inset-x-[6%] inset-y-0 bg-paper">
                  <Image
                    src={c.cover.src}
                    alt={c.cover.alt}
                    fill
                    sizes="(min-width:1024px) 60vw, 86vw"
                    className="object-contain p-6 mix-blend-multiply transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04] md:p-10"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5 ring-inset" />
                <div className="absolute top-4 left-4 font-mono text-[11px] tracking-[0.16em] text-ink/70">{pad(i + 1)}</div>
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <span className="flex items-center gap-1.5 bg-ink/80 px-2 py-1 font-mono text-[10px] tracking-[0.1em] text-fg uppercase backdrop-blur">
                    <Images size={11} strokeWidth={1.5} /> {c.imageCount}
                  </span>
                  {c.hasModel && (
                    <span className="flex items-center gap-1.5 bg-ink/80 px-2 py-1 font-mono text-[10px] tracking-[0.1em] text-fg uppercase backdrop-blur">
                      <Box size={11} strokeWidth={1.5} /> 3D
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:gap-8">
                <div>
                  <div className="eyebrow mb-2">{c.category}</div>
                  <h3 className="text-[clamp(1.4rem,2.2vw,2.1rem)] leading-[1.05] font-medium tracking-[-0.03em]">{c.title}</h3>
                  <p className="mt-3 line-clamp-2 max-w-xl text-[14px] leading-relaxed text-muted">{c.summary}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center self-start border border-line-strong transition-colors duration-300 group-hover:border-fg group-hover:bg-fg group-hover:text-ink">
                  <ArrowUpRight size={18} strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>

      <div className="container-x mt-6 lg:mt-10">
        <div className="h-px w-full bg-line">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-fg" />
        </div>
      </div>
    </div>
  );
}
