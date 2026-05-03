import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askAi(prompt: string, contextImage?: string) {
  try {
    const contents: any[] = [];
    
    if (contextImage) {
      const base64Data = contextImage.split(',')[1];
      contents.push({
        inlineData: {
          mimeType: "image/png",
          data: base64Data
        }
      });
    }
    
    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: contents },
      config: {
        systemInstruction: "You are DigiSchool AI, a helpful school assistant. You help students with notes, questions, and generating study materials like flashcards or MCQs. If asked for a flashcard or MCQ, format your response as a clear Question and Answer.",
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "Maaf, DigiSchool AI sedang mengalami gangguan.";
  }
}

export async function analyzeSelection(imageData: string, task: string = "Summarize this part of my notes") {
  return askAi(task, imageData);
}
