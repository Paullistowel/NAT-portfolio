// Pre-compresses every STL in public/models to <name>.stl.gz (runs before `next build`).
// STLs shrink to roughly a third; the viewer's worker downloads the .gz and decompresses it
// with DecompressionStream, falling back to the raw .stl when the .gz is missing or unsupported.
import { createReadStream, createWriteStream, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { constants, createGzip } from "node:zlib";

const dir = join(process.cwd(), "public", "models");
for (const file of readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".stl"))) {
  const src = join(dir, file);
  const out = `${src}.gz`;
  try {
    if (statSync(out).mtimeMs >= statSync(src).mtimeMs) continue; // up to date
  } catch {}
  await pipeline(createReadStream(src), createGzip({ level: constants.Z_BEST_COMPRESSION }), createWriteStream(out));
  const pct = Math.round((statSync(out).size / statSync(src).size) * 100);
  console.log(`compressed ${file} → ${pct}%`);
}
