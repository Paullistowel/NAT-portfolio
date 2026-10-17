import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Video } from "@/content/site";

/** True when a file exists under /public. Evaluated at build time for static pages. */
export function publicFileExists(publicPath: string): boolean {
  try {
    return fs.statSync(path.join(process.cwd(), "public", publicPath)).isFile();
  } catch {
    return false;
  }
}

/** Videos whose files exist, with posters dropped when their file is missing (so nothing renders broken). */
export function availableVideos(videos: Video[], project?: string): Video[] {
  return videos
    .filter((v) => (project ? v.project === project : true) && publicFileExists(v.src))
    .map((v) => ({ ...v, poster: v.poster && publicFileExists(v.poster) ? v.poster : undefined }));
}
