import { ArrowUpRight } from "lucide-react";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/content/site";
import { ContactForm } from "./ContactForm";

export function Contact({ formEnabled }: { formEnabled: boolean }) {
  const { contact } = site;
  const links = [
    contact.linkedin && { label: "LinkedIn", href: contact.linkedin },
    contact.github && { label: "GitHub", href: contact.github },
    ...contact.other,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <section id="contact" aria-labelledby="contact-title" className="container-x py-24 md:py-36">
      <SectionHeading index="08" eyebrow="Contact" title={<span id="contact-title">Let’s build something precise.</span>}>
        Recruiters, engineering teams and clients — I’d be glad to hear about suitable roles and projects.
      </SectionHeading>

      <div className="grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-4">
          {contact.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="group block border-b border-line pb-4 text-[clamp(1.2rem,2vw,1.6rem)] font-medium tracking-[-0.02em] break-all"
            >
              {contact.email}
              <ArrowUpRight size={18} strokeWidth={1.5} className="ml-2 inline text-faint transition-colors group-hover:text-fg" />
            </a>
          ) : (
            <Placeholder label="Email address (contact.email)" />
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="mt-4 block text-[15px] text-muted hover:text-fg">
              {contact.phone}
            </a>
          )}
          {site.location && <p className="mt-1 font-mono text-[11px] tracking-[0.14em] text-faint uppercase">{site.location}</p>}
          {links.length > 0 && (
            <ul className="mt-6 space-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[15px] text-muted hover:text-fg">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
        <Reveal delay={0.1} className="md:col-span-7 md:col-start-6">
          <ContactForm enabled={formEnabled} fallbackEmail={contact.email} />
        </Reveal>
      </div>
    </section>
  );
}
