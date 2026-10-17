import { CinematicReveal } from "@/components/ui/CinematicReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LazyViewer } from "@/components/viewer/LazyViewer";
import { models } from "@/content/models";

export function Studio() {
  return (
    <section id="studio" aria-labelledby="studio-title" className="band relative border-y border-line py-24 md:py-36">
      <div className="container-x">
        <SectionHeading index="03" eyebrow="3D Studio" title={<span id="studio-title">Inspect every model.</span>}>
          All {models.length} models are the original STL exports, rendered live in your browser — not images. Pick one
          from the gallery, then rotate, zoom and pan, switch to wireframe or edge inspection, and jump between standard
          engineering views.
        </SectionHeading>
        <CinematicReveal>
          <LazyViewer models={models} variant="studio" linkProjects />
        </CinematicReveal>
      </div>
    </section>
  );
}
