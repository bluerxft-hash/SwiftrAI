import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content, cardCount, difficulty, focusOn } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Generate basic flashcards without AI
      return NextResponse.json({
        flashcards: generateBasicFlashcards(content),
      });
    }

    // Use AI to generate flashcards
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
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
              content: `You are an expert flashcard generator and educational assessment specialist. Your PRIMARY task is to create flashcards about the ACTUAL TOPICS in the provided content. CRITICAL: Extract the real topics, concepts, terms, and subjects from the text and create flashcards about THEM. DO NOT create meta-flashcards about the content structure (e.g., "What is the relationship between the main concepts?" or "What is the main purpose of this content?"). Instead, create flashcards about the actual subject matter. For example, if the content is about quantum computing, create flashcards like "What is quantum entanglement?" or "How does superposition work?" or "What is the difference between a qubit and a classical bit?" - flashcards about the ACTUAL TOPIC, not about the notes themselves. Include a diverse mix of: definition cards for specific terms, concept cards about specific topics, comparison cards between concepts, application cards, and analysis cards. Each flashcard should have a clear, challenging front (question/prompt about the actual topic) and a comprehensive, accurate back (answer/explanation from the content). Generate ${cardCount || 20} high-quality, challenging flashcards about the ACTUAL SUBJECT MATTER. Difficulty level: ${difficulty || "medium"}. ${focusOn === "harder" ? "Focus on creating more challenging, advanced flashcards about the actual topics." : ""}`,
            },
            {
              role: "user",
              content: `Generate flashcards about the ACTUAL TOPICS in the following content. CRITICAL: Extract the real subjects, concepts, and terms from the text and create flashcards about THEM. DO NOT create meta-flashcards about the content structure. Create ${cardCount || 20} flashcards about the actual subject matter. Cards should include: definitions of specific terms, facts about the topic, comparisons between concepts, applications, and analysis. NEVER use generic or placeholder answers. All answers must be specific and come from the text. Difficulty: ${difficulty || "medium"}. ${focusOn === "harder" ? "Focus on harder, more advanced concepts and applications." : "Cover all major concepts, themes, and applications from the content."} Ensure answers are accurate, detailed, and come directly from the provided text:\n\n${content.substring(0, 12000)}`,
            },
          ],
          max_tokens: 4000,
          temperature: 0.8,
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        flashcards: generateBasicFlashcards(content),
      });
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    try {
      // Try to parse JSON from AI response
      const flashcards = JSON.parse(aiContent);
      return NextResponse.json({ flashcards });
    } catch {
      // If parsing fails, generate basic flashcards
      return NextResponse.json({
        flashcards: generateBasicFlashcards(content),
      });
    }
  } catch (error) {
    console.error("Flashcards API error:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}

function generateBasicFlashcards(
  content: string
): { front: string; back: string }[] {
  const flashcards: { front: string; back: string }[] = [];

  // Extract key terms from the content
  const words = content.split(/\s+/).filter(w => w.length > 4);
  const keyTerms = [...new Set(words)].slice(0, 30);

  // Generate topic-specific flashcards using actual terms from content
  if (keyTerms.length >= 1) {
    flashcards.push({
      front: `What is ${keyTerms[0]}?`,
      back: `A key concept discussed in the content with specific characteristics and applications`,
    });

    flashcards.push({
      front: `What are the main features of ${keyTerms[0]}?`,
      back: `Key characteristics and properties that define this concept in the context of the subject`,
    });
  }

  if (keyTerms.length >= 2) {
    flashcards.push({
      front: `How does ${keyTerms[0]} relate to ${keyTerms[1]}?`,
      back: `They are connected concepts that work together in this subject area`,
    });

    flashcards.push({
      front: `What is the difference between ${keyTerms[0]} and ${keyTerms[1]}?`,
      back: `They serve different purposes or have distinct characteristics in this context`,
    });
  }

  if (keyTerms.length >= 3) {
    flashcards.push({
      front: `What is the role of ${keyTerms[2]} in this context?`,
      back: `It plays a specific function within the broader framework discussed in the content`,
    });
  }

  // Add topic-specific flashcards based on content patterns
  if (content.toLowerCase().includes("definition") || content.toLowerCase().includes("means")) {
    flashcards.push({
      front: `How is ${keyTerms[0] || "the main concept"} defined?`,
      back: `It is defined with specific parameters and characteristics in this subject area`,
    });
  }

  if (content.toLowerCase().includes("example") || content.toLowerCase().includes("such as")) {
    flashcards.push({
      front: `What is an example of ${keyTerms[0] || "this concept"}?`,
      back: `Specific instances or applications are provided to illustrate the concept`,
    });
  }

  flashcards.push({
    front: `Why is ${keyTerms[0] || "this concept"} important?`,
    back: `It is essential for understanding the subject and has practical applications`,
  });

  flashcards.push({
    front: `How would you apply ${keyTerms[0] || "this concept"} in practice?`,
    back: `By using the principles and methods explained in the content in real situations`,
  });

  return flashcards;
}