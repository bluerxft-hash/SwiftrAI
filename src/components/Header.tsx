import Link from "next/link";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-swiftr-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="transition hover:text-swiftr-brand">
            Features
          </a>
          <a href="#free-vs-pro" className="transition hover:text-swiftr-brand">
            Free vs Pro
          </a>
          <a href="#pricing" className="transition hover:text-swiftr-brand">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="hidden text-sm font-medium text-slate-600 transition hover:text-swiftr-brand sm:inline"
          >
            Open app
          </Link>
          <Link href="/app" className="btn-secondary text-sm hidden sm:inline-flex">
            Start free
          </Link>
          <a href="#pricing" className="btn-primary text-sm">
            Pro — $5/mo
          </a>
        </div>
      </div>
    </header>
  );
}
