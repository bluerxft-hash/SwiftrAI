import {
  ArrowRight,
  Brain,
  Check,
  FileText,
  GraduationCap,
  Headphones,
  MessageSquare,
  Mic2,
  Sparkles,
  Upload,
  Youtube,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ProBadge } from "@/components/ProBadge";
import { SubscribeButton } from "@/components/SubscribeButton";
import { FREE_FEATURES, PRO_FEATURES } from "@/lib/features";

const freeIcons: Record<string, typeof Zap> = {
  "pdf-notes": FileText,
  "audio-notes": Mic2,
  flashcards: Brain,
  quiz: GraduationCap,
  chat: MessageSquare,
  editor: FileText,
  folders: FileText,
  share: FileText,
  upload: Upload,
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section className="gradient-hero border-b border-swiftr-100">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-swiftr-200 bg-swiftr-brand-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-swiftr-brand">
                <Sparkles className="h-3.5 w-3.5" />
                Full Turbo AI alternative
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                <span className="text-swiftr-brand">Swiftr AI</span>
                <br />
                <span className="text-slate-700">almost everything free</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 sm:text-xl">
                PDF notes, lectures, flashcards, quizzes, AI chat, folders, and
                sharing — all free. Only{" "}
                <strong className="text-swiftr-brand">YouTube → notes</strong> and{" "}
                <strong className="text-swiftr-brand">podcast tools</strong> are
                $5/month.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/app" className="btn-primary">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#pricing" className="btn-secondary">
                  Get Pro — $5/mo
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Every Turbo AI feature
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Same study workflow: upload content → notes → flashcards → quizzes → chat.
              </p>
            </div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FREE_FEATURES.map((f) => {
                const Icon = freeIcons[f.id] ?? Zap;
                return (
                  <div key={f.id} className="glass-card p-5">
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-swiftr-brand" />
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                        Free
                      </span>
                    </div>
                    <h3 className="mt-3 font-semibold text-slate-900">{f.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{f.description}</p>
                  </div>
                );
              })}
              {PRO_FEATURES.map((f) => (
                <div
                  key={f.id}
                  className="glass-card border-2 border-swiftr-brand/30 p-5"
                >
                  <div className="flex items-center justify-between">
                    <f.icon className="h-5 w-5 text-swiftr-brand" />
                    <ProBadge small />
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-900">{f.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="free-vs-pro" className="border-y border-swiftr-100 bg-swiftr-50/50 py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold text-slate-900">
              Free vs Pro
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-white p-8">
                <h3 className="text-xl font-bold text-emerald-700">Free forever</h3>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {FREE_FEATURES.map((f) => (
                    <li key={f.id} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {f.name}
                    </li>
                  ))}
                </ul>
                <Link href="/app" className="btn-secondary mt-8 w-full text-center">
                  Open free workspace
                </Link>
              </div>
              <div className="rounded-2xl border-2 border-swiftr-brand bg-white p-8 shadow-lg shadow-swiftr-brand/10">
                <h3 className="flex items-center gap-2 text-xl font-bold text-swiftr-brand">
                  Pro <ProBadge small /> — $5/month
                </h3>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {PRO_FEATURES.map((f) => (
                    <li key={f.id} className="flex items-start gap-2">
                      <Youtube className="mt-0.5 h-4 w-4 shrink-0 text-swiftr-brand" />
                      {f.name}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-slate-500">
                  Stripe-powered. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-lg text-center">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Pro pricing
              </h2>
              <p className="mt-4 text-slate-600">
                You never pay for PDF notes, flashcards, or chat. Pro unlocks the two
                Turbo features that need extra processing.
              </p>
            </div>
            <div className="mx-auto mt-12 max-w-md">
              <div className="relative overflow-hidden rounded-3xl border-2 border-swiftr-brand bg-white p-8 shadow-xl shadow-swiftr-brand/15">
                <div className="absolute right-0 top-0 rounded-bl-2xl bg-swiftr-brand px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                  Pro
                </div>
                <p className="text-sm font-semibold uppercase tracking-wide text-swiftr-brand">
                  Swiftr AI Pro
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-slate-900">$5</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-swiftr-brand" />
                    YouTube → notes
                  </li>
                  <li className="flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-swiftr-brand" />
                    Podcast link + generator from notes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Everything else stays free
                  </li>
                </ul>
                <div className="mt-8">
                  <SubscribeButton
                    label="Subscribe — $5/month"
                    className="btn-primary w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-swiftr-100 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Swiftr AI. All rights reserved.</p>
          <p>Payments secured by Stripe</p>
        </div>
      </footer>
    </div>
  );
}
