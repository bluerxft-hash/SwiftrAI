"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useNotes } from "@/hooks/useNotes";

export default function SharedNotePage({ params }: { params: { id: string } }) {
  return <SharedNoteContent id={params.id} />;
}

function SharedNoteContent({ id }: { id: string }) {
  const { notes, ready } = useNotes();
  
  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const note = notes.find((n) => n.id === id);

  if (!note) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-swiftr-brand to-swiftr-brand-dark p-6">
            <h1 className="text-3xl font-bold text-white">{note.title}</h1>
            <p className="text-white/80 mt-2">Shared via Swiftr AI</p>
          </div>
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-slate-700">{note.content}</div>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link href="/" className="text-swiftr-brand hover:text-swiftr-brand-dark font-medium">
            ← Create your own notes with Swiftr AI
          </Link>
        </div>
      </div>
    </div>
  );
}
