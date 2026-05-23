"use client";

import { FolderOpen, Folder, Plus, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";

const DEFAULT_FOLDERS = ["General", "School", "Work", "Personal"];

export function FoldersClient() {
  const { notes, ready, moveToFolder, addFolder, folders, updateNote, deleteNote } = useNotes();
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);

  const allFolders = [...new Set([...DEFAULT_FOLDERS, ...folders])];
  const filteredNotes = selectedFolder
    ? notes.filter((n) => n.folder === selectedFolder)
    : notes;

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
        <FolderOpen className="h-7 w-7 text-swiftr-brand" /> Folders
      </h1>
      <p className="mt-2 text-slate-600">Free — organize notes like Turbo AI.</p>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-700">Create Folder</span>
          <button
            type="button"
            onClick={() => setShowFolderInput(!showFolderInput)}
            className="text-swiftr-brand hover:text-swiftr-brand-dark"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {showFolderInput && (
          <div className="flex gap-2 mb-4">
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

        <div className="grid grid-cols-3 gap-4 mb-6">
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
            className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all ${
              selectedFolder === null
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <FolderOpen className="h-10 w-10" />
            <span className="text-sm font-medium">All Notes</span>
            <span className="text-xs opacity-75">{notes.length} notes</span>
          </button>
          {allFolders.map((folder) => (
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
              className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all ${
                selectedFolder === folder
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Folder className="h-10 w-10" />
              <span className="text-sm font-medium truncate w-full">{folder}</span>
              <span className="text-xs opacity-75">{notes.filter((n) => n.folder === folder).length} notes</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">
            {selectedFolder ? selectedFolder : "All Notes"}
          </h2>
          <span className="text-sm text-slate-500">{filteredNotes.length} notes</span>
        </div>
        <ul className="space-y-2">
          {filteredNotes.map((n) => (
            <li
              key={n.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("noteId", n.id);
                e.dataTransfer.effectAllowed = "move";
                setDraggedNoteId(n.id);
              }}
              onDragEnd={() => setDraggedNoteId(null)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-move transition ${
                draggedNoteId === n.id
                  ? "border-swiftr-brand bg-swiftr-brand-light"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700 truncate">{n.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  value={n.folder}
                  onChange={(e) => moveToFolder(n.id, e.target.value)}
                >
                  {allFolders.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${n.title}"?`)) {
                      deleteNote(n.id);
                    }
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {filteredNotes.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">
            No notes in this folder. Drag notes here or create notes first.
          </p>
        )}
      </div>
    </div>
  );
}
