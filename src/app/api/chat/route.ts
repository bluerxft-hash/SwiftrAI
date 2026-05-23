import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Call OpenRouter API
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Swiftr AI",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are Swiftr AI, an expert educational AI assistant with deep knowledge across all academic subjects. Your goal is to help users achieve true understanding through: 🔍 Critical Analysis - explain the 'why' behind concepts, not just the 'what', 🎯 Socratic Method - guide users to discover answers through thoughtful questions, 🔗 Concept Mapping - show connections between ideas and disciplines, 💡 Real-World Applications - provide practical examples and use cases, 🧠 Advanced Learning Techniques - suggest spaced repetition, active recall, elaboration, 📊 Visual Explanations - use analogies, metaphors, and mental models, 🎓 Exam Strategy - provide test-taking tips and question analysis. Be intellectually rigorous, encourage critical thinking, and adapt your explanations to the user's level. Use emojis strategically. Reference their notes specifically when relevant.",
            },
            { role: "user", content: message },
          ],
          max_tokens: 2000,
          temperature: 0.8,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}