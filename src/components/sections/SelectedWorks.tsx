import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Box } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { modelsForProject } from "@/content/models";
import { projects, type Project } from "@/content/projects";

/** Cover image: the project's own image, else a genuine render captured from its STL. */
export function projectCover(p: Project) {
  if (p.cover) return p.cover;
  const m = modelsForProject(p.slug)[0];
  return m ? { src: m.preview, alt: `Render of the ${p.title} 3D model`, width: 1600, height: 1200 } : null;
}

export function SelectedWorks() {
  // Image-led projects get the large editorial treatment; model-only work goes in the index below.
  const featured = projects.filter((p) => p.featured !== false && p.images.length > 0);
  const more = projects.filter((p) => !featured.includes(p));

  return (
    <section id="projects" aria-labelledby="projects-title" className="container-x py-24 md:py-36">
      <SectionHeading index="01" eyebrow="Selected Works" title={<span id="projects-title">Selected works.</span>}>
        Product enclosures, wearable mechanisms and detailed assemblies — each shown with the renders, drawings and
        models produced during the work.
      </SectionHeading>

      <ol className="flex flex-col gap-24 md:gap-36">
        {featured.map((p, i) => (
          <FeaturedProject key={p.slug} project={p} index={i} />
        ))}
      </ol>

      <Reveal className="mt-28 md:mt-40">
        <div className="eyebrow mb-6 flex items-center justify-between border-b border-line pb-4">
          <span>More work</span>
          <span className="text-faint">{more.length.toString().padStart(2, "0")}</span>
        </div>
        <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {more.map((p) => {
            const cover = projectCover(p);
            const hasModel = modelsForProject(p.slug).length > 0;
            return (
              <li key={p.slug} className="bg-ink">
                <Link href={`/projects/${p.slug}`} className="group block p-4 pb-6">
                  <div className="relative aspect-[4/3] overflow-hidden bg-paper">
                    {cover && (
                      <Image
                        src={cover.src}
                        alt={cover.alt}
                        fill
                        sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                        className="object-contain p-3 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[17px] font-medium tracking-[-0.01em]">{p.title}</h3>
                      <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">{p.category}</p>
                    </div>
                    <span className="flex items-center gap-2 text-faint transition-colors group-hover:text-fg">
                      {hasModel && <Box size={14} strokeWidth={1.5} aria-label="Includes interactive 3D model" />}
                      <ArrowUpRight size={16} strokeWidth={1.5} />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}

function FeaturedProject({ project: p, index }: { project: Project; index: number }) {
  const flip = index % 2 === 1;
  const [main, ...rest] = p.images;
  const secondary = rest.slice(0, 2);
  const hasModel = modelsForProject(p.slug).length > 0;

  return (
    <li>
      <Link href={`/projects/${p.slug}`} className="group grid gap-6 md:grid-cols-12 md:gap-8" aria-label={`View project: ${p.title}`}>
        <Reveal className={`md:col-span-8 ${flip ? "md:order-2" : ""}`}>
          <div className="relative overflow-hidden bg-paper" style={{ aspectRatio: `${main.width} / ${main.height}` }}>
            <Image
              src={main.src}
              alt={main.alt}
              fill
              sizes="(min-width:768px) 66vw, 100vw"
              className="object-contain transition-transform duration-[1.2s] ease-out group-hover:scale-[1.025]"
            />
          </div>
          {secondary.length > 0 && (
            <div className="mt-px grid grid-cols-2 gap-px">
              {secondary.map((img) => (
                <div key={img.src} className="relative aspect-[16/10] overflow-hidden bg-paper">
                  <Image src={img.src} alt={img.alt} fill sizes="(min-width:768px) 33vw, 50vw" className="object-contain" />
                </div>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1} className={`flex flex-col md:col-span-4 ${flip ? "md:order-1" : ""}`}>
          <div className="flex items-center justify-between border-b border-line pb-4 font-mono text-[11px] tracking-[0.16em] text-faint uppercase">
            <span className="text-fg">{String(index + 1).padStart(2, "0")}</span>
            <span>{p.category}</span>
          </div>
          <h3 className="mt-6 text-[clamp(1.8rem,3vw,2.75rem)] leading-[1.02] font-medium tracking-[-0.03em]">{p.title}</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{p.summary}</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-5 font-mono text-[11px] tracking-[0.1em] uppercase">
            <div>
              <dt className="text-faint">Media</dt>
              <dd className="mt-1">{p.images.length} images</dd>
            </div>
            <div>
              <dt className="text-faint">3D model</dt>
              <dd className="mt-1">{hasModel ? "Interactive" : "—"}</dd>
            </div>
          </dl>
          <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium md:mt-auto md:pt-8">
            <span className="border-b border-line-strong pb-0.5 transition-colors group-hover:border-fg">View project</span>
            <ArrowUpRight size={16} strokeWidth={1.5} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </Reveal>
      </Link>
    </li>
  );
}
