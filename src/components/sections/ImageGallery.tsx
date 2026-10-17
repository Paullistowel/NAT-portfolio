"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Carousel } from "@/components/Carousel";
import type { ProjectImage } from "@/content/projects";

export type GalleryGroup = { slug: string; title: string; category: string; summary: string; images: ProjectImage[] };

/** Every project's images in one carousel, grouped by project and switchable without leaving the page. */
export function ImageGallery({ groups }: { groups: GalleryGroup[] }) {
  const [slug, setSlug] = useState(groups[0]?.slug);
  const group = groups.find((g) => g.slug === slug) ?? groups[0];
  if (!group) return null;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="min-w-0 lg:col-span-4">
        <div role="tablist" aria-label="Choose a project" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
          {groups.map((g, i) => {
            const active = g.slug === group.slug;
            return (
              <button
                key={g.slug}
                role="tab"
                aria-selected={active}
                onClick={() => setSlug(g.slug)}
                className={`group/tab flex shrink-0 items-baseline gap-3 border px-3 py-2 text-left transition-colors lg:border-0 lg:border-b lg:border-line lg:px-0 lg:py-3.5 ${
                  active ? "border-silver/60 text-fg" : "border-line text-faint hover:text-muted"
                }`}
              >
                <span className="font-mono text-[10px] tracking-[0.14em]">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[14px] font-medium whitespace-nowrap lg:text-[16px] lg:whitespace-normal">{g.title}</span>
                <span className="ml-auto hidden font-mono text-[10px] text-faint lg:inline">{g.images.length}</span>
                <span
                  aria-hidden
                  className={`hidden h-px bg-fg transition-all duration-500 lg:block ${active ? "w-6" : "w-0"}`}
                />
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={group.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="mt-6 hidden lg:block"
          >
            <div className="eyebrow mb-2">{group.category}</div>
            <p className="text-[14px] leading-relaxed text-muted">{group.summary}</p>
            <Link href={`/projects/${group.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:text-silver">
              <span className="border-b border-line-strong pb-0.5">Open project</span> <ArrowUpRight size={15} strokeWidth={1.5} />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="min-w-0 lg:col-span-8">
        <Carousel images={group.images} label={group.title} />
        <Link href={`/projects/${group.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium lg:hidden">
          <span className="border-b border-line-strong pb-0.5">Open {group.title}</span> <ArrowUpRight size={15} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
