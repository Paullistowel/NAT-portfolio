import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="border-t border-line bg-graphite py-24 md:py-36">
      <div className="container-x">
        <SectionHeading index="04" eyebrow="Skills & Tools" title={<span id="skills-title">Tools of the trade.</span>}>
          Skills demonstrated across the projects on this site.
        </SectionHeading>

        <div className="grid gap-px bg-line md:grid-cols-2 lg:grid-cols-4">
          {site.skills.map((group, gi) => (
            <Reveal key={group.category} delay={gi * 0.06} className="bg-graphite p-6 md:p-8">
              <div className="mb-6 flex items-baseline justify-between">
                <h3 className="text-[15px] font-medium tracking-[-0.01em]">{group.category}</h3>
                <span className="font-mono text-[10px] text-faint">{String(gi + 1).padStart(2, "0")}</span>
              </div>
              <ul className="space-y-3">
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

        <Reveal className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-line pb-6">
          <span className="eyebrow">Software</span>
          {site.software.map((s) => (
            <span key={s} className="text-[15px] font-medium tracking-[-0.01em]">
              {s}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
