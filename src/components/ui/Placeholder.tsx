import { showPlaceholders } from "@/lib/placeholders";

/**
 * Marks content Nat still needs to supply. Rendered as a dashed, clearly-labelled note in
 * development; renders nothing in production (unless NEXT_PUBLIC_SHOW_PLACEHOLDERS=true).
 */
export function Placeholder({ label, file = "src/content/site.ts" }: { label: string; file?: string }) {
  if (!showPlaceholders) return null;
  return (
    <span className="inline-block border border-dashed border-amber-400/50 bg-amber-400/5 light:border-amber-600/50 light:bg-amber-500/10 px-2 py-1 font-mono text-[11px] leading-relaxed text-amber-200/80 light:text-amber-800">
      [Placeholder] {label} — edit <code className="text-amber-100 light:text-amber-950">{file}</code>
    </span>
  );
}
