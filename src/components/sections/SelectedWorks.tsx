import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Box } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { modelsForProject } from "@/content/models";
import { projects, type Project } from "@/content/projects";
import { WorksTrack, type WorkCard } from "./WorksTrack";

/** Cover image: the project's own image, else a genuine render captured from its STL. */
export function projectCover(p: Project) {
  if (p.cover) return p.cover;
  const m = modelsForProject(p.slug)[0];
  return m ? { src: m.preview, alt: `Render of the ${p.title} 3D model`, width: 1600, height: 1200 } : null;
}

export function SelectedWorks() {
  const featured = projects.filter((p) => p.featured !== false && p.images.length > 0);
  const more = projects.filter((p) => !featured.includes(p));
  const cards: WorkCard[] = featured.map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    summary: p.summary,
    cover: projectCover(p)!,
    imageCount: p.images.length,
    hasModel: modelsForProject(p.slug).length > 0,
  }));

  return (
    <section id="projects" aria-labelledby="projects-title" className="relative pt-24 md:pt-36">
      <div className="container-x">
        <SectionHeading index="01" eyebrow="Selected Works" title={<span id="projects-title">Selected works.</span>}>
          Medical devices, wearable mechanisms and detailed mechanical assemblies — each with the renders, drawings and
          live 3D models produced during the work.
        </SectionHeading>
      </div>

      <WorksTrack cards={cards} />

      <Reveal className="container-x mt-20 pb-24 md:mt-28 md:pb-36">
        <div className="eyebrow mb-6 flex items-center justify-between border-b border-line pb-4">
          <span>More work</span>
          <span className="text-faint">{String(more.length).padStart(2, "0")}</span>
        </div>
        <ul className="grid gap-px bg-line sm:grid-cols-3">
          {more.map((p) => {
            const cover = projectCover(p);
            const hasModel = modelsForProject(p.slug).length > 0;
            return (
              <li key={p.slug} className="bg-ink">
                <Link href={`/projects/${p.slug}`} className="group flex items-center gap-4 p-4">
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden bg-[radial-gradient(circle_at_50%_40%,var(--well-from),var(--well-to))]">
                    {cover && (
                      <Image src={cover.src} alt={cover.alt} fill sizes="96px" className="object-contain p-1.5 transition-transform duration-700 group-hover:scale-110" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[16px] font-medium tracking-[-0.01em]">{p.title}</h3>
                    <p className="mt-1 truncate font-mono text-[10px] tracking-[0.14em] text-faint uppercase">{p.category}</p>
                  </div>
                  <span className="flex items-center gap-2 text-faint transition-colors group-hover:text-fg">
                    {hasModel && <Box size={14} strokeWidth={1.5} aria-label="Includes interactive 3D model" />}
                    <ArrowUpRight size={16} strokeWidth={1.5} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
