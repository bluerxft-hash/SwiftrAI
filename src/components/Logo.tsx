import { Zap } from "lucide-react";
import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-swiftr-brand text-white shadow-md shadow-swiftr-brand/30">
        <Zap className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        Swiftr <span className="text-swiftr-brand">AI</span>
      </span>
    </Link>
  );
}
