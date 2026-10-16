"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { ProjectImage } from "@/content/projects";

/** Image-led gallery with varied spans and a keyboard-accessible lightbox. */
export function Gallery({ images }: { images: ProjectImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i == null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (index == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, step]);

  // First image full width; the rest pair up, with an odd trailing image spanning both columns.
  const span = (i: number) => i === 0 || (i === images.length - 1 && (images.length - 1) % 2 === 1);

  return (
    <>
      <ul className="grid gap-px bg-line md:grid-cols-2">
        {images.map((img, i) => (
          <li key={img.src} className={`bg-ink ${span(i) ? "md:col-span-2" : ""}`}>
            <figure>
              {/* Images never scale beyond their native width, so they stay sharp; the paper plate fills the rest. */}
              <div className="bg-paper">
                <button
                  onClick={() => setIndex(i)}
                  className="group relative mx-auto block w-full overflow-hidden"
                  style={{ aspectRatio: `${img.width} / ${img.height}`, maxWidth: img.width }}
                  aria-label={`Enlarge image: ${img.alt}`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes={span(i) ? "100vw" : "(min-width:768px) 50vw, 100vw"}
                    className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    quality={90}
                    preload={i === 0}
                  />
                </button>
              </div>
              {img.caption && (
                <figcaption className="flex justify-between gap-4 px-1 py-3 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
                  <span>{img.caption}</span>
                  <span>
                    {String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                  </span>
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {index != null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={images[index].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink/95 backdrop-blur-sm"
            onClick={close}
          >
            <div className="flex items-center justify-between p-4 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
              <span>
                {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")} · {images[index].caption}
              </span>
              <button autoFocus onClick={close} aria-label="Close" className="grid h-10 w-10 place-items-center hover:text-fg">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 md:p-12" onClick={(e) => e.stopPropagation()}>
              <Image
                src={images[index].src}
                alt={images[index].alt}
                width={images[index].width}
                height={images[index].height}
                sizes="100vw"
                quality={90}
                className="h-auto max-h-full w-auto max-w-full object-contain"
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => step(-1)} aria-label="Previous image" className="absolute top-1/2 left-2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-line bg-ink/70 hover:text-fg">
                    <ChevronLeft size={20} strokeWidth={1.5} />
                  </button>
                  <button onClick={() => step(1)} aria-label="Next image" className="absolute top-1/2 right-2 grid h-12 w-12 -translate-y-1/2 place-items-center border border-line bg-ink/70 hover:text-fg">
                    <ChevronRight size={20} strokeWidth={1.5} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
