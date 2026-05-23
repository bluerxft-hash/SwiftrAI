"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";

export function ShareClient() {
  const { notes, ready } = useNotes();
  const [selected, setSelected] = useState("");
  const [copied, setCopied] = useState(false);

  const note = notes.find((n) => n.id === selected);
  const shareUrl =
    typeof window !== "undefined" && note
      ? `${window.location.origin}/share/${note.id}`
      : "";

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
        <Share2 className="h-7 w-7 text-swiftr-brand" /> Share notes
      </h1>
      <p className="mt-2 text-slate-600">Free — share with classmates via link.</p>
      <select
        className="input-field mt-6"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Select note to share…</option>
        {notes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.title}
          </option>
        ))}
      </select>
      {note && (
        <div className="mt-6 glass-card p-5">
          <p className="text-sm text-slate-600">Share link (demo):</p>
          <code className="mt-2 block break-all rounded-lg bg-slate-100 p-3 text-xs">
            {shareUrl}
          </code>
          <button type="button" onClick={copyLink} className="btn-primary mt-4">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
