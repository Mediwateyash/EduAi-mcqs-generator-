import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function discover() {
  try {
    // In SDK 0.24.1, listModels is an async function on the genAI instance
    const result = await genAI.listModels();
    console.log("AVAILABLE MODELS:");
    for (const m of result.models) {
      console.log(`- ${m.name} (${m.displayName})`);
    }
  } catch (error) {
    console.error("Discovery Error:", error.message);
  }
}

discover();
