import dotenv from 'dotenv';
import { generateMCQsFromText } from './services/aiService.js';

dotenv.config();

console.log('Testing Gemini API with Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Not Set');

const run = async () => {
    try {
        const result = await generateMCQsFromText("The quick brown fox jumps over the lazy dog.", 1);
        console.log("SUCCESS!", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("FAILED!", e);
    }
    process.exit(0);
}
run();
