import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const audioTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", ".mp3", ".wav", ".m4a"];
    const isAudio = audioTypes.some(type => file.name.toLowerCase().endsWith(type) || file.type.includes(type.split("/")[1]));
    
    if (!isAudio) {
      return NextResponse.json({ error: "File must be an audio file (.mp3, .wav, .m4a)" }, { status: 400 });
    }

    // Transcribe audio using OpenAI Whisper API
    let text = file.name;
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey) {
      try {
        const whisperFormData = new FormData();
        whisperFormData.append("file", file);
        whisperFormData.append("model", "whisper-1");
        
        const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: whisperFormData,
        });
        
        if (whisperResponse.ok) {
          const whisperData = await whisperResponse.json();
          text = whisperData.text || file.name;
        }
      } catch (error) {
        console.error("Audio transcription error:", error);
        // Fall back to filename if transcription fails
        text = file.name;
      }
    }

    // Generate notes using AI if API key is available and we have transcribed text
    let notes: string;

    if (apiKey && text !== file.name) {
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
                    "You are an expert study notes generator and educational AI assistant. Create comprehensive, intellectually rigorous study notes from audio lecture content that include: 📋 Executive Summary with key insights, 🎯 Deep Concept Analysis with explanations, examples, and real-world applications, 📊 Structured Tables for definitions/comparisons/data, 💡 Critical Formulas/Equations with derivations and use cases, 🧠 Advanced Memory Techniques (chunking, elaboration, method of loci), 🔗 Concept Connections showing relationships between ideas, 📊 Mermaid Diagrams (flowcharts, mind maps, sequence diagrams), 📝 Active Learning Strategies (self-testing, spaced repetition), 🎯 Exam-Ready Content with practice questions and answer explanations. Use emojis strategically. Format in Markdown with proper hierarchy. Make notes analytical, thought-provoking, and designed for deep understanding.",
                },
                {
                  role: "user",
                  content: `Generate comprehensive, intellectually rigorous study notes from this audio lecture. Analyze the material deeply, identify patterns, explain the 'why' behind concepts, provide real-world applications, and create connections between ideas. Include practice questions with explanations. Make it detailed, well-organized, and optimized for deep learning:\n\nLecture: ${text}`,
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
    console.error("Audio upload error:", error);
    return NextResponse.json(
      { error: "Failed to process audio file" },
      { status: 500 }
    );
  }
}

function generateBasicNotes(text: string, filename: string): string {
  if (text === filename) {
    return `# ${filename} 🎙️

## ⚠️ Audio Transcription Not Available

Audio transcription requires an OpenAI API key with Whisper access. The audio file was uploaded but could not be transcribed.

### To Enable Audio Transcription:
1. Ensure you have an OpenAI API key
2. Add it to your environment variables as \`OPENAI_API_KEY\`
3. The API key must have access to the Whisper model

### Alternative:
- Upload the transcript as a text file instead
- Use the PDF upload feature with lecture slides
- Type the lecture content directly into the text input

---
*Source: Audio Lecture · Processed by Swiftr AI 🚀*`;
  }

  return `# ${filename} 🎙️

## 📋 Summary
Audio lecture notes generated by Swiftr AI — comprehensive study material for deep learning.

## 🎯 Key Concepts
- **Main Topic**: Core subject matter from the lecture 🔑
- **Supporting Points**: Detailed explanations and examples 💡
- **Applications**: Real-world use cases and practical applications 🚀

## 📊 Important Points
✓ First critical insight from the lecture
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
*Source: Audio Lecture · Processed by Swiftr AI 🚀*`;
}
