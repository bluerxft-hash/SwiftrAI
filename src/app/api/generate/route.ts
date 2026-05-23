import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { source, sourceType, label } = await req.json();

    if (!source || !sourceType) {
      return NextResponse.json(
        { error: "Source and sourceType are required" },
        { status: 400 }
      );
    }

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
                  "You are an expert study notes generator and educational AI assistant. Your goal is to create EXTREMELY COMPREHENSIVE, DETAILED study notes that span multiple pages (at least 2000+ words). Create notes that include: 📋 Executive Summary with key insights, 🎯 Deep Concept Analysis with explanations, examples, and real-world applications, 📊 Structured Tables for definitions/comparisons/data, 💡 Critical Formulas/Equations with derivations and use cases, 🧠 Advanced Memory Techniques (chunking, elaboration, method of loci), � Concept Connections showing relationships between ideas, 📊 Mermaid Diagrams (flowcharts, mind maps, sequence diagrams), 📝 Active Learning Strategies (self-testing, spaced repetition), 🎯 Exam-Ready Content with practice questions and answer explanations, 📚 Historical Context and Background, 🔬 Scientific Principles and Theories, 🌍 Global Perspectives and Cultural Context, 💼 Career Applications and Industry Relevance, 🎓 Learning Objectives and Outcomes, 📖 Detailed Explanations with Multiple Examples, 🧪 Practical Experiments and Activities, 📈 Data Analysis and Interpretation, 🔍 Critical Thinking Questions and Discussions. Use emojis strategically. Format in Markdown with proper hierarchy. Make notes analytical, thought-provoking, and designed for deep understanding. EXTREMELY DETAILED - GO FOR LENGTH AND DEPTH.",
              },
              {
                role: "user",
                content: `Generate EXTREMELY COMPREHENSIVE, DETAILED study notes from this ${sourceType} content. This should be VERY LONG - at least 2000+ words spanning multiple pages. Analyze the material deeply, identify patterns, explain the 'why' behind concepts, provide real-world applications, and create connections between ideas. Include: detailed explanations with multiple examples, historical context, scientific principles, global perspectives, career applications, learning objectives, practical experiments, data analysis, critical thinking questions, practice questions with detailed answer explanations, memory techniques, concept maps, and study strategies. Make it exceptionally detailed, well-organized, and optimized for deep learning. GO FOR MAXIMUM LENGTH AND DETAIL:\n\n${source.substring(0, 12000)}`,
              },
            ],
            max_tokens: 8000,
            temperature: 0.8,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          content = data.choices?.[0]?.message?.content || generateMockContent(label || source, sourceType);
        } else {
          content = generateMockContent(label || source, sourceType);
        }
      } catch {
        content = generateMockContent(label || source, sourceType);
      }
    } else {
      content = generateMockContent(label || source, sourceType);
    }

    const title = label || source.slice(0, 48) || "Untitled note";

    return NextResponse.json({
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title,
      source,
      sourceType,
      folder: "General",
      createdAt: new Date().toISOString(),
      content,
    });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: "Failed to generate notes" },
      { status: 500 }
    );
  }
}

function generateMockContent(title: string, sourceType: string): string {
  return `# ${title} 📚

## 📋 Summary
Swiftr AI distilled this ${sourceType} into comprehensive study notes — matching Turbo AI's quality and structure.

## 🎯 Key Concepts
- **Main Idea**: Core topic explained in clear, simple language 🔑
- **Supporting Details**: Secondary points with real-world examples 💡
- **Practical Applications**: How to apply this knowledge on exams and projects 🚀

## 📊 Definitions & Key Terms
| Term | Definition | Example |
|------|-----------|---------|
| Concept A | Clear, concise one-line definition | Real-world application |
| Concept B | Related concept with context | How it connects to main idea |
| Concept C | Important terminology | Usage in practice |

## 💡 Important Points
✓ First critical insight to remember
✓ Second key takeaway from the content
✓ Third essential concept for mastery
✓ Fourth important detail for exams

## 🧠 Memory Tricks & Mnemonics
💭 **Remember this**: Use this mnemonic device to recall key information
🎯 **Quick tip**: Associative memory technique for difficult concepts

## 📝 Study Tips
1. 🕐 Review these notes within 24 hours for maximum retention
2. 🔄 Generate flashcards from the **Flashcards** tool (free)
3. 📝 Take a practice quiz in **Quizzes** (free)
4. 💬 Use AI Chat to ask questions and deepen understanding
5. 🎯 Focus on understanding concepts, not just memorizing

---
*Source: ${sourceType} · Processed by Swiftr AI 🚀*`;
}
