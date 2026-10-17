"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";

export function Process() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The connecting rule draws itself as the sequence scrolls into view; steps follow it.
        gsap.fromTo(
          "[data-process='rule']",
          { scaleX: 0, scaleY: 0 },
          {
            scaleX: 1,
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 60%", scrub: 0.6 },
          },
        );
        gsap.utils.toArray<HTMLElement>("[data-process='step']").forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0.15, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } },
          );
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section aria-labelledby="process-title" className="container-x py-24 md:py-36">
      <SectionHeading index="06" eyebrow="Design Process" title={<span id="process-title">From brief to finished design.</span>}>
        How I approach a design task. Not every project passes through every stage — validation, for example, depends on
        what the design needs.
      </SectionHeading>

      <div ref={root} className="relative">
        {/* Horizontal rule on large screens, vertical on small */}
        <div aria-hidden className="absolute top-[7px] right-0 left-0 hidden h-px bg-line lg:block">
          <div data-process="rule" className="h-full origin-left bg-fg" />
        </div>
        <div aria-hidden className="absolute top-0 bottom-0 left-[3.5px] w-px bg-line lg:hidden">
          <div data-process="rule" className="h-full w-full origin-top bg-fg" />
        </div>

        <ol className="grid gap-10 lg:grid-cols-6 lg:gap-6">
          {site.process.map((step, i) => (
            <li key={step.title} data-process="step" className="relative pl-8 lg:pt-10 lg:pl-0">
              <span aria-hidden className="absolute top-1 left-0 h-2 w-2 bg-fg lg:top-[3px]" />
              <div className="font-mono text-[11px] tracking-[0.16em] text-faint">{String(i + 1).padStart(2, "0")}</div>
              <h3 className="mt-3 text-[17px] leading-snug font-medium tracking-[-0.01em]">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
