"use client";

import { Bot, MessageSquare, Send, User, BookOpen } from "lucide-react";
import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";

type Message = { role: "user" | "assistant"; content: string };

export function NotesChatClient() {
  const { notes } = useNotes();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Swiftr AI chat — free, like Turbo. Ask anything about your saved notes.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");

  const selectedNoteData = notes.find((n) => n.id === selectedNote);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const notesContext = notes.map(n => `Title: ${n.title}\nContent: ${n.content}`).join("\n\n---\n\n");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${text}\n\nHere are my notes for context:\n${notesContext}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen gap-0">
      {/* Left Side - Notes Panel */}
      <div className="w-1/2 flex flex-col border-r border-swiftr-100 bg-white">
        <div className="border-b border-swiftr-100 p-4">
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <BookOpen className="h-6 w-6 text-swiftr-brand" /> Your Notes
          </h1>
          <p className="mt-1 text-sm text-slate-600">Select a note to view detailed content</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectedNoteData ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">{selectedNoteData.title}</h2>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-slate-700">{selectedNoteData.content}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Select a note to view its content</p>
              {notes.length === 0 && (
                <p className="text-sm text-slate-400 mt-2">Create notes using PDF, audio, or upload tools</p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-swiftr-100 p-4">
          <select
            className="input-field w-full"
            value={selectedNote}
            onChange={(e) => setSelectedNote(e.target.value)}
          >
            <option value="">Choose a note…</option>
            {notes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Side - Chat Panel */}
      <div className="w-1/2 flex flex-col bg-slate-50">
        <div className="border-b border-swiftr-100 bg-white p-4">
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <MessageSquare className="h-6 w-6 text-swiftr-brand" /> AI Chat
          </h1>
          <p className="mt-1 text-sm text-slate-600">Ask questions about your notes</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  msg.role === "user" ? "bg-slate-200" : "bg-swiftr-brand text-white"
                }`}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </span>
              <p
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-swiftr-brand text-white"
                    : "bg-white text-slate-800 shadow-sm"
                }`}
              >
                {msg.content}
              </p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-swiftr-100 bg-white p-4">
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="Ask about your notes…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn-primary px-4" disabled={loading}>
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
