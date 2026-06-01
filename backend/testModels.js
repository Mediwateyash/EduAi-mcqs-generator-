import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro',
  'gemini-2.0-flash-exp'
];

async function testAll() {
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'OK'");
      console.log(`✅ SUCCESS with ${modelName}: ${result.response.text()}`);
      process.exit(0);
    } catch (error) {
      console.log(`❌ FAILED with ${modelName}: ${error.message.substring(0, 100)}`);
    }
  }
  console.log("None of the models worked!");
}

testAll();
