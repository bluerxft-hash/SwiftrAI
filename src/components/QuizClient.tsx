"use client";

import { GraduationCap, Loader2, Settings, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

export function QuizClient() {
  const { notes, ready } = useNotes();
  const [selected, setSelected] = useState("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [questionCount, setQuestionCount] = useState(15);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [wrongAnswers, setWrongAnswers] = useState<Set<number>>(new Set());

  const note = notes.find((n) => n.id === selected);

  async function generateQuiz() {
    if (!note) return;

    setLoading(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: note.content,
          questionCount,
          difficulty
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      setQuestions(data.quiz || []);
      setAnswers({});
      setSubmitted(false);
      setWrongAnswers(new Set());
    } catch (error) {
      console.error("Error generating quiz:", error);
      // Fallback to basic quiz
      setQuestions([
        {
          question: "What is the main topic of this content?",
          options: [note.title, "Unknown", "Cannot determine", "None of the above"],
          correctIndex: 0,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function generateMoreQuiz() {
    if (!note) return;
    setLoading(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: note.content,
          questionCount: 10,
          difficulty,
          focusOn: "harder"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate more quiz questions");
      }

      const data = await response.json();
      setQuestions(prev => [...prev, ...(data.quiz || [])]);
    } catch (error) {
      console.error("Error generating more quiz:", error);
    } finally {
      setLoading(false);
    }
  }

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correctIndex).length
    : 0;

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <GraduationCap className="h-7 w-7 text-swiftr-brand" /> Quizzes
        </h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <Settings className="h-5 w-5 text-slate-600" />
        </button>
      </div>
      <p className="mt-2 text-slate-600">Free — instant exam prep from your notes.</p>

      {showSettings && (
        <div className="mt-4 p-4 glass-card space-y-4">
          <h3 className="font-semibold text-slate-900">Generation Settings</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Number of Questions</label>
            <select
              className="input-field"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            >
              <option value="10">10 questions</option>
              <option value="15">15 questions</option>
              <option value="20">20 questions</option>
              <option value="30">30 questions</option>
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
          setAnswers({});
          setSubmitted(false);
          setQuestions([]);
          setWrongAnswers(new Set());
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

      {note && questions.length === 0 && !loading && (
        <button
          onClick={generateQuiz}
          className="btn-primary mt-4"
        >
          Generate Quiz
        </button>
      )}

      {loading && (
        <div className="mt-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-swiftr-brand" />
          <span className="ml-2 text-slate-600">Generating quiz...</span>
        </div>
      )}

      {questions.length > 0 && (
        <div className="mt-8 space-y-6">
          {questions.map((q, qi) => (
            <div key={qi} className="glass-card p-5">
              <p className="font-medium text-slate-900">{q.question}</p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      submitted && oi === q.correctIndex
                        ? "border-emerald-400 bg-emerald-50"
                        : submitted && answers[qi] === oi && oi !== q.correctIndex
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      checked={answers[qi] === oi}
                      onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                      disabled={submitted}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {!submitted ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setSubmitted(true);
                // Track wrong answers
                questions.forEach((q, i) => {
                  if (answers[i] !== q.correctIndex) {
                    setWrongAnswers(prev => new Set([...prev, i]));
                  }
                });
              }}
              disabled={Object.keys(answers).length < questions.length}
            >
              Submit quiz
            </button>
          ) : (
            <div className="p-4 glass-card">
              <p className="text-lg font-semibold text-swiftr-brand">
                Score: {score} / {questions.length}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                {score === questions.length ? "Perfect score! 🎉" : 
                 score >= questions.length * 0.7 ? "Great job! Keep it up!" :
                 "Keep practicing to improve!"}
              </p>
              {wrongAnswers.size > 0 && (
                <button
                  onClick={generateMoreQuiz}
                  className="btn-primary w-full mt-4"
                >
                  Generate More Questions for Weak Areas
                </button>
              )}
              <button
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                  setWrongAnswers(new Set());
                }}
                className="btn-secondary w-full mt-2"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}