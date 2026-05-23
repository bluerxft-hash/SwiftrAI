"use client";

import { Loader2, Sparkles, Upload, Bot, Send, User, MessageSquare, FileText, Folder, FolderOpen, Plus } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { generateNotesFromSource, type GeneratedNote } from "@/lib/generate";
import { useNotes } from "@/hooks/useNotes";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  title: string;
  description: string;
  sourceType: GeneratedNote["sourceType"];
  inputLabel: string;
  inputPlaceholder: string;
  acceptFile?: boolean;
  fileHint?: string;
};

export function ToolProcessor({
  title,
  description,
  sourceType,
  inputLabel,
  inputPlaceholder,
  acceptFile,
  fileHint,
}: Props) {
  const { addNote, notes, folders, addFolder } = useNotes();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedNote | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedNote, setSelectedNote] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant. Ask me anything about your notes!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const selectedNoteData = notes.find((n) => n.id === selectedNote) || result;

  async function processWithAPI(file: File) {
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Determine the correct API endpoint based on source type
      let endpoint = "/api/upload/pdf";
      if (sourceType === "audio") {
        endpoint = "/api/upload/audio";
      } else if (sourceType === "upload") {
        endpoint = "/api/upload/file";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process file");
      }

      const data = await response.json();

      const note: GeneratedNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: data.filename.replace(/\.(pdf|mp3|wav|m4a|txt)$/, ""),
        source: file.name,
        sourceType,
        folder: selectedFolder || "General",
        createdAt: new Date().toISOString(),
        content: data.notes,
      };

      addNote(note);
      setResult(note);
      setSelectedNote(note.id);
    } catch (error) {
      console.error("Error processing file:", error);
      // Fallback to API generation
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: file.name,
            sourceType,
            label: file.name,
          }),
        });

        if (response.ok) {
          const note = await response.json();
          addNote(note);
          setResult(note);
          setSelectedNote(note.id);
        } else {
          throw new Error("API fallback failed");
        }
      } catch {
        // Final fallback to mock
        const note = await generateNotesFromSource(file.name, sourceType, file.name);
        const noteWithFolder = { ...note, folder: selectedFolder || "General" };
        addNote(noteWithFolder);
        setResult(noteWithFolder);
        setSelectedNote(noteWithFolder.id);
      }
    } finally {
      setLoading(false);
    }
  }

  async function process(input: string, label?: string) {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: input.trim(),
          sourceType,
          label,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate notes");
      }

      const note = await response.json();
      addNote(note);
      setResult(note);
      setSelectedNote(note.id);
    } catch (error) {
      console.error("Error generating notes:", error);
      // Fallback to mock processing
      const note = await generateNotesFromSource(input.trim(), sourceType, label);
      addNote(note);
      setResult(note);
      setSelectedNote(note.id);
    } finally {
      setLoading(false);
    }
  }

  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    setChatMessages((m) => [...m, { role: "user", content: text }]);
    setChatInput("");
    setChatLoading(true);

    try {
      // Only send note titles and a preview to reduce payload size
      const notesContext = notes.map(n => `Title: ${n.title}\nPreview: ${n.content.slice(0, 500)}`).join("\n\n---\n\n");
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
      setChatMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedFile && (sourceType === "pdf" || sourceType === "audio" || sourceType === "upload")) {
      processWithAPI(uploadedFile);
    } else {
      process(value);
    }
  }, [uploadedFile, sourceType, value]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setValue(file.name);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validExtensions: Record<string, string[]> = {
      pdf: [".pdf"],
      audio: [".mp3", ".wav", ".m4a"],
      youtube: [".txt"],
      text: [".txt"],
      upload: [".pdf", ".mp3", ".wav", ".m4a", ".txt"],
    };

    const allowed = validExtensions[sourceType] || validExtensions.upload;
    if (allowed.some((ext: string) => file.name.toLowerCase().endsWith(ext))) {
      setUploadedFile(file);
      setValue(file.name);
    }
  }, [sourceType]);

  return (
    <div className="flex h-screen gap-0">
      {/* Left Side - Notes Panel */}
      <div className="w-1/2 flex flex-col border-r border-swiftr-100 bg-white">
        <div className="border-b border-swiftr-100 p-4">
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <FileText className="h-6 w-6 text-swiftr-brand" /> {title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
          <span className="mt-2 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Free
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectedNoteData ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-slate-900">{selectedNoteData.title}</h2>
                <button
                  type="button"
                  onClick={() => setSelectedNote("")}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  ← Back
                </button>
              </div>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="min-w-full border-collapse border border-slate-200 rounded-lg overflow-hidden">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-slate-50">{children}</thead>
                    ),
                    th: ({ children }) => (
                      <th className="border-b-2 border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-900">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {selectedNoteData.content}
                </ReactMarkdown>
              </div>
              <div className="flex gap-3 pt-4 border-t border-swiftr-100">
                <Link href="/app/flashcards" className="btn-secondary text-sm">
                  Generate flashcards
                </Link>
                <Link href="/app/quiz" className="btn-secondary text-sm">
                  Take a quiz
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Folder Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Select Folder</label>
                  <button
                    type="button"
                    onClick={() => setShowFolderInput(!showFolderInput)}
                    className="text-swiftr-brand hover:text-swiftr-brand-dark"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {showFolderInput && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="New folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="input-field text-sm py-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newFolderName.trim()) {
                          addFolder(newFolderName.trim());
                          setNewFolderName("");
                          setShowFolderInput(false);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newFolderName.trim()) {
                          addFolder(newFolderName.trim());
                          setNewFolderName("");
                          setShowFolderInput(false);
                        }
                      }}
                      className="btn-primary px-3 py-2 text-sm"
                    >
                      Add
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFolder(null)}
                    className={`flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all ${
                      selectedFolder === null
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <FolderOpen className="h-8 w-8" />
                    <span className="text-xs font-medium">General</span>
                  </button>
                  {folders.filter(f => f !== "General").map((folder) => (
                    <button
                      key={folder}
                      type="button"
                      onClick={() => setSelectedFolder(folder)}
                      className={`flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all ${
                        selectedFolder === folder
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg scale-105"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Folder className="h-8 w-8" />
                      <span className="text-xs font-medium truncate w-full">{folder}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">{inputLabel}</label>

                {acceptFile ? (
                  <div
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-swiftr-brand transition-colors cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    {uploadedFile ? (
                      <div>
                        <p className="font-medium text-slate-900">{uploadedFile.name}</p>
                        <p className="text-sm text-slate-500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-600">
                          {sourceType === "pdf" ? "Drop your PDF here or click to browse" :
                           sourceType === "audio" ? "Drop your audio file here or click to browse" :
                           "Drop your file here or click to browse"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {sourceType === "pdf" ? "Supports .pdf files" :
                           sourceType === "audio" ? "Supports .mp3, .wav, .m4a files" :
                           "Supports .pdf, .mp3, .wav, .m4a, .txt files"}
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={sourceType === "pdf" ? ".pdf" :
                            sourceType === "audio" ? ".mp3,.wav,.m4a" :
                            ".pdf,.mp3,.wav,.m4a,.txt"}
                      onChange={handleFile}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <>
                    <input
                      className="input-field"
                      placeholder={inputPlaceholder}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                    {acceptFile && (
                      <div>
                        <input
                          type="file"
                          accept=".pdf,.mp3,.wav,.m4a,.txt"
                          onChange={handleFile}
                          className="text-sm"
                        />
                        {fileHint && <p className="mt-1 text-xs text-slate-500">{fileHint}</p>}
                      </div>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading || (!value.trim() && !uploadedFile)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate notes
                    </>
                  )}
                </button>
              </form>

              {notes.length > 0 && (
                <div className="pt-4 border-t border-swiftr-100">
                  <p className="text-sm text-slate-600 mb-2">Or select an existing note:</p>
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
              )}
            </div>
          )}
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
          {chatMessages.map((msg, i) => (
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

        <form onSubmit={handleChatSubmit} className="border-t border-swiftr-100 bg-white p-4">
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="Ask about your notes…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
            />
            <button type="submit" className="btn-primary px-4" disabled={chatLoading}>
              {chatLoading ? (
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