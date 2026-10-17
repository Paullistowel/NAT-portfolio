import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { ImageGallery } from "@/components/sections/ImageGallery";
import { Process } from "@/components/sections/Process";
import { Resume } from "@/components/sections/Resume";
import { SelectedWorks } from "@/components/sections/SelectedWorks";
import { Skills } from "@/components/sections/Skills";
import { Studio } from "@/components/sections/Studio";
import { VideoShowcase, VideoSlotNotice } from "@/components/sections/VideoShowcase";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getModel, heroModelId, models } from "@/content/models";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { availableVideos, publicFileExists } from "@/lib/assets";
import { contactConfigured } from "@/lib/contact";
import { showPlaceholders } from "@/lib/placeholders";

/** Light models the hero can switch between (all well under 1 MB compressed). */
const HERO_MODELS = [heroModelId, "harp", "syringe"];

export default function Home() {
  const heroModels = HERO_MODELS.map(getModel).filter((m) => !!m);
  const videos = availableVideos(site.videos);
  const heroVideo = publicFileExists(site.heroVideo.src)
    ? { src: site.heroVideo.src, poster: publicFileExists(site.heroVideo.poster) ? site.heroVideo.poster : undefined }
    : null;
  const hasResume = publicFileExists(site.resume.file);
  const imageCount = projects.reduce((n, p) => n + p.images.length, 0);
  const groups = projects
    .filter((p) => p.images.length > 0)
    .map((p) => ({ slug: p.slug, title: p.shortTitle ?? p.title, category: p.category, summary: p.summary, images: p.images }));

  return (
    <>
      <Hero
        models={heroModels.length ? heroModels : models.slice(0, 1)}
        heroVideo={heroVideo}
        hasResume={hasResume}
        stats={[
          { label: "Projects", value: projects.length },
          { label: "Live 3D models", value: models.length },
          { label: "Renders & drawings", value: imageCount },
        ]}
      />
      <SelectedWorks />
      <section id="gallery" aria-labelledby="gallery-title" className="container-x pb-24 md:pb-36">
        <SectionHeading index="02" eyebrow="Renders & Drawings" title={<span id="gallery-title">Every render, grouped by project.</span>}>
          Select a project, then browse its renders, drawings and CAD screenshots — swipe, use the arrow keys, or open any
          image fullscreen.
        </SectionHeading>
        <ImageGallery groups={groups} />
      </section>
      <Studio />
      {videos.length > 0 ? <VideoShowcase videos={videos} /> : showPlaceholders && <VideoSlotNotice />}
      <About />
      <Skills />
      <Process />
      <Resume hasResumeFile={hasResume} />
      <Contact formEnabled={contactConfigured()} />
    </>
  );
}
