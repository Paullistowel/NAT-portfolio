"use client";

import { Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

type Props = { src: string; poster?: string; title: string; description: string | null };

/**
 * Cinematic video player. Uses preload="none" so nothing is downloaded until the visitor
 * presses play (the poster frame is the only request made up front).
 */
export function VideoShowcase({ src, poster, title, description }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Pause automatically when scrolled away.
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && video.current?.pause(), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => setError(true));
    else v.pause();
  };

  const fullscreen = () => {
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (frame.current?.requestFullscreen) frame.current.requestFullscreen().catch(() => v.webkitEnterFullscreen?.());
    else v.webkitEnterFullscreen?.(); // iOS Safari
  };

  return (
    <section id="video" aria-labelledby="video-title" className="border-t border-line py-24 md:py-36">
      <div className="container-x">
        <Reveal className="mb-10 grid gap-6 md:grid-cols-12">
          <div className="eyebrow md:col-span-3">Showreel</div>
          <div className="md:col-span-9">
            <h2 id="video-title" className="text-[clamp(2rem,4.6vw,4rem)] leading-[1.02] font-medium tracking-[-0.035em]">
              {title}
            </h2>
            {description && <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">{description}</p>}
          </div>
        </Reveal>

        <Reveal>
          <div ref={frame} className="group relative aspect-video w-full overflow-hidden border border-line bg-black">
            <video
              ref={video}
              className="h-full w-full object-contain"
              src={src}
              poster={poster}
              preload="none"
              playsInline
              muted={muted}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
              onError={() => setError(true)}
              onClick={toggle}
            />

            {!playing && !error && (
              <button
                onClick={toggle}
                className="absolute inset-0 grid place-items-center bg-black/25 transition-colors hover:bg-black/10"
                aria-label="Play video"
              >
                <span className="grid h-20 w-20 place-items-center border border-white/40 bg-black/40 backdrop-blur-md transition-transform duration-500 group-hover:scale-105">
                  <Play size={22} strokeWidth={1.5} className="ml-1" />
                </span>
              </button>
            )}

            {error && (
              <div role="alert" className="absolute inset-0 grid place-items-center text-center text-sm text-muted">
                The video couldn’t be played in this browser.
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 pt-10 pb-3 opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
              <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="grid h-9 w-9 place-items-center hover:bg-white/10">
                {playing ? <Pause size={16} strokeWidth={1.5} /> : <Play size={16} strokeWidth={1.5} />}
              </button>
              <div
                className="relative h-px flex-1 cursor-pointer bg-white/25"
                role="slider"
                aria-label="Seek"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
                tabIndex={0}
                onClick={(e) => {
                  const v = video.current;
                  if (!v || !v.duration) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
                }}
                onKeyDown={(e) => {
                  const v = video.current;
                  if (!v) return;
                  if (e.key === "ArrowRight") v.currentTime += 5;
                  if (e.key === "ArrowLeft") v.currentTime -= 5;
                }}
              >
                <div className="absolute inset-y-0 left-0 bg-white" style={{ width: `${progress * 100}%` }} />
              </div>
              <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} className="grid h-9 w-9 place-items-center hover:bg-white/10">
                {muted ? <VolumeX size={16} strokeWidth={1.5} /> : <Volume2 size={16} strokeWidth={1.5} />}
              </button>
              <button onClick={fullscreen} aria-label="Fullscreen" className="grid h-9 w-9 place-items-center hover:bg-white/10">
                <Maximize2 size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Shown only in development when no video file exists yet, so the slot is easy to find. */
export function VideoSlotNotice() {
  return (
    <section className="border-t border-line py-16">
      <div className="container-x">
        <div className="border border-dashed border-amber-400/40 p-8 font-mono text-[12px] leading-relaxed text-amber-200/80">
          [Placeholder] Video showcase — add your video at <code>public/videos/showcase.mp4</code> (and optionally a poster at{" "}
          <code>public/videos/showcase-poster.jpg</code>). This section appears automatically once the file exists. This
          notice is only visible in development.
        </div>
      </div>
    </section>
  );
}
