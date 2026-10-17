import { Award } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="band border-y border-line py-24 md:py-36">
      <div className="container-x">
        <SectionHeading index="05" eyebrow="Skills & Tools" title={<span id="skills-title">Tools of the trade.</span>}>
          From CAD and product design through simulation, electronics and code.
        </SectionHeading>

        <Reveal className="mb-12 flex flex-wrap gap-2">
          {site.software.map((s) => (
            <span key={s} className="border border-line-strong bg-tint/[0.02] px-3.5 py-2 text-[14px] font-medium tracking-[-0.01em]">
              {s}
            </span>
          ))}
        </Reveal>

        <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-5">
          {site.skills.map((group, gi) => (
            <Reveal key={group.category} delay={gi * 0.05} className="bg-graphite/80 p-6">
              <div className="mb-5 flex items-baseline justify-between">
                <h3 className="text-[15px] font-medium tracking-[-0.01em]">{group.category}</h3>
                <span className="font-mono text-[10px] text-faint">{String(gi + 1).padStart(2, "0")}</span>
              </div>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.name} className="text-[14px] leading-snug text-muted">
                    <div className="flex items-start gap-3">
                      <span className="mt-[0.55em] h-px w-3 shrink-0 bg-line-strong" />
                      <span>{item.name}</span>
                    </div>
                    {item.level != null && (
                      <div className="mt-2 ml-6 h-px bg-line" aria-label={`Proficiency ${Math.round(item.level * 100)}%`}>
                        <div className="h-full bg-silver" style={{ width: `${item.level * 100}%` }} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <h3 className="eyebrow flex items-center gap-2">
              <Award size={13} strokeWidth={1.5} /> Certifications & awards
            </h3>
          </Reveal>
          <ul className="md:col-span-9">
            {site.awards.map((a, i) => (
              <Reveal as="li" key={a.title} delay={i * 0.05} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-4 first:border-t">
                <span className="text-[16px] font-medium tracking-[-0.01em]">
                  {[a.org, a.year, a.title].filter(Boolean).join(" ")}
                </span>
                {a.result && <span className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{a.result}</span>}
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
