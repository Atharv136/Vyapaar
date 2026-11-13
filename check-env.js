const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log("Error: .env file does not exist.");
    process.exit(1);
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