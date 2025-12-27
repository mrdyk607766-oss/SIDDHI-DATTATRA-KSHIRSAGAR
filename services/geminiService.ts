
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `You are a world-class Socratic Tutor. Your goal is to help the user learn a concept through discovery.

RULES:
1. NEVER give long explanations or paragraphs. Maximum 2 short sentences at a time.
2. ALWAYS end your response with a thought-provoking question that leads the user closer to the concept.
3. Start by asking what the user already knows about the topic.
4. If the user is correct, briefly acknowledge it and immediately move to the next logical step with a harder question.
5. If the user is stuck, provide a tiny analogy or a "hint" question, never the direct answer.
6. Use an encouraging, intellectual, but concise tone.
7. Your goal is to "charge" the user's brain by making them perform the mental work.

FORMAT:
[Brief feedback/observation]. [A single, surgical question].`;

export class SocraticAI {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async startNewSession(concept: string) {
    this.chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const response = await this.chat.sendMessage({ 
      message: `Let's explore the concept of "${concept}". Please start our Socratic dialogue.` 
    });
    return response.text;
  }

  async sendMessage(text: string) {
    if (!this.chat) throw new Error("Chat not initialized");
    
    const response = await this.chat.sendMessage({ message: text });
    return response.text;
  }

  // Analyzing the "Brain Charge" based on user response quality
  async evaluateBrainCharge(userMessage: string, assistantQuestion: string): Promise<number> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Assistant asked: "${assistantQuestion}". User replied: "${userMessage}". On a scale of 0-20, how much "mental effort" or "critical thinking" does the user's reply show? Reply with ONLY the number.`,
    });
    
    const score = parseInt(response.text?.trim() || "0");
    return isNaN(score) ? 5 : score;
  }
}

export const socraticAI = new SocraticAI();
