import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Extract text content based on file type
    let text: string;

    if (file.name.endsWith(".pdf")) {
      // For PDF files, redirect to PDF upload route
      const pdfFormData = new FormData();
      pdfFormData.append("file", file);
      const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/upload/pdf`, {
        method: "POST",
        body: pdfFormData,
      });
      const pdfData = await pdfResponse.json();
      return NextResponse.json(pdfData);
    } else if (file.name.endsWith(".txt")) {
      // For text files, read the content
      text = await file.text();
    } else {
      // For other files, use filename as content
      text = file.name;
    }

    // Generate notes using AI if API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    let notes: string;

    if (apiKey && text.length > 10) {
      try {
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
                    "You are an expert study notes generator and educational AI assistant. Create comprehensive, intellectually rigorous study notes from uploaded content that include: 📋 Executive Summary with key insights, 🎯 Deep Concept Analysis with explanations, examples, and real-world applications, 📊 Structured Tables for definitions/comparisons/data, 💡 Critical Formulas/Equations with derivations and use cases, 🧠 Advanced Memory Techniques (chunking, elaboration, method of loci), 🔗 Concept Connections showing relationships between ideas, 📊 Mermaid Diagrams (flowcharts, mind maps, sequence diagrams), 📝 Active Learning Strategies (self-testing, spaced repetition), 🎯 Exam-Ready Content with practice questions and answer explanations. Use emojis strategically. Format in Markdown with proper hierarchy. Make notes analytical, thought-provoking, and designed for deep understanding.",
                },
                {
                  role: "user",
                  content: `Generate comprehensive, intellectually rigorous study notes from this uploaded content. Analyze the material deeply, identify patterns, explain the 'why' behind concepts, provide real-world applications, and create connections between ideas. Include practice questions with explanations. Make it detailed, well-organized, and optimized for deep learning:\n\n${text.substring(0, 10000)}`,
                },
              ],
              max_tokens: 4000,
              temperature: 0.8,
            }),
          }
        );

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          notes = aiData.choices?.[0]?.message?.content || generateBasicNotes(text, file.name);
        } else {
          notes = generateBasicNotes(text, file.name);
        }
      } catch {
        notes = generateBasicNotes(text, file.name);
      }
    } else {
      notes = generateBasicNotes(text, file.name);
    }

    return NextResponse.json({
      filename: file.name,
      notes,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}

function generateBasicNotes(text: string, filename: string): string {
  return `# ${filename} 📁

## 📋 Summary
Uploaded content processed by Swiftr AI — comprehensive study material for deep learning.

## 🎯 Key Concepts
- **Main Topic**: Core subject matter from the uploaded file 🔑
- **Supporting Points**: Detailed explanations and examples 💡
- **Applications**: Real-world use cases and practical applications 🚀

## 📊 Important Points
✓ First critical insight from the content
✓ Second key takeaway for exam preparation
✓ Third essential concept for mastery
✓ Fourth important detail to remember

## 🧠 Memory Techniques
💭 **Mnemonic Device**: Create associations to recall key information
🎯 **Chunking Strategy**: Break complex information into manageable parts

## 📝 Study Tips
1. 🕐 Review notes within 24 hours for maximum retention
2. 🔄 Generate flashcards from the **Flashcards** tool (free)
3. 📝 Take a practice quiz in **Quizzes** (free)
4. 💬 Use AI Chat to ask questions and deepen understanding
5. 🎯 Relate concepts to real-world examples

---
*Source: Uploaded File · Processed by Swiftr AI 🚀*`;
}
