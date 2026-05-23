import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error - pdf-parse doesn't have TypeScript definitions
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF{ text: string; numpges: umber }
    const data = await pdf(buffer) as any;

    // Extract text content
    const text = data.text;
    const numPages = data.numpages;

    // Generate notes using AI if API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    let notes: string;

    if (apiKey && text.length > 100) {
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
                  "You are an expert study notes generator and educational AI assistant. Your goal is to create EXTREMELY COMPREHENSIVE, DETAILED study notes that span multiple pages (at least 2000+ words). Create notes that include: 📋 Executive Summary with key insights, 🎯 Deep Concept Analysis with explanations, examples, and real-world applications, 📊 Structured Tables for definitions/comparisons/data, 💡 Critical Formulas/Equations with derivations and use cases, 🧠 Advanced Memory Techniques (chunking, elaboration, method of loci), 🔗 Concept Connections showing relationships between ideas, 📊 Mermaid Diagrams (flowcharts, mind maps, sequence diagrams), 📝 Active Learning Strategies (self-testing, spaced repetition), 🎯 Exam-Ready Content with practice questions and answer explanations, 📚 Historical Context and Background, 🔬 Scientific Principles and Theories, 🌍 Global Perspectives and Cultural Context, 💼 Career Applications and Industry Relevance, 🎓 Learning Objectives and Outcomes, 📖 Detailed Explanations with Multiple Examples, 🧪 Practical Experiments and Activities, 📈 Data Analysis and Interpretation, 🔍 Critical Thinking Questions and Discussions. Use emojis strategically. Format in Markdown with proper hierarchy. Make notes analytical, thought-provoking, and designed for deep understanding. EXTREMELY DETAILED - GO FOR LENGTH AND DEPTH.",
              },
              {
                role: "user",
                content: `Generate EXTREMELY COMPREHENSIVE, DETAILED study notes from this PDF (${numPages} pages). This should be VERY LONG - at least 2000+ words spanning multiple pages. Analyze the material deeply, identify patterns, explain the 'why' behind concepts, provide real-world applications, and create connections between ideas. Include: detailed explanations with multiple examples, historical context, scientific principles, global perspectives, career applications, learning objectives, practical experiments, data analysis, critical thinking questions, practice questions with detailed answer explanations, memory techniques, concept maps, and study strategies. Make it exceptionally detailed, well-organized, and optimized for deep learning. GO FOR MAXIMUM LENGTH AND DETAIL:\n\n${text.substring(0, 15000)}`,
              },
            ],
            max_tokens: 8000,
            temperature: 0.8,
          }),
        }
      );

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        notes =
          aiData.choices?.[0]?.message?.content ||
          generateBasicNotes(text, file.name, numPages);
      } else {
        notes = generateBasicNotes(text, file.name, numPages);
      }
    } else {
      notes = generateBasicNotes(text, file.name, numPages);
    }

    return NextResponse.json({
      success: true,
      filename: file.name,
      pages: numPages,
      text: text.substring(0, 5000), // Return first 5000 chars for preview
      notes,
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}

function generateBasicNotes(
  text: string,
  filename: string,
  pages: number
): string {
  const lines = text.split("\n").filter((line) => line.trim());
  const title = filename.replace(".pdf", "").replace(/_/g, " ");

  // Extract potential headings
  const potentialHeadings = lines
    .filter(
      (line) =>
        line.length < 100 &&
        (line === line.toUpperCase() || /^[A-Z]/.test(line))
    )
    .slice(0, 5);

  // Extract potential definitions
  const definitions = lines
    .filter(
      (line) => line.includes(":") || line.includes(" - ") || line.includes("—")
    )
    .slice(0, 5);

  // Extract list items
  const listItems = lines
    .filter(
      (line) =>
        /^[\s]*[•\-\*]\s/.test(line) || /^[\s]*\d+[\.\)]\s/.test(line)
    )
    .slice(0, 8);

  // Build notes
  let notes = `## ${title}\n\n`;
  notes += `### Summary\n`;
  notes += `This document contains ${pages} pages of content. `;
  notes += `The following notes extract the key concepts and important information.\n\n`;

  if (potentialHeadings.length > 0) {
    notes += `### Key Topics\n`;
    potentialHeadings.forEach((heading) => {
      notes += `- **${heading.trim()}**\n`;
    });
    notes += "\n";
  }

  if (definitions.length > 0) {
    notes += `### Definitions & Key Terms\n`;
    notes += `| Term/Concept | Description |\n`;
    notes += `|-------------|-------------|\n`;
    definitions.forEach((def) => {
      const parts = def.split(/[:\-—]/);
      if (parts.length >= 2) {
        notes += `| ${parts[0].trim()} | ${parts.slice(1).join(" ").trim()} |\n`;
      }
    });
    notes += "\n";
  }

  if (listItems.length > 0) {
    notes += `### Important Points\n`;
    listItems.forEach((item, index) => {
      notes += `${index + 1}. ${item.replace(/^[\s]*[•\-\*\d+[\.\)]]\s*/, "").trim()}\n`;
    });
    notes += "\n";
  }

  notes += `### Study Tips\n`;
  notes += `1. Review this note within 24 hours for better retention\n`;
  notes += `2. Generate flashcards from the **Flashcards** tool (free)\n`;
  notes += `3. Take a practice quiz in **Quizzes** (free)\n`;
  notes += `4. Use the AI Chat to ask questions about this content\n\n`;

  notes += `---\n`;
  notes += `*Source: PDF · ${pages} pages · Processed by Swiftr AI*`;

  return notes;
}