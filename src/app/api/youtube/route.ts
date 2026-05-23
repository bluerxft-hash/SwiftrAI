import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "YouTube URL required" }, { status: 400 });
  }

  // Validate YouTube URL
  let videoId: string;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v") || "";
    } else {
      throw new Error("Invalid host");
    }
    if (!videoId) throw new Error("No video ID");
  } catch {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    // Extract transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: "No transcript available for this video" },
        { status: 404 }
      );
    }

    // Combine transcript segments
    const fullText = transcript.map((segment) => segment.text).join(" ");

    // Generate notes using AI
    const apiKey = process.env.OPENAI_API_KEY;
    let notes: string;

    if (apiKey) {
      // Use AI to generate structured notes
      const aiResponse = await fetch(
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
                content:
                  "You are an expert study notes generator like Turbo AI. Create comprehensive, visually engaging study notes from YouTube transcripts that include: 📋 Summary with key takeaways, 🎯 Key Concepts with explanations, 📊 Tables for definitions/comparisons, 💡 Important formulas/equations (if applicable), 🧠 Memory tricks/mnemonics, 📝 Study tips, and ✨ Use emojis throughout to make notes engaging. Format in Markdown with proper headings, bullet points, and tables. Make the notes structured, easy to read, and optimized for learning.",
              },
              {
                role: "user",
                content: `Generate comprehensive study notes from this YouTube video transcript. Make it detailed, well-organized, and visually appealing with emojis and formatting:\n\n${fullText.substring(0, 6000)}`,
              },
            ],
            max_tokens: 3000,
            temperature: 0.7,
          }),
        }
      );

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        notes = aiData.choices?.[0]?.message?.content || generateBasicNotes(fullText, videoId);
      } else {
        notes = generateBasicNotes(fullText, videoId);
      }
    } else {
      notes = generateBasicNotes(fullText, videoId);
    }

    return NextResponse.json({
      success: true,
      videoId,
      transcriptLength: fullText.length,
      notes,
    });
  } catch (error) {
    console.error("YouTube transcript error:", error);
    return NextResponse.json(
      { error: "Failed to extract transcript. The video may not have captions available." },
      { status: 500 }
    );
  }
}

function generateBasicNotes(text: string, videoId: string): string {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const keyPoints = sentences.slice(0, 10);

  return `## YouTube Video Notes

### Summary
This video contains ${text.split(" ").length} words of transcript content.

### Key Points
${keyPoints.map((point, i) => `${i + 1}. ${point.trim()}`).join("\n")}

### Transcript Preview
${text.substring(0, 500)}...

### Study Tips
1. Review these notes within 24 hours for better retention
2. Generate flashcards from the **Flashcards** tool (free)
3. Take a practice quiz in **Quizzes** (free)
4. Use the AI Chat to ask questions about this content

---
*Source: YouTube video ${videoId} · Processed by Swiftr AI*`;
}