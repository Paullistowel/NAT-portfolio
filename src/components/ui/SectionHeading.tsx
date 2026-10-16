import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  index,
  eyebrow,
  title,
  children,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Reveal className="mb-12 grid gap-6 border-t border-line pt-6 md:mb-16 md:grid-cols-12">
      <div className="eyebrow md:col-span-3">
        <span className="text-fg">{index}</span> <span className="mx-2 text-faint">/</span> {eyebrow}
      </div>
      <div className="md:col-span-9">
        <h2 className="text-[clamp(2rem,4.6vw,4rem)] leading-[1.02] font-medium tracking-[-0.035em] text-balance">
          {title}
        </h2>
        {children && <div className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">{children}</div>}
      </div>
    </Reveal>
  );
}
