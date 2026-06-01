import { extractTextFromFile } from './services/parserService.js';
import fs from 'fs';
import path from 'path';

const test = async () => {
    try {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
           console.log("Uploads dir not found");
           return;
        }
        const files = fs.readdirSync(uploadDir);
        const pdf = files.find(f => f.endsWith('.pdf'));
        if (!pdf) {
            console.log("No PDF found in uploads to test");
            return;
        }
        const filePath = path.join(uploadDir, pdf);
        console.log("Testing extraction on:", filePath);
        const text = await extractTextFromFile(filePath);
        console.log("-----------------------");
        console.log("Extracted Text Start:", text.substring(0, 500));
        console.log("-----------------------");
        console.log("Text Length:", text.length);
        if (text.startsWith('%PDF')) {
            console.log("FAIL: Still binary!");
        } else if (text.length > 10) {
            console.log("SUCCESS: Text extracted!");
        } else {
            console.log("FAIL: Empty or too short.");
        }
    } catch (e) {
        console.log("FATAL ERROR:", e);
    }
};
test();
