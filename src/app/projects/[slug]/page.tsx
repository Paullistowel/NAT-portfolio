import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Carousel } from "@/components/Carousel";
import { VideoPlayer } from "@/components/sections/VideoShowcase";
import { CinematicReveal } from "@/components/ui/CinematicReveal";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { LazyViewer } from "@/components/viewer/LazyViewer";
import { projectCover } from "@/components/sections/SelectedWorks";
import { modelsForProject } from "@/content/models";
import { getProject, projects } from "@/content/projects";
import { site } from "@/content/site";
import { availableVideos } from "@/lib/assets";
import { showPlaceholders } from "@/lib/placeholders";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const cover = projectCover(p);
  return {
    title: p.title,
    description: p.summary,
    openGraph: { title: p.title, description: p.summary, images: cover ? [{ url: cover.src, alt: cover.alt }] : undefined },
  };
}

const FILE = "src/content/projects.ts";

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.indexOf(project);
  const next = projects[(idx + 1) % projects.length];
  const models = modelsForProject(project.slug);
  const videos = availableVideos(site.videos, project.slug);

  const tools = project.tools?.join(", ") ?? null;
  const media = [
    `${project.images.length} image${project.images.length === 1 ? "" : "s"}`,
    models.length && `${models.length} 3D model${models.length > 1 ? "s" : ""}`,
    videos.length && `${videos.length} video${videos.length > 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");
  // Rows with no content show a placeholder in development and are omitted in production.
  const meta = [
    { label: "Category", value: project.category, hint: "" },
    { label: "Tools", value: tools, hint: "Tools used" },
    { label: "Contribution", value: project.contribution, hint: "Your specific contribution" },
    { label: "Media", value: media, hint: "" },
  ].filter((m) => m.value || showPlaceholders);

  return (
    <article className="pt-16">
      <header className="container-x pt-14 pb-14 md:pt-24 md:pb-20">
        <Link href="/#projects" className="eyebrow inline-flex items-center gap-2 hover:text-fg">
          <ArrowLeft size={13} /> All work
        </Link>
        <Reveal className="mt-10 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <div className="eyebrow mb-5">
              <span className="text-fg">{String(idx + 1).padStart(2, "0")}</span> <span className="mx-2 text-faint">/</span> {project.category}
            </div>
            <h1 className="text-[clamp(2.4rem,5.6vw,5rem)] leading-[0.98] font-medium tracking-[-0.045em] text-balance">{project.title}</h1>
            <p className="mt-7 max-w-2xl text-[clamp(1.05rem,1.6vw,1.3rem)] leading-relaxed text-muted">{project.summary}</p>
          </div>
          <dl className="self-end border-t border-line md:col-span-4">
            {meta.map((m) => (
              <div key={m.label} className="grid grid-cols-[110px_1fr] gap-4 border-b border-line py-3.5 text-[14px]">
                <dt className="eyebrow pt-0.5">{m.label}</dt>
                <dd className="text-fg/90">{m.value ?? <Placeholder label={m.hint} file={FILE} />}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </header>

      {project.images.length > 0 && (
        <section aria-label="Images" className="container-x">
          <CinematicReveal>
            <Carousel images={project.images} label={project.title} priority stageClassName="aspect-[4/3] md:aspect-[16/10]" />
          </CinematicReveal>
        </section>
      )}

      {(showPlaceholders || project.objective || project.process.length > 0 || project.outcome) && (
        <section className="container-x grid gap-12 py-20 md:grid-cols-12 md:py-28">
          <Reveal className="md:col-span-3">
            <h2 className="eyebrow">Design brief</h2>
          </Reveal>
          <Reveal className="space-y-10 md:col-span-8 md:col-start-5">
            {(project.objective || showPlaceholders) && (
              <div>
                <h3 className="mb-3 text-[17px] font-medium">Objective</h3>
                {project.objective ? (
                  <p className="text-[15px] leading-relaxed text-muted">{project.objective}</p>
                ) : (
                  <Placeholder label="Design objective" file={FILE} />
                )}
              </div>
            )}
            {project.process.length > 0 && (
              <div>
                <h3 className="mb-4 text-[17px] font-medium">Process & technical decisions</h3>
                <ol className="divide-y divide-line border-y border-line">
                  {project.process.map((step, i) => (
                    <li key={step} className="grid grid-cols-[40px_1fr] gap-4 py-4 text-[15px] leading-relaxed text-muted">
                      <span className="font-mono text-[11px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {(project.outcome || showPlaceholders) && (
              <div>
                <h3 className="mb-3 text-[17px] font-medium">Result</h3>
                {project.outcome ? (
                  <p className="text-[15px] leading-relaxed text-muted">{project.outcome}</p>
                ) : (
                  <Placeholder label="Final result / outcome" file={FILE} />
                )}
              </div>
            )}
          </Reveal>
        </section>
      )}

      {models.length > 0 && (
        <section aria-labelledby="project-model" className="band border-y border-line py-20 md:py-28">
          <div className="container-x">
            <Reveal className="mb-10 flex items-end justify-between gap-6">
              <h2 id="project-model" className="text-[clamp(1.6rem,3vw,2.4rem)] font-medium tracking-[-0.03em]">
                Interactive model
              </h2>
              <span className="eyebrow hidden sm:block">Original STL · rendered live</span>
            </Reveal>
            <CinematicReveal>
              <LazyViewer models={models} variant="embed" />
            </CinematicReveal>
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section aria-labelledby="project-video" className="container-x py-20 md:py-28">
          <Reveal className="mb-10">
            <h2 id="project-video" className="text-[clamp(1.6rem,3vw,2.4rem)] font-medium tracking-[-0.03em]">
              In motion
            </h2>
          </Reveal>
          <CinematicReveal>
            <VideoPlayer videos={videos} compact />
          </CinematicReveal>
        </section>
      )}

      <nav aria-label="Next project" className="border-t border-line">
        <Link href={`/projects/${next.slug}`} className="group container-x flex items-center justify-between gap-6 py-14 md:py-20">
          <div>
            <div className="eyebrow mb-3">Next project</div>
            <div className="text-[clamp(1.8rem,4vw,3.4rem)] leading-none font-medium tracking-[-0.035em] transition-colors group-hover:text-silver">
              {next.title}
            </div>
          </div>
          <ArrowRight size={28} strokeWidth={1.25} className="shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
      </nav>
    </article>
  );
}
