"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ProBadge } from "./ProBadge";
import { FEATURES } from "@/lib/features";
import { LayoutGrid } from "lucide-react";

export function AppShell({
  children,
  isPro,
}: {
  children: React.ReactNode;
  isPro?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-swiftr-100 bg-white">
        <div className="border-b border-swiftr-100 px-4 py-4">
          <Logo href="/app" />
          <p className="mt-2 text-xs text-slate-500">Turbo AI alternative</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <Link
            href="/app"
            className={`mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname === "/app"
                ? "bg-swiftr-brand-light text-swiftr-brand"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Home
          </Link>

          <p className="mb-2 mt-4 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Free — like Turbo AI
          </p>
          {FEATURES.filter((f) => !f.pro).map((f) => (
            <Link
              key={f.id}
              href={f.href}
              className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                pathname === f.href
                  ? "bg-swiftr-brand-light font-medium text-swiftr-brand"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <f.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{f.name}</span>
            </Link>
          ))}

          <p className="mb-2 mt-4 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Pro — $5/month
          </p>
          {FEATURES.filter((f) => f.pro).map((f) => (
            <Link
              key={f.id}
              href={f.href}
              className={`mb-0.5 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                pathname === f.href
                  ? "bg-swiftr-brand-light font-medium text-swiftr-brand"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <f.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{f.name}</span>
              <ProBadge small />
            </Link>
          ))}
        </nav>

        <div className="border-t border-swiftr-100 p-4">
          {isPro ? (
            <p className="text-center text-xs font-medium text-emerald-600">
              ✓ Pro active
            </p>
          ) : (
            <Link href="/#pricing" className="btn-primary w-full text-center text-xs">
              Upgrade — $5/mo
            </Link>
          )}
          <Link
            href="/"
            className="mt-3 block text-center text-xs text-slate-500 hover:text-swiftr-brand"
          >
            Marketing site
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col pl-64">
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
