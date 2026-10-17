import { GraduationCap, HeartHandshake } from "lucide-react";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { models } from "@/content/models";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export function About() {
  const { about } = site;
  const imageCount = projects.reduce((n, p) => n + p.images.length, 0);
  const facts = [
    { value: projects.length, label: "Projects" },
    { value: models.length, label: "Live STL models" },
    { value: imageCount, label: "Renders & drawings" },
  ];

  return (
    <section id="about" aria-labelledby="about-title" className="container-x py-24 md:py-36">
      <SectionHeading index="04" eyebrow="About" title={<span id="about-title">Methodical, precise, detail-driven.</span>} />

      <div className="grid gap-14 md:grid-cols-12">
        <Reveal className="md:col-span-8 md:col-start-4">
          <p className="text-[clamp(1.15rem,1.75vw,1.45rem)] leading-[1.55] tracking-[-0.01em] text-fg/90">{about.introduction}</p>
          {!about.objective && (
            <div className="mt-4">
              <Placeholder label="Career objective (about.objective) — e.g. the roles you're applying for" />
            </div>
          )}
          {about.objective && <p className="mt-6 text-[15px] leading-relaxed text-muted">{about.objective}</p>}

          <div className="mt-12 grid gap-px bg-line sm:grid-cols-2">
            <div className="bg-ink p-6">
              <GraduationCap size={18} strokeWidth={1.5} className="text-muted" />
              <div className="eyebrow mt-4">Education</div>
              <p className="mt-2 text-[16px] font-medium">{about.education.degree}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">{about.education.institution}</p>
              <p className="mt-2 font-mono text-[11px] tracking-[0.1em] text-faint">{about.education.period}</p>
            </div>
            <div className="bg-ink p-6">
              <HeartHandshake size={18} strokeWidth={1.5} className="text-muted" />
              <div className="eyebrow mt-4">Volunteering</div>
              <p className="mt-2 text-[16px] font-medium">
                {about.volunteering.role}, {about.volunteering.org}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">{about.volunteering.summary}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-3 md:col-start-1 md:row-start-1">
          <ul className="grid grid-cols-3 gap-6 md:grid-cols-1 md:gap-9">
            {facts.map((f) => (
              <li key={f.label}>
                <div className="text-[clamp(2.2rem,4vw,3.4rem)] leading-none font-medium tracking-[-0.04em]">{String(f.value).padStart(2, "0")}</div>
                <div className="mt-2 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">{f.label}</div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* Experience timeline */}
      <div className="mt-24 grid gap-10 md:grid-cols-12">
        <Reveal className="md:col-span-3">
          <h3 className="eyebrow">Experience & leadership</h3>
        </Reveal>
        <ol className="relative md:col-span-9">
          <span aria-hidden className="absolute top-2 bottom-2 left-[3px] w-px bg-line" />
          {about.experience.map((x, i) => (
            <Reveal as="li" key={x.org} delay={i * 0.06} className="relative pb-12 pl-8 last:pb-0">
              <span aria-hidden className="absolute top-2 left-0 h-[7px] w-[7px] bg-fg" />
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h4 className="text-[clamp(1.1rem,1.6vw,1.35rem)] font-medium tracking-[-0.02em]">{x.role}</h4>
                {x.period && <span className="font-mono text-[11px] tracking-[0.12em] text-faint uppercase">{x.period}</span>}
              </div>
              <p className="mt-1 text-[14px] text-muted">{x.org}</p>
              <ul className="mt-4 space-y-2">
                {x.points.map((p) => (
                  <li key={p} className="flex gap-3 text-[14px] leading-relaxed text-fg/80">
                    <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-line-strong" />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
