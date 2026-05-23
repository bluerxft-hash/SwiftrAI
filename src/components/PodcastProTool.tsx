"use client";

import { Headphones, Loader2, Mic2, Save, Sparkles } from "lucide-react";
import { useState } from "react";
import { generatePodcastScript } from "@/lib/generate";
import { useNotes } from "@/hooks/useNotes";

type Props = {
  initialPodcastUrl: string;
};

export function PodcastProTool({ initialPodcastUrl }: Props) {
  const { notes } = useNotes();
  const [podcastUrl, setPodcastUrl] = useState(initialPodcastUrl);
  const [selectedNote, setSelectedNote] = useState("");
  const [script, setScript] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function savePodcastLink(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ podcastUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setMessage("Podcast link saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function generatePodcast() {
    const note = notes.find((n) => n.id === selectedNote);
    if (!note) return;
    setGenerating(true);
    try {
      const script = await generatePodcastScript(note.title, podcastUrl, note.content);
      setScript(script);
    } catch (error) {
      console.error("Error generating podcast:", error);
      setScript("Failed to generate podcast script. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-swiftr-brand text-white">
            <Headphones className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Podcast link & generator</h1>
            <p className="text-sm text-slate-500">Turbo AI parity — Pro only</p>
          </div>
        </div>
        <p className="mt-4 text-slate-600">
          Attach your show URL (Spotify, Apple, RSS) and turn any note into an
          audio-style podcast script for on-the-go study.
        </p>
      </div>

      <form onSubmit={savePodcastLink} className="glass-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <Mic2 className="h-5 w-5 text-swiftr-brand" />
          <h2 className="font-semibold">Your podcast link</h2>
        </div>
        <input
          type="url"
          className="input-field"
          placeholder="https://open.spotify.com/show/..."
          value={podcastUrl}
          onChange={(e) => setPodcastUrl(e.target.value)}
        />
        <button type="submit" className="btn-primary mt-4" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save podcast link
        </button>
        {message && <p className="mt-2 text-sm text-emerald-600">{message}</p>}
      </form>

      <div className="glass-card p-6">
        <h2 className="font-semibold text-slate-900">Generate podcast from notes</h2>
        <p className="mt-1 text-sm text-slate-500">Pick a note — same as Turbo&apos;s podcast-from-notes</p>
        <select
          className="input-field mt-4"
          value={selectedNote}
          onChange={(e) => setSelectedNote(e.target.value)}
        >
          <option value="">Select a note…</option>
          {notes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title}
            </option>
          ))}
        </select>
        {notes.length === 0 && (
          <p className="mt-2 text-sm text-amber-600">
            Create a note first (PDF, audio, or free upload).
          </p>
        )}
        <button
          type="button"
          className="btn-primary mt-4"
          disabled={!selectedNote || generating}
          onClick={generatePodcast}
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate podcast script
        </button>
        {script && (
          <pre className="mt-6 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-4 text-sm text-slate-200">
            {script}
          </pre>
        )}
      </div>
    </div>
  );
}
