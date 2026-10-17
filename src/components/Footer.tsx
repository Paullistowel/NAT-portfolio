import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-[15px] font-semibold tracking-[0.28em]">{site.name}</span>
            <span className="text-[13px] text-muted">{site.fullName}</span>
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
            {site.roles.join(" · ")}
          </div>
        </div>
        <div className="flex items-center gap-8 font-mono text-[10px] tracking-[0.16em] text-faint uppercase">
          <span>
            © {new Date().getFullYear()} {site.fullName ?? site.name}
          </span>
          <Link href="/#home" className="flex items-center gap-2 hover:text-fg">
            Top <ArrowUp size={12} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
