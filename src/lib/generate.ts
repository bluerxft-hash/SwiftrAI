export type GeneratedNote = {
  id: string;
  title: string;
  source: string;
  sourceType: "pdf" | "audio" | "youtube" | "text" | "upload";
  folder: string;
  content: string;
  createdAt: string;
};

export function mockId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function generateNotesFromSource(
  source: string,
  sourceType: GeneratedNote["sourceType"],
  label?: string
): Promise<GeneratedNote> {
  const title =
    label ??
    (sourceType === "youtube"
      ? extractYouTubeTitle(source)
      : source.slice(0, 48) || "Untitled note");

  // Try to use AI if API key is available
  const apiKey = process.env.OPENAI_API_KEY;
  let content: string;

  if (apiKey && source.length > 10) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a study notes generator. Create well-structured study notes from the provided content. Include: Summary, Key Concepts, Definitions (as a table), and Study Tips. Format in Markdown.",
            },
            {
              role: "user",
              content: `Generate study notes from this ${sourceType} content:\n\n${source.substring(0, 4000)}`,
            },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        content = data.choices?.[0]?.message?.content || generateMockContent(title, sourceType);
      } else {
        content = generateMockContent(title, sourceType);
      }
    } catch {
      content = generateMockContent(title, sourceType);
    }
  } else {
    content = generateMockContent(title, sourceType);
  }

  return {
    id: mockId(),
    title,
    source,
    sourceType,
    folder: "General",
    createdAt: new Date().toISOString(),
    content,
  };
}

function generateMockContent(title: string, sourceType: GeneratedNote["sourceType"]): string {
  return `## ${title}

### Summary
Swiftr AI distilled this ${sourceType} into structured study notes — same workflow as Turbo AI.

### Key concepts
- **Main idea**: Core topic explained in plain language
- **Supporting detail**: Secondary points with examples
- **Application**: How to use this on exams or projects

### Definitions
| Term | Meaning |
|------|---------|
| Concept A | Clear one-line definition |
| Concept B | Related idea with context |

### Study tips
1. Review this note within 24 hours for retention
2. Generate flashcards from the **Flashcards** tool (free)
3. Take a practice quiz in **Quizzes** (free)

---
*Source: ${sourceType} · Processed by Swiftr AI*`;
}

function extractYouTubeTitle(url: string): string {
  try {
    const u = new URL(url);
    const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
    return id ? `YouTube notes — ${id}` : "YouTube notes";
  } catch {
    return "YouTube notes";
  }
}

export async function generateFlashcards(noteTitle: string, noteContent?: string): Promise<{ front: string; back: string }[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && noteContent) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a flashcard generator. Create 5-10 flashcards from the provided notes. Return as JSON array with 'front' and 'back' fields.",
            },
            {
              role: "user",
              content: `Generate flashcards from this note titled "${noteTitle}":\n\n${noteContent.substring(0, 3000)}`,
            },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
              return parsed.map((card: any) => ({
                front: card.front || "Question",
                back: card.back || "Answer",
              }));
            }
          } catch {
            // Fall through to mock
          }
        }
      }
    } catch {
      // Fall through to mock
    }
  }

  // Mock fallback
  return [
    { front: `What is the main topic of "${noteTitle}"?`, back: "The core concept from your summary section." },
    { front: "Name one supporting detail.", back: "A secondary point with an example from the note." },
    { front: "What study tip #1 recommends?", back: "Review within 24 hours for better retention." },
    { front: "Define Concept A.", back: "Clear one-line definition from the definitions table." },
  ];
}

export async function generateQuiz(noteTitle: string, noteContent?: string): Promise<{ question: string; options: string[]; answer: number }[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && noteContent) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a quiz generator. Create 5 multiple choice questions from the provided notes. Return as JSON array with 'question', 'options' (array of 4 strings), and 'answer' (index 0-3) fields.",
            },
            {
              role: "user",
              content: `Generate a quiz from this note titled "${noteTitle}":\n\n${noteContent.substring(0, 3000)}`,
            },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
              return parsed.map((q: { question?: string; options?: string[]; answer?: number } | unknown) => {
                const question = q as { question?: string; options?: string[]; answer?: number };
                return {
                  question: question.question || "Question",
                  options: Array.isArray(question.options) ? question.options : ["A", "B", "C", "D"],
                  answer: typeof question.answer === "number" ? question.answer : 0,
                };
              });
            }
          } catch {
            // Fall through to mock
          }
        }
      }
    } catch {
      // Fall through to mock
    }
  }

  // Mock fallback
  return [
    {
      question: `Which best describes the main idea in "${noteTitle}"?`,
      options: ["Unrelated trivia", "Core topic in plain language", "Random example only", "None of the above"],
      answer: 1,
    },
    {
      question: "How soon should you review new notes?",
      options: ["After 1 year", "Within 24 hours", "Never", "Only before finals"],
      answer: 1,
    },
    {
      question: "Which Swiftr tool creates practice questions for free?",
      options: ["Podcast (Pro)", "Quizzes", "YouTube (Pro)", "Billing"],
      answer: 1,
    },
  ];
}

export async function generatePodcastScript(noteTitle: string, showUrl: string, noteContent?: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && noteContent) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert podcast script generator like Turbo AI. Create an engaging, conversational podcast script from the provided notes. Include: energetic intro with hook, clear summary of key concepts, memorable examples and stories, practical applications, listener Q&A segment, and motivating outro with call-to-action. Use a friendly, educational tone with natural transitions.",
            },
            {
              role: "user",
              content: `Generate an engaging podcast script for "${noteTitle}" from these notes. Make it conversational and exciting:\n\n${noteContent.substring(0, 4000)}`,
            },
          ],
          max_tokens: 2000,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return content;
        }
      }
    } catch {
      // Fall through to mock
    }
  }

  // Mock fallback
  return `🎙️ Swiftr Podcast — ${noteTitle}

[Intro]
Welcome back! This episode is powered by Swiftr AI Pro.
${showUrl ? `Find the full show at: ${showUrl}` : "Add your podcast link in Pro settings."}

[Segment 1 — Summary]
Today we're breaking down "${noteTitle}" into bite-sized audio.

[Segment 2 — Key takeaways]
• Main concepts from your notes
• Exam-ready definitions
• One action step for this week

[Outro]
Subscribe for more — and open Swiftr to generate flashcards from this episode.`;
}
