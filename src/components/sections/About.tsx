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

  const fields: { label: string; value: string | null; hint: string }[] = [
    { label: "Education", value: about.education, hint: "Add your education (institution, programme, dates)" },
    { label: "Experience", value: about.experience, hint: "Add relevant experience" },
    { label: "Career objective", value: about.objective, hint: "Add the roles you're looking for" },
  ];

  return (
    <section id="about" aria-labelledby="about-title" className="container-x py-24 md:py-36">
      <SectionHeading index="03" eyebrow="About" title={<span id="about-title">Methodical, precise, detail-driven.</span>} />

      <div className="grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-7 md:col-start-4">
          {about.introduction ? (
            <p className="text-[clamp(1.15rem,1.8vw,1.45rem)] leading-[1.5] tracking-[-0.01em] text-fg/90">{about.introduction}</p>
          ) : (
            <div className="space-y-4">
              <p className="text-[clamp(1.15rem,1.8vw,1.45rem)] leading-[1.5] tracking-[-0.01em] text-fg/90">{site.intro}</p>
              <Placeholder label="Professional introduction (about.introduction)" />
            </div>
          )}

          <dl className="mt-12 divide-y divide-line border-y border-line">
            <div className="grid gap-2 py-5 sm:grid-cols-[200px_1fr]">
              <dt className="eyebrow pt-0.5">Technical interests</dt>
              <dd className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-fg/90">
                {about.interests.map((i) => (
                  <span key={i}>{i}</span>
                ))}
              </dd>
            </div>
            {fields.map((f) =>
              f.value ? (
                <div key={f.label} className="grid gap-2 py-5 sm:grid-cols-[200px_1fr]">
                  <dt className="eyebrow pt-0.5">{f.label}</dt>
                  <dd className="text-[15px] leading-relaxed text-fg/90">{f.value}</dd>
                </div>
              ) : (
                <Placeholder key={f.label} label={f.hint} />
              ),
            )}
          </dl>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-2 md:col-start-11">
          <ul className="grid grid-cols-3 gap-6 md:grid-cols-1 md:gap-10">
            {facts.map((f) => (
              <li key={f.label}>
                <div className="text-[clamp(2.2rem,4vw,3.4rem)] leading-none font-medium tracking-[-0.04em]">
                  {String(f.value).padStart(2, "0")}
                </div>
                <div className="mt-2 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">{f.label}</div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
