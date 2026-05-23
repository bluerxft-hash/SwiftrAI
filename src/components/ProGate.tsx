import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { SubscribeButton } from "./SubscribeButton";

type Props = {
  featureName: string;
  description: string;
  isPro: boolean;
  children: React.ReactNode;
};

export function ProGate({ featureName, description, isPro, children }: Props) {
  if (isPro) return <>{children}</>;

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-swiftr-brand-light text-swiftr-brand">
        <Lock className="h-8 w-8" />
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <h1 className="text-2xl font-bold text-slate-900">{featureName}</h1>
        <span className="inline-flex items-center gap-1 rounded-full bg-swiftr-brand px-2 py-0.5 text-xs font-bold text-white">
          <Crown className="h-3 w-3" /> Pro
        </span>
      </div>
      <p className="mt-3 text-slate-600">{description}</p>
      <p className="mt-2 text-sm text-slate-500">
        Everything else on Swiftr AI is <strong>free</strong> — PDF notes, audio,
        flashcards, quizzes, chat, folders, and more.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <SubscribeButton label="Unlock Pro — $5/month" />
        <Link href="/folders" className="text-sm font-medium text-swiftr-brand hover:underline">
          ← Back to free tools
        </Link>
      </div>
    </div>
  );
}
