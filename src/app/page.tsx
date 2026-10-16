import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Resume } from "@/components/sections/Resume";
import { SelectedWorks } from "@/components/sections/SelectedWorks";
import { Skills } from "@/components/sections/Skills";
import { Studio } from "@/components/sections/Studio";
import { VideoShowcase, VideoSlotNotice } from "@/components/sections/VideoShowcase";
import { getModel, heroModelId, models } from "@/content/models";
import { site } from "@/content/site";
import { publicFileExists } from "@/lib/assets";
import { contactConfigured } from "@/lib/contact";
import { showPlaceholders } from "@/lib/placeholders";

export default function Home() {
  const heroModel = getModel(heroModelId) ?? models[0];
  const hasVideo = publicFileExists(site.video.src);
  const hasPoster = publicFileExists(site.video.poster);
  const hasResume = publicFileExists(site.resume.file);

  return (
    <>
      <Hero model={heroModel} />
      <SelectedWorks />
      <Studio />
      {hasVideo ? (
        <VideoShowcase
          src={site.video.src}
          poster={hasPoster ? site.video.poster : undefined}
          title={site.video.title}
          description={site.video.description}
        />
      ) : (
        showPlaceholders && <VideoSlotNotice />
      )}
      <About />
      <Skills />
      <Process />
      <Resume hasResumeFile={hasResume} />
      <Contact formEnabled={contactConfigured()} />
    </>
  );
}
