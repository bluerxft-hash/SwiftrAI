"use client";

import { Brain, Loader2, CheckCircle, XCircle, Settings, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";

export function FlashcardsClient() {
  const { notes, ready } = useNotes();
  const [selected, setSelected] = useState("");
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [cards, setCards] = useState<{ front: string; back: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cardCount, setCardCount] = useState(20);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<number>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const note = notes.find((n) => n.id === selected);

  async function generateCards() {
    if (!note) return;

    setLoading(true);
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: note.content,
          cardCount,
          difficulty
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate flashcards");
      }

      const data = await response.json();
      setCards(data.flashcards || []);
      setCurrentIndex(0);
      setKnownCards(new Set());
      setUnknownCards(new Set());
    } catch (error) {
      console.error("Error generating flashcards:", error);
      // Fallback to basic flashcards
      setCards([
        { front: "What is the main topic?", back: note.title },
        { front: "What type of content is this?", back: note.sourceType },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKnown(index: number) {
    setKnownCards(prev => new Set([...prev, index]));
    moveToNext();
  }

  function handleUnknown(index: number) {
    setUnknownCards(prev => new Set([...prev, index]));
    moveToNext();
  }

  function moveToNext() {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped({});
    }
  }

  async function generateMoreCards() {
    if (!note) return;
    setLoading(true);
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: note.content,
          cardCount: 10,
          difficulty,
          focusOn: "harder"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate more flashcards");
      }

      const data = await response.json();
      setCards(prev => [...prev, ...(data.flashcards || [])]);
    } catch (error) {
      console.error("Error generating more flashcards:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Brain className="h-7 w-7 text-swiftr-brand" /> Flashcards
        </h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <Settings className="h-5 w-5 text-slate-600" />
        </button>
      </div>
      <p className="mt-2 text-slate-600">Free — generate cards from any note.</p>

      {showSettings && (
        <div className="mt-4 p-4 glass-card space-y-4">
          <h3 className="font-semibold text-slate-900">Generation Settings</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Number of Cards</label>
            <select
              className="input-field"
              value={cardCount}
              onChange={(e) => setCardCount(Number(e.target.value))}
            >
              <option value="10">10 cards</option>
              <option value="20">20 cards</option>
              <option value="30">30 cards</option>
              <option value="50">50 cards</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
            <select
              className="input-field"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      )}

      <select
        className="input-field mt-6"
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          setFlipped({});
          setCards([]);
          setCurrentIndex(0);
          setKnownCards(new Set());
          setUnknownCards(new Set());
        }}
      >
        <option value="">Choose a note…</option>
        {notes.map((n) => (
          <option key={n.id} value={n.id}>
            {n.title}
          </option>
        ))}
      </select>
      {notes.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">Create notes via PDF, audio, or upload first.</p>
      )}

      {note && cards.length === 0 && !loading && (
        <button
          onClick={generateCards}
          className="btn-primary mt-4"
        >
          Generate Flashcards
        </button>
      )}

      {loading && (
        <div className="mt-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-swiftr-brand" />
          <span className="ml-2 text-slate-600">Generating flashcards...</span>
        </div>
      )}

      {cards.length > 0 && (
        <>
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Card {currentIndex + 1} of {cards.length}
            </p>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">✓ Known: {knownCards.size}</span>
              <span className="text-red-600">✗ Unknown: {unknownCards.size}</span>
            </div>
          </div>

          <div className="mt-6 perspective-1000">
            <div
              className={`relative w-full h-64 transition-transform duration-500 transform-style-3d cursor-pointer ${
                flipped[currentIndex] ? "rotate-y-180" : ""
              }`}
              onClick={() => setFlipped((f) => ({ ...f, [currentIndex]: !f[currentIndex] }))}
            >
              <div className="absolute inset-0 backface-hidden glass-card p-8 flex flex-col justify-center overflow-y-auto">
                <p className="text-xs font-semibold uppercase text-swiftr-brand mb-3">Question</p>
                <p className="text-lg font-medium text-slate-900 leading-relaxed">{cards[currentIndex].front}</p>
                <p className="mt-4 text-xs text-slate-400">Tap to flip</p>
              </div>
              <div className="absolute inset-0 backface-hidden rotate-y-180 glass-card p-8 flex flex-col justify-center overflow-y-auto bg-gradient-to-br from-swiftr-brand to-swiftr-brand-dark">
                <p className="text-xs font-semibold uppercase text-white mb-3">Answer</p>
                <p className="text-lg font-medium text-white leading-relaxed">{cards[currentIndex].back}</p>
                <p className="mt-4 text-xs text-white/70">Tap to flip back</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => handleKnown(currentIndex)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition font-medium"
            >
              <CheckCircle className="h-5 w-5" />
              I knew this
            </button>
            <button
              onClick={() => handleUnknown(currentIndex)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition font-medium"
            >
              <XCircle className="h-5 w-5" />
              I didn&apos;t know this
            </button>
          </div>

          {currentIndex === cards.length - 1 && (
            <div className="mt-6 p-4 glass-card">
              <h3 className="font-semibold text-slate-900 mb-3">Session Complete!</h3>
              <p className="text-sm text-slate-600 mb-4">
                You knew {knownCards.size} out of {cards.length} cards.
              </p>
              {unknownCards.size > 0 && (
                <button
                  onClick={generateMoreCards}
                  className="btn-primary w-full"
                >
                  Generate More Cards for Unknown Topics
                </button>
              )}
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setFlipped({});
                  setKnownCards(new Set());
                  setUnknownCards(new Set());
                }}
                className="btn-secondary w-full mt-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restart Session
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}