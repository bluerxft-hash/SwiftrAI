"use client";

import { useState } from "react";
import { BookOpen, Trash2, Folder, FolderOpen, Plus } from "lucide-react";
import { useNotes } from "@/hooks/useNotes";
import { DiagramViewer } from "@/components/DiagramViewer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function NotesEditorClient() {
  const { notes, ready, updateNote, deleteNote, addFolder, folders } = useNotes();
  const [active, setActive] = useState(notes[0]?.id ?? "");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const note = notes.find((n) => n.id === active);

  const filteredNotes = selectedFolder
    ? notes.filter((n) => n.folder === selectedFolder)
    : notes;

  if (!ready) return null;

  return (
    <div className="mx-auto flex max-w-6xl gap-6 h-screen">
      <div className="w-72 shrink-0 flex flex-col">
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <BookOpen className="h-6 w-6 text-swiftr-brand" /> Notes
        </h1>
        <p className="mt-1 text-xs text-emerald-600 font-semibold">Free</p>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Folders</span>
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
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setSelectedFolder(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const noteId = e.dataTransfer.getData("noteId");
                if (noteId) {
                  updateNote(noteId, { folder: "General" });
                }
              }}
              className={`flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all ${
                selectedFolder === null
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <FolderOpen className="h-8 w-8" />
              <span className="text-xs font-medium">All Notes</span>
            </button>
            {folders.map((folder) => (
              <button
                key={folder}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const noteId = e.dataTransfer.getData("noteId");
                  if (noteId) {
                    updateNote(noteId, { folder });
                  }
                }}
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

        <div className="flex-1 overflow-y-auto">
          <p className="text-sm font-medium text-slate-700 mb-2">Notes</p>
          <ul className="space-y-1">
            {filteredNotes.map((n) => (
              <li
                key={n.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("noteId", n.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                className="cursor-move"
              >
                <button
                  type="button"
                  onClick={() => setActive(n.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    active === n.id
                      ? "bg-swiftr-brand-light font-medium text-swiftr-brand"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {n.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        {note ? (
          <>
            <input
              className="input-field text-lg font-semibold"
              value={note.title}
              onChange={(e) => updateNote(note.id, { title: e.target.value })}
            />
            <div className="flex-1 overflow-y-auto mt-4 prose prose-sm max-w-none">
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
                {note.content}
              </ReactMarkdown>
            </div>
            <DiagramViewer content={note.content} />
            <button
              type="button"
              onClick={() => {
                deleteNote(note.id);
                setActive(notes.find((n) => n.id !== note.id)?.id ?? "");
              }}
              className="mt-4 inline-flex items-center gap-2 text-sm text-red-600 hover:underline"
            >
              <Trash2 className="h-4 w-4" /> Delete note
            </button>
          </>
        ) : (
          <p className="text-slate-500">No notes yet. Use PDF, audio, or upload tools.</p>
        )}
      </div>
    </div>
  );
}
