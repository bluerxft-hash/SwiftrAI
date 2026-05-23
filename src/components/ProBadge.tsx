import { Crown } from "lucide-react";

export function ProBadge({ small }: { small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-swiftr-brand font-bold uppercase tracking-wide text-white ${
        small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <Crown className={small ? "h-2.5 w-2.5" : "h-3 w-3"} />
      Pro
    </span>
  );
}
