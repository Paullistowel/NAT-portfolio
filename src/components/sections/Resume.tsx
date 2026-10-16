import Link from "next/link";
import { ArrowUpRight, Download, Mail } from "lucide-react";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export function Resume({ hasResumeFile }: { hasResumeFile: boolean }) {
  const { resume, contact } = site;
  const links = [
    contact.linkedin && { label: "LinkedIn", href: contact.linkedin },
    contact.github && { label: "GitHub", href: contact.github },
    ...contact.other,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <section id="resume" aria-labelledby="resume-title" className="border-t border-line bg-graphite py-24 md:py-36">
      <div className="container-x">
        <SectionHeading index="06" eyebrow="Resume" title={<span id="resume-title">Open to internships, graduate and CAD roles.</span>} />

        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-4 md:col-start-1">
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              {hasResumeFile ? (
                <a href={resume.file} download className="btn-primary justify-between">
                  Download Resume <span className="font-mono text-[10px] opacity-60">PDF</span>
                  <Download size={16} strokeWidth={1.5} />
                </a>
              ) : (
                <>
                  <button disabled className="btn-primary justify-between" aria-describedby="resume-missing">
                    Download Resume <Download size={16} strokeWidth={1.5} />
                  </button>
                  <span id="resume-missing" className="text-[13px] text-faint">
                    Resume available on request.
                  </span>
                  <Placeholder label="Add your CV as public/documents/resume.pdf — the button activates automatically" file="public/documents/" />
                </>
              )}
              <a href="#contact" className="btn-ghost justify-between">
                Contact me about opportunities <Mail size={16} strokeWidth={1.5} />
              </a>
            </div>
            {links.length > 0 && (
              <ul className="mt-10 border-t border-line">
                {links.map((l) => (
                  <li key={l.href} className="border-b border-line">
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between py-4 text-[15px]">
                      {l.label}
                      <ArrowUpRight size={16} strokeWidth={1.5} className="text-faint transition-colors group-hover:text-fg" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {links.length === 0 && (
              <div className="mt-6">
                <Placeholder label="LinkedIn / GitHub URLs (contact.linkedin, contact.github)" />
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-7 md:col-start-6">
            <dl className="divide-y divide-line border-y border-line">
              <Row label="Summary">
                {resume.summary ?? (
                  <>
                    <p>{site.intro}</p>
                    <div className="mt-3">
                      <Placeholder label="Professional summary (resume.summary)" />
                    </div>
                  </>
                )}
              </Row>
              <Row label="Education">
                {site.about.education ?? <Placeholder label="Education & qualifications (about.education, resume.qualifications)" />}
                {resume.qualifications.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {resume.qualifications.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                )}
              </Row>
              <Row label="Technical skills">
                <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {site.software.concat(site.skills.map((s) => s.category)).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </Row>
              <Row label="Projects">
                <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                  {projects.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/projects/${p.slug}`} className="border-b border-transparent hover:border-fg">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Row>
              {site.about.experience && <Row label="Experience">{site.about.experience}</Row>}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 py-6 sm:grid-cols-[170px_1fr]">
      <dt className="eyebrow pt-0.5">{label}</dt>
      <dd className="text-[15px] leading-relaxed text-fg/90">{children}</dd>
    </div>
  );
}
