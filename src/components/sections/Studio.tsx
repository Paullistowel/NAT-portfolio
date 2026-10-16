import { LazyViewer } from "@/components/viewer/LazyViewer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { models } from "@/content/models";

export function Studio() {
  return (
    <section id="studio" aria-labelledby="studio-title" className="relative border-t border-line bg-graphite py-24 md:py-36">
      <div className="container-x">
        <SectionHeading index="02" eyebrow="3D Studio" title={<span id="studio-title">Inspect the models.</span>}>
          These are the original STL exports, rendered live in your browser — not images. Rotate, zoom and pan, switch to
          wireframe or edge inspection, and jump between standard engineering views.
        </SectionHeading>
        <LazyViewer models={models} variant="studio" />
      </div>
    </section>
  );
}
