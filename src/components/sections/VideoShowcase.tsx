"use client";

import { Maximize2, Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CinematicReveal } from "@/components/ui/CinematicReveal";
import type { Video } from "@/content/site";

const time = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

/**
 * Cinematic video player with a selectable playlist. Videos use preload="none", so only the poster
 * frames load until a visitor presses play. Renders nothing when no video files exist.
 */
export function VideoPlayer({ videos, compact = false }: { videos: Video[]; compact?: boolean }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [error, setError] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [switching, setSwitching] = useState(false);
  const autoplayNext = useRef(false);
  const v = videos[index];

  // Pause when scrolled away.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && video.current?.pause(), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (video.current) video.current.volume = volume;
  }, [volume]);

  // One persistent <video> element: after a source swap, reload it and (if the visitor picked it) play.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = video.current;
    if (!el) return;
    el.load();
    el.volume = volume;
    setSwitching(false);
    if (autoplayNext.current) {
      autoplayNext.current = false;
      el.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!v) return null;

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setError(true));
    else el.pause();
  };

  const select = (i: number) => {
    if (i === index) return toggle();
    autoplayNext.current = true; // the click is a user gesture, so playback may start straight away
    video.current?.pause();
    setError(false);
    setSwitching(true);
    setProgress({ current: 0, duration: 0 });
    window.setTimeout(() => setIndex(i), 250); // let the frame fade out before swapping the source
  };

  const fullscreen = () => {
    const el = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!el) return;
    if (frame.current?.requestFullscreen) frame.current.requestFullscreen().catch(() => el.webkitEnterFullscreen?.());
    else el.webkitEnterFullscreen?.(); // iOS Safari
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className={`grid grid-cols-1 gap-6 ${videos.length > 1 && !compact ? "lg:grid-cols-[minmax(0,1fr)_300px]" : ""}`}>
      <div className="min-w-0">
        <div ref={frame} className="group relative aspect-video w-full overflow-hidden border border-line bg-black">
          <video
            ref={video}
            className={`h-full w-full object-contain transition-opacity duration-300 ${switching ? "opacity-0" : "opacity-100"}`}
            src={v.src}
            poster={v.poster}
            preload="none"
            playsInline
            muted={muted}
            onLoadedMetadata={(e) => setProgress({ current: 0, duration: e.currentTarget.duration })}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onTimeUpdate={(e) => setProgress({ current: e.currentTarget.currentTime, duration: e.currentTarget.duration })}
            onError={() => setError(true)}
            onClick={toggle}
          />

          {!playing && !error && !switching && (
            <button onClick={toggle} className="absolute inset-0 grid place-items-center bg-black/25 transition-colors hover:bg-black/10" aria-label={`Play ${v.title}`}>
              <span className="grid h-20 w-20 place-items-center border border-white/40 bg-black/40 backdrop-blur-md transition-transform duration-500 group-hover:scale-105">
                <Play size={22} strokeWidth={1.5} className="ml-1" />
              </span>
            </button>
          )}

          {error && (
            <div role="alert" className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted">
              This video couldn’t be played in this browser.
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 pt-12 pb-2.5 transition-opacity sm:gap-3 sm:px-4 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
            <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="grid h-9 w-9 shrink-0 place-items-center hover:bg-white/10">
              {playing ? <Pause size={16} strokeWidth={1.5} /> : <Play size={16} strokeWidth={1.5} />}
            </button>
            <span className="hidden shrink-0 font-mono text-[11px] text-white/80 sm:inline">{time(progress.current)}</span>
            <input
              type="range"
              aria-label="Seek"
              min={0}
              max={progress.duration || 0}
              step={0.1}
              value={progress.current}
              onChange={(e) => {
                if (video.current) video.current.currentTime = Number(e.target.value);
              }}
              className="range h-1 min-w-0 flex-1"
              style={{ ["--p" as string]: `${progress.duration ? (progress.current / progress.duration) * 100 : 0}%` }}
            />
            <span className="hidden shrink-0 font-mono text-[11px] text-white/60 sm:inline">{time(progress.duration)}</span>
            <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"} className="grid h-9 w-9 shrink-0 place-items-center hover:bg-white/10">
              <VolumeIcon size={16} strokeWidth={1.5} />
            </button>
            <input
              type="range"
              aria-label="Volume"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setMuted(Number(e.target.value) === 0);
              }}
              className="range hidden h-1 w-20 sm:block"
              style={{ ["--p" as string]: `${(muted ? 0 : volume) * 100}%` }}
            />
            <button onClick={fullscreen} aria-label="Fullscreen" className="grid h-9 w-9 shrink-0 place-items-center hover:bg-white/10">
              <Maximize2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-[17px] font-medium tracking-[-0.01em]">{v.title}</h3>
          {v.description && <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-muted">{v.description}</p>}
        </div>
      </div>

      {videos.length > 1 && (
        <ul aria-label="Choose a video" className={`flex gap-2 overflow-x-auto pb-1 ${compact ? "" : "lg:flex-col lg:overflow-visible"}`}>
          {videos.map((item, i) => (
            <li key={item.src} className="w-56 shrink-0 lg:w-auto">
              <button
                onClick={() => select(i)}
                aria-pressed={i === index}
                className={`group/v flex w-full items-center gap-3 border p-2 text-left transition-colors ${
                  i === index ? "border-silver/60 bg-tint/[0.05]" : "border-line hover:border-line-strong"
                }`}
              >
                <span className="relative block aspect-video w-24 shrink-0 overflow-hidden bg-black">
                  {item.poster && <Image src={item.poster} alt="" fill sizes="96px" className="object-cover" />}
                  <span className="absolute inset-0 grid place-items-center bg-black/30">
                    {i === index && playing ? <Pause size={14} /> : <Play size={14} />}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[10px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span className="block truncate text-[13px] font-medium">{item.title}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function VideoShowcase({ videos }: { videos: Video[] }) {
  return (
    <section id="video" aria-labelledby="video-title" className="py-24 md:py-36">
      <div className="container-x">
        <div className="mb-12 grid gap-6 border-t border-line pt-6 md:mb-16 md:grid-cols-12">
          <div className="eyebrow md:col-span-3">Showreel</div>
          <div className="md:col-span-9">
            <h2 id="video-title" className="text-[clamp(2rem,4.6vw,4rem)] leading-[1.02] font-medium tracking-[-0.035em]">
              Work in motion.
            </h2>
          </div>
        </div>
        <CinematicReveal>
          <VideoPlayer videos={videos} />
        </CinematicReveal>
      </div>
    </section>
  );
}

/** Shown only in development when no video files exist yet, so the slot is easy to find. */
export function VideoSlotNotice() {
  return (
    <section className="py-16">
      <div className="container-x">
        <div className="border border-dashed border-amber-400/40 p-8 light:border-amber-600/50 font-mono text-[12px] leading-relaxed text-amber-200/80 light:text-amber-800">
          [Placeholder] Video showcase — add videos to <code>public/videos/</code> and list them in <code>site.videos</code>{" "}
          (src/content/site.ts). The default entry expects <code>public/videos/showcase.mp4</code> with an optional poster at{" "}
          <code>showcase-poster.jpg</code>; an optional muted hero loop goes at <code>public/videos/hero-loop.mp4</code>. Sections
          appear automatically once files exist. This notice is only visible in development.
        </div>
      </div>
    </section>
  );
}
