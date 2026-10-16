import "server-only";
import fs from "node:fs";
import path from "node:path";

/** True when a file exists under /public. Evaluated at build time for static pages. */
export function publicFileExists(publicPath: string): boolean {
  try {
    return fs.statSync(path.join(process.cwd(), "public", publicPath)).isFile();
  } catch {
    return false;
  }
}
