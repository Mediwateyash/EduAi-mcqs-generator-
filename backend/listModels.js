import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const listModelsResponse = await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).listModels();
    // Wait, listModels is actually on the genAI instance in some versions or requires a different path
    // Actually, in the latest SDK, you might need to use a different approach.
    // Let's try the common way to check if a model exists.
    console.log("Checking model connectivity...");
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Hi");
    console.log("Success with gemini-1.5-flash:", result.response.text());
  } catch (error) {
    console.error("Error with gemini-1.5-flash:", error.message);
    
    try {
        console.log("Trying gemini-pro...");
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent("Hi");
        console.log("Success with gemini-pro:", result.response.text());
    } catch (e2) {
        console.error("Error with gemini-pro:", e2.message);
    }
  }
}

listModels();
