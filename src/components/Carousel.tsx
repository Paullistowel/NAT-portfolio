"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ProjectImage } from "@/content/projects";

const SWIPE = 60;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Image carousel: large active image with direction-aware transitions, clickable thumbnails,
 * arrow / keyboard / swipe navigation and a fullscreen lightbox. Images keep their aspect ratio
 * on a paper plate and are never scaled beyond their native width.
 */
export function Carousel({
  images,
  label,
  stageClassName = "aspect-[16/10]",
  priority = false,
}: {
  images: ProjectImage[];
  /** Accessible name, e.g. the project title. */
  label: string;
  stageClassName?: string;
  priority?: boolean;
}) {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [lightbox, setLightbox] = useState(false);
  const reduce = useReducedMotion();
  const thumbs = useRef<HTMLDivElement>(null);
  const count = images.length;

  const go = useCallback(
    (next: number) =>
      setState(([cur]) => {
        const target = (next + count) % count;
        return [target, target === cur ? 0 : next > cur ? 1 : -1];
      }),
    [count],
  );
  const step = useCallback((d: 1 | -1) => setState(([cur]) => [(cur + d + count) % count, d]), [count]);

  // Reset when the image set changes (e.g. switching project in a grouped gallery).
  const key = images.map((i) => i.src).join("|");
  const [prevKey, setPrevKey] = useState(key);
  if (key !== prevKey) {
    setPrevKey(key);
    setState([0, 0]);
  }

  // Keep the active thumbnail in view by scrolling only the strip (scrollIntoView would also move the page).
  useEffect(() => {
    const strip = thumbs.current;
    const el = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !el) return;
    const left = el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2;
    strip.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [index, reduce]);

  if (count === 0) return null;
  const img = images[index];

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    }
    if (e.key === "Enter" && e.target === e.currentTarget) {
      // Consume the key: the lightbox focuses its close button, which would otherwise receive this Enter.
      e.preventDefault();
      setLightbox(true);
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE) step(1);
    else if (info.offset.x > SWIPE) step(-1);
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 60, scale: reduce ? 1 : 0.985 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -60, scale: reduce ? 1 : 0.985 }),
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${label} — images`}
      tabIndex={0}
      onKeyDown={onKey}
      className="group/car outline-none focus-visible:ring-1 focus-visible:ring-silver/60"
    >
      {/* Stage */}
      <div className={`relative overflow-hidden bg-paper ${stageClassName}`}>
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={img.src}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={onDragEnd}
            className="absolute inset-0 flex cursor-grab items-center justify-center bg-paper active:cursor-grabbing"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}: ${img.caption ?? img.alt}`}
          >
            <div className="relative h-full w-full" style={{ maxWidth: img.width, maxHeight: img.height }}>
              <Image
                src={img.src}
                alt={img.alt}
                fill
                draggable={false}
                quality={90}
                preload={priority && index === 0}
                sizes="(min-width:1280px) 1100px, (min-width:768px) 80vw, 100vw"
                className="pointer-events-none object-contain p-3 mix-blend-multiply transition-transform duration-[1.2s] ease-out select-none group-hover/car:scale-[1.025] md:p-6"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Preload neighbours so navigation feels instant */}
        {count > 1 && (
          <div className="hidden" aria-hidden>
            {[images[(index + 1) % count], images[(index - 1 + count) % count]].map((n) => (
              <Image key={n.src} src={n.src} alt="" width={n.width} height={n.height} quality={90} sizes="(min-width:1280px) 1100px, 100vw" />
            ))}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent" />

        {count > 1 && (
          <>
            <StageButton side="left" label="Previous image" onClick={() => step(-1)} />
            <StageButton side="right" label="Next image" onClick={() => step(1)} />
          </>
        )}
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Open fullscreen"
          className="absolute top-3 right-3 grid h-10 w-10 place-items-center border border-black/10 bg-white/80 text-ink opacity-100 backdrop-blur transition-opacity hover:bg-white md:opacity-0 md:group-hover/car:opacity-100 md:focus-visible:opacity-100"
        >
          <Maximize2 size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Caption + counter */}
      <div className="flex items-baseline justify-between gap-4 py-3 font-mono text-[10px] tracking-[0.14em] uppercase">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={img.src}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-muted"
          >
            {img.caption ?? img.alt}
          </motion.span>
        </AnimatePresence>
        <span className="shrink-0 text-faint" aria-live="polite">
          <span className="text-fg">{pad(index + 1)}</span> / {pad(count)}
        </span>
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div ref={thumbs} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Select image">
          {images.map((t, i) => (
            <button
              key={t.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show image ${i + 1}: ${t.caption ?? t.alt}`}
              onClick={() => go(i)}
              className={`relative h-14 w-20 shrink-0 overflow-hidden bg-paper transition-[opacity,outline-color] duration-300 sm:h-16 sm:w-24 ${
                i === index ? "opacity-100 outline outline-1 outline-offset-2 outline-silver" : "opacity-45 hover:opacity-80"
              }`}
            >
              <Image src={t.src} alt="" fill sizes="96px" className="object-contain p-1 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}

      {lightbox && <Lightbox images={images} index={index} onIndex={go} onClose={() => setLightbox(false)} />}
    </div>
  );
}

function StageButton({ side, label, onClick }: { side: "left" | "right"; label: string; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 ${side === "left" ? "left-3" : "right-3"} grid h-11 w-11 -translate-y-1/2 place-items-center border border-black/10 bg-white/80 text-ink backdrop-blur transition-all duration-300 hover:bg-white md:opacity-0 md:group-hover/car:opacity-100 md:focus-visible:opacity-100 ${
        side === "left" ? "md:-translate-x-2 md:group-hover/car:translate-x-0" : "md:translate-x-2 md:group-hover/car:translate-x-0"
      }`}
    >
      <Icon size={18} strokeWidth={1.5} />
    </button>
  );
}

/** Fullscreen viewer with keyboard, swipe and thumbnail navigation. Rendered in a portal. */
function Lightbox({
  images,
  index,
  onIndex,
  onClose,
}: {
  images: ProjectImage[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const img = images[index];
  const count = images.length;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex(index + 1);
      if (e.key === "ArrowLeft") onIndex(index - 1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [index, onIndex, onClose]);

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={img.caption ?? img.alt}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[80] flex flex-col bg-ink/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 p-4 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
        <span className="truncate">
          <span className="text-fg">{pad(index + 1)}</span> / {pad(count)} · {img.caption ?? img.alt}
        </span>
        <button ref={closeRef} onClick={onClose} aria-label="Close fullscreen" className="grid h-10 w-10 shrink-0 place-items-center hover:text-fg">
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-16" onClick={onClose}>
        <motion.div
          key={img.src}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          drag={count > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -SWIPE) onIndex(index + 1);
            else if (info.offset.x > SWIPE) onIndex(index - 1);
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-full max-w-full items-center justify-center bg-paper"
        >
          <Image
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            quality={90}
            sizes="100vw"
            draggable={false}
            className="h-auto max-h-[calc(100dvh-11rem)] w-auto max-w-full object-contain mix-blend-multiply select-none"
          />
        </motion.div>
        {count > 1 && (
          <>
            <button
              onClick={(e) => (e.stopPropagation(), onIndex(index - 1))}
              aria-label="Previous image"
              className="absolute top-1/2 left-2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-line bg-ink/70 text-muted hover:text-fg md:left-4"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={(e) => (e.stopPropagation(), onIndex(index + 1))}
              aria-label="Next image"
              className="absolute top-1/2 right-2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-line bg-ink/70 text-muted hover:text-fg md:right-4"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto p-4">
          {images.map((t, i) => (
            <button
              key={t.src}
              onClick={() => onIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={`relative h-12 w-16 shrink-0 overflow-hidden bg-paper ${i === index ? "outline outline-1 outline-offset-2 outline-silver" : "opacity-40 hover:opacity-80"}`}
            >
              <Image src={t.src} alt="" fill sizes="64px" className="object-contain p-0.5 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}
    </motion.div>,
    document.body,
  );
}
