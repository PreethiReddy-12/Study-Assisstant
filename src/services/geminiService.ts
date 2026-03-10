import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface StudyNotes {
  explanation: string;
  keyPoints: string[];
  importantTerms: { term: string; definition: string }[];
}

export interface QuizQuestion {
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export const generateStudyNotes = async (topic: string): Promise<StudyNotes> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate simple study notes for the topic: "${topic}". 
    Make it easy for beginners to understand. 
    Include:
    1. A short, clear explanation.
    2. 5-7 key points in bullet format.
    3. 3-5 important terms with definitions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          importantTerms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING },
              },
              required: ["term", "definition"],
            },
          },
        },
        required: ["explanation", "keyPoints", "importantTerms"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 5 beginner-friendly multiple-choice questions about the topic: "${topic}".
    Each question must have 4 options (A, B, C, D).
    Provide the correct answer and a brief explanation for why it's correct.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A, B, C, or D" },
                  text: { type: Type.STRING },
                },
                required: ["id", "text"],
              },
            },
            correctAnswer: { type: Type.STRING, description: "The ID of the correct option (A, B, C, or D)" },
            explanation: { type: Type.STRING },
          },
          required: ["question", "options", "correctAnswer", "explanation"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};

export const summarizeText = async (text: string): Promise<{ summary: string; points: string[] }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Summarize the following text into short and clear study notes. 
    Use simple language and keep it concise.
    Text: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Highlighted important points" },
        },
        required: ["summary", "points"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};
