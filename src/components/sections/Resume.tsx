import Link from "next/link";
import { ArrowUpRight, Download, FileText, Mail } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";

export function Resume({ hasResumeFile }: { hasResumeFile: boolean }) {
  const { contact, about } = site;
  const links = [
    contact.linkedin && { label: "LinkedIn", href: contact.linkedin },
    contact.github && { label: "GitHub", href: contact.github },
    ...contact.other,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <section id="resume" aria-labelledby="resume-title" className="band border-y border-line py-24 md:py-36">
      <div className="container-x">
        <SectionHeading index="07" eyebrow="Resume" title={<span id="resume-title">Open to internships, graduate and engineering roles.</span>} />

        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            {/* CV card */}
            <div className="border border-line-strong bg-tint/[0.02] p-6">
              <FileText size={22} strokeWidth={1.25} className="text-muted" />
              <p className="mt-5 text-[19px] font-medium tracking-[-0.02em]">{site.fullName}</p>
              <p className="mt-1 text-[14px] text-muted">
                {site.professionalTitle} · {site.specialisms.slice(1).join(" · ")}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {hasResumeFile ? (
                  <a href={site.resume.file} download className="btn-primary justify-between">
                    Download Resume <span className="font-mono text-[10px] opacity-60">PDF</span>
                    <Download size={16} strokeWidth={1.5} />
                  </a>
                ) : (
                  <span className="text-[13px] text-faint">Resume available on request.</span>
                )}
                {hasResumeFile && (
                  <a href={site.resume.file} target="_blank" rel="noopener noreferrer" className="btn-ghost justify-between">
                    View in browser <ArrowUpRight size={16} strokeWidth={1.5} />
                  </a>
                )}
              </div>
            </div>

            <a href="#contact" className="group mt-6 flex items-center justify-between border-b border-line py-4 text-[15px]">
              <span className="flex items-center gap-3">
                <Mail size={16} strokeWidth={1.5} className="text-muted" /> Contact me about opportunities
              </span>
              <ArrowUpRight size={16} strokeWidth={1.5} className="text-faint transition-colors group-hover:text-fg" />
            </a>
            {links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between border-b border-line py-4 text-[15px]">
                {l.label}
                <ArrowUpRight size={16} strokeWidth={1.5} className="text-faint transition-colors group-hover:text-fg" />
              </a>
            ))}
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-7 md:col-start-6">
            <dl className="divide-y divide-line border-y border-line">
              <Row label="Summary">{about.introduction}</Row>
              <Row label="Education">
                <p className="font-medium">{about.education.degree}</p>
                <p className="text-muted">
                  {about.education.institution} · {about.education.period}
                </p>
              </Row>
              <Row label="Experience">
                <ul className="space-y-2">
                  {about.experience.map((x) => (
                    <li key={x.org}>
                      <span className="font-medium">{x.role}</span> <span className="text-muted">— {x.org}</span>
                      {x.period && <span className="ml-2 font-mono text-[11px] text-faint">{x.period}</span>}
                    </li>
                  ))}
                </ul>
              </Row>
              <Row label="Projects">
                <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                  {site.cvProjects.map((p) => (
                    <li key={p.title}>
                      {p.slug ? (
                        <Link href={`/projects/${p.slug}`} className="inline-flex items-center gap-1 border-b border-line-strong hover:border-fg">
                          {p.title} <ArrowUpRight size={12} strokeWidth={1.5} />
                        </Link>
                      ) : (
                        <span className="text-fg/80">{p.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Row>
              <Row label="Awards">
                <ul className="space-y-1.5">
                  {site.awards.map((a) => (
                    <li key={a.title}>
                      {[a.org, a.year, a.title].filter(Boolean).join(" ")}
                      {a.result && <span className="text-muted"> — {a.result}</span>}
                    </li>
                  ))}
                </ul>
              </Row>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 py-6 sm:grid-cols-[150px_1fr]">
      <dt className="eyebrow pt-0.5">{label}</dt>
      <dd className="text-[15px] leading-relaxed text-fg/90">{children}</dd>
    </div>
  );
}
