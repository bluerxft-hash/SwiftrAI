import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content, questionCount, difficulty, focusOn } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Generate basic quiz without AI
      return NextResponse.json({
        quiz: generateBasicQuiz(content),
      });
    }

    // Use AI to generate quiz
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
              content: `You are an expert quiz generator and educational assessment specialist. Your PRIMARY task is to create quiz questions about the ACTUAL TOPICS in the provided content. CRITICAL: Extract the real topics, concepts, terms, and subjects from the text and create questions about THEM. DO NOT create meta-questions about the content structure (e.g., "What is the relationship between the main concepts?" or "What is the main purpose of this content?"). Instead, create questions about the actual subject matter. For example, if the content is about quantum computing, ask questions like "What is quantum entanglement?" or "How does superposition work?" or "What is the difference between a qubit and a classical bit?" - questions about the ACTUAL TOPIC, not about the notes themselves. Include a diverse mix of: definition questions about specific terms, factual questions about specific details, comparison questions between concepts, application questions, and analysis questions. Make distractors (wrong answers) highly plausible but clearly incorrect based on the content. Each question should have 4 options with only one correct answer. Generate ${questionCount || 15} high-quality, challenging questions about the ACTUAL SUBJECT MATTER. Difficulty level: ${difficulty || "medium"}. ${focusOn === "harder" ? "Focus on creating more challenging, advanced questions that require deeper analysis of the actual topics." : ""}`,
            },
            {
              role: "user",
              content: `Generate quiz questions about the ACTUAL TOPICS in the following content. CRITICAL: Extract the real subjects, concepts, and terms from the text and create questions about THEM. DO NOT create meta-questions about the content structure. Create ${questionCount || 15} questions about the actual subject matter. Questions should include: definitions of specific terms, facts about the topic, comparisons between concepts, applications, and analysis. NEVER use generic or placeholder answers. All options must be specific and answerable from the text. Difficulty: ${difficulty || "medium"}. ${focusOn === "harder" ? "Focus on deeper analysis of the actual topics." : "Cover all major topics and details from the content."} Make distractors plausible but clearly wrong based on the text:\n\n${content.substring(0, 12000)}`,
            },
          ],
          max_tokens: 4000,
          temperature: 0.8,
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        quiz: generateBasicQuiz(content),
      });
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    try {
      // Try to parse JSON from AI response
      const quiz = JSON.parse(aiContent);
      return NextResponse.json({ quiz });
    } catch {
      // If parsing fails, generate basic quiz
      return NextResponse.json({
        quiz: generateBasicQuiz(content),
      });
    }
  } catch (error) {
    console.error("Quiz API error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}

function generateBasicQuiz(
  content: string
): { question: string; options: string[]; correctIndex: number }[] {
  const quiz: { question: string; options: string[]; correctIndex: number }[] = [];

  // Extract key terms and concepts from the content
  const words = content.split(/\s+/).filter(w => w.length > 4);
  const keyTerms = [...new Set(words)].slice(0, 30);

  // Generate topic-specific questions using actual terms from content
  if (keyTerms.length >= 2) {
    quiz.push({
      question: `What is ${keyTerms[0]}?`,
      options: [
        `A key concept discussed in the content`,
        `An unrelated topic`,
        `A minor detail`,
        `Not mentioned in the content`,
      ],
      correctIndex: 0,
    });

    quiz.push({
      question: `How does ${keyTerms[0]} relate to ${keyTerms[1]}?`,
      options: [
        `They are connected concepts in this subject`,
        `They are completely unrelated`,
        `Only one is important`,
        `They are the same thing`,
      ],
      correctIndex: 0,
    });

    quiz.push({
      question: `What are the main characteristics of ${keyTerms[0]}?`,
      options: [
        `Key features explained in the content`,
        `No characteristics are given`,
        `It has no specific features`,
        `Characteristics are not relevant`,
      ],
      correctIndex: 0,
    });
  }

  if (keyTerms.length >= 3) {
    quiz.push({
      question: `What is the difference between ${keyTerms[0]} and ${keyTerms[2]}?`,
      options: [
        `They serve different purposes in this context`,
        `They are identical`,
        `Only one exists`,
        `No difference is explained`,
      ],
      correctIndex: 0,
    });
  }

  // Add questions based on content patterns
  if (content.toLowerCase().includes("definition") || content.toLowerCase().includes("means")) {
    quiz.push({
      question: `What does ${keyTerms[0] || "the main concept"} mean?`,
      options: [
        `It has a specific definition in this context`,
        `It has no meaning`,
        `The definition is unclear`,
        `It means something different`,
      ],
      correctIndex: 0,
    });
  }

  if (content.toLowerCase().includes("example") || content.toLowerCase().includes("such as")) {
    quiz.push({
      question: `What is an example of ${keyTerms[0] || "this concept"}?`,
      options: [
        `Specific examples are provided in the content`,
        `No examples are given`,
        `Examples are not relevant`,
        `The concept has no examples`,
      ],
      correctIndex: 0,
    });
  }

  quiz.push({
    question: `What is the significance of ${keyTerms[0] || "the main topic"}?`,
    options: [
      `It plays an important role in this subject`,
      `It is not significant`,
      `Its significance is unknown`,
      `Significance is not discussed`,
    ],
    correctIndex: 0,
  });

  return quiz;
}