import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-swiftr-brand-light px-4">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="glass-card max-w-md p-8 text-center shadow-lg">
        <CheckCircle2 className="mx-auto h-14 w-14 text-swiftr-brand" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Payment received
        </h1>
        <p className="mt-3 text-slate-600">
          If you were not redirected automatically, open your dashboard to
          manage links.
        </p>
        <Link href="/dashboard" className="btn-primary mt-8 w-full">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
