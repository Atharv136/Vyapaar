import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const examplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(examplePath)) {
        console.log("Notice: .env was not found. Initialized .env template from .env.example.\n");
        fs.copyFileSync(examplePath, envPath);
    } else {
        console.log("Error: .env file does not exist.");
        process.exit(1);
    }
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

console.log("--- Environment Status Check ---");
lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...valParts] = trimmed.split('=');
    const val = valParts.join('=').trim();

    if (val && val.length > 0) {
        console.log(`${key}: set`);
    } else {
        console.log(`${key}: missing`);
        console.log(`INPUT NEEDED: Please provide a value for ${key}`);
    }
});