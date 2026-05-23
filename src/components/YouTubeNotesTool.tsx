"use client";

import { Loader2, Sparkles, Youtube } from "lucide-react";
import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import Link from "next/link";

export function YouTubeNotesTool() {
  const { addNote } = useNotes();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; content: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      new URL(url);
      if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
        throw new Error("Enter a valid YouTube URL");
      }
    } catch {
      setError("Please paste a valid YouTube link (youtube.com or youtu.be)");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process video");
      }

      const data = await response.json();

      const note = {
        id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: `YouTube Notes - ${data.videoId}`,
        source: url,
        sourceType: "youtube" as const,
        folder: "General",
        createdAt: new Date().toISOString(),
        content: data.notes,
      };

      addNote(note);
      setResult(note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process video");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-swiftr-brand text-white">
          <Youtube className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">YouTube to notes</h1>
          <p className="text-sm text-slate-500">Turbo AI parity — included in Pro</p>
        </div>
      </div>
      <p className="mt-4 text-slate-600">
        Paste any lecture or tutorial URL. Swiftr extracts key ideas into formatted
        study notes with tables and headings.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          className="input-field"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Converting video…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Convert to notes
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="mt-8 glass-card p-6">
          <h2 className="font-semibold">{result.title}</h2>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-4 text-sm text-slate-200">
            {result.content}
          </pre>
          <div className="mt-4 flex gap-3">
            <Link href="/app/flashcards" className="btn-secondary text-sm">
              Make flashcards
            </Link>
            <Link href="/app/quiz" className="btn-secondary text-sm">
              Take quiz
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}