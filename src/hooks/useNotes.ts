"use client";

import { useCallback, useEffect, useState } from "react";
import type { GeneratedNote } from "@/lib/generate";

const STORAGE_KEY = "swiftr_notes";
const FOLDERS_KEY = "swiftr_folders";

export function useNotes() {
  const [notes, setNotes] = useState<GeneratedNote[]>([]);
  const [ready, setReady] = useState(false);
  const [folders, setFolders] = useState<string[]>(["General"]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setNotes(JSON.parse(raw) as GeneratedNote[]);
      
      const foldersRaw = localStorage.getItem(FOLDERS_KEY);
      if (foldersRaw) setFolders(JSON.parse(foldersRaw) as string[]);
    } catch {
      setNotes([]);
      setFolders(["General"]);
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: GeneratedNote[]) => {
    setNotes(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const persistFolders = useCallback((next: string[]) => {
    setFolders(next);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(next));
  }, []);

  const addNote = useCallback(
    (note: GeneratedNote) => {
      persist([note, ...notes]);
    },
    [notes, persist]
  );

  const updateNote = useCallback(
    (id: string, patch: Partial<GeneratedNote>) => {
      persist(
        notes.map((n) => (n.id === id ? { ...n, ...patch, id: n.id } : n))
      );
    },
    [notes, persist]
  );

  const deleteNote = useCallback(
    (id: string) => {
      persist(notes.filter((n) => n.id !== id));
    },
    [notes, persist]
  );

  const moveToFolder = useCallback(
    (id: string, folder: string) => {
      updateNote(id, { folder });
    },
    [updateNote]
  );

  const addFolder = useCallback(
    (folderName: string) => {
      if (!folders.includes(folderName)) {
        persistFolders([...folders, folderName]);
      }
    },
    [folders, persistFolders]
  );

  return { notes, ready, addNote, updateNote, deleteNote, moveToFolder, addFolder, folders };
}
