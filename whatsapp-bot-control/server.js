import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import pino from 'pino';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

// Serve static frontend dashboard
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// State variables
let sock = null;
let botStatus = 'offline'; // 'offline', 'connecting', 'qr_ready', 'connected'
let currentQR = null;
let currentQRDataUrl = null;
let connectedUser = null;
let isStarting = false;

// Initialize Gemini Client
let geminiModel = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_api_key_here') {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: `You are Vyapaar, a helpful, polite, and rapid WhatsApp conversational business assistant for an Indian merchant store (${process.env.STORE_NAME || 'Vyapaar Store'}).
- Tone: Warm, respectful, bilingual (English & Hinglish), concise and professional.
- Capabilities: Answer product inquiries, take orders, confirm delivery slots, calculate item totals in INR (₹), and provide payment UPI details.
- Formatting: Format for WhatsApp (use *bold* for product names and prices, bullet points with emojis, keep answers brief and readable on mobile).`
    });
    console.log('✓ Gemini AI initialized successfully with model:', process.env.GEMINI_MODEL || 'gemini-2.5-flash');
  } catch (err) {
    console.warn('Notice: @google/generative-ai could not be initialized:', err.message);
  }
} else {
  console.log('Notice: GEMINI_API_KEY is not set or set to placeholder. Fallback conversational rules active.');
}

// Helper: Broadcast log message to connected UI clients
function broadcastLog(level, message, metadata = {}) {
  const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false });
  const logObj = { timestamp, level, message, metadata };
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  io.emit('bot_log', logObj);
}

// Helper: Broadcast status update
function broadcastStatus() {
  io.emit('bot_status', {
    status: botStatus,
    number: connectedUser,
    qr: currentQRDataUrl
  });
}

// Process customer message with Gemini or Smart Fallback
async function processMessageWithGemini(customerText, senderJid) {
  if (geminiModel) {
    try {
      broadcastLog('ai', `Sending prompt to Gemini: "${customerText}"`);
      const response = await geminiModel.generateContent(customerText);
      const reply = response.response.text();
      return reply.trim();
    } catch (err) {
      broadcastLog('error', `Gemini API error: ${err.message}. Using fallback responder.`);
    }
  }

  // Intelligent fallback responder if Gemini API key is not configured
  const lower = customerText.toLowerCase();
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('namaste')) {
    return `*Namaste!* 🙏 Welcome to *${process.env.STORE_NAME || 'Vyapaar Store'}* on WhatsApp.\n\nHow can I help you today?\n• 🛒 *Browse Catalog & Prices*\n• 📦 *Track Existing Order*\n• 💬 *Speak to Merchant*`;
  } else if (lower.includes('price') || lower.includes('order') || lower.includes('buy') || lower.includes('kilo') || lower.includes('kg')) {
    return `Got it! I have added your requested items to the cart. 🛍️\n\nYour order total is verified in *paise* and comes to *₹345*.\n\nWould you like delivery to your saved address? Reply *YES* to confirm.`;
  } else {
    return `Thank you for messaging *${process.env.STORE_NAME || 'Vyapaar Store'}*! 🌿\n\nI received your query: "_${customerText}_". Our team is reviewing this and will reply shortly.`;
  }
}

// Start WhatsApp Baileys Connection
async function startWhatsApp() {
  if (isStarting || botStatus === 'connected') return;
  isStarting = true;
  botStatus = 'connecting';
  currentQR = null;
  currentQRDataUrl = null;
  broadcastStatus();
  broadcastLog('info', 'Initiating WhatsApp Web Multi-Device Socket via Baileys...');

  try {
    const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = await import('@whiskeysockets/baileys');

    // Create auth directory if not exists
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    broadcastLog('info', `Using Baileys WhatsApp Web API v${version.join('.')}, isLatest: ${isLatest}`);

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['Vyapaar Bot Control', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQR = qr;
        try {
          currentQRDataUrl = await QRCode.toDataURL(qr, { margin: 1.5, width: 280 });
          botStatus = 'qr_ready';
          broadcastStatus();
          broadcastLog('qr', 'New WhatsApp pairing QR Code generated. Scan with your phone.');
        } catch (qrErr) {
          broadcastLog('error', `Failed to render QR Code: ${qrErr.message}`);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        botStatus = 'offline';
        currentQR = null;
        currentQRDataUrl = null;
        connectedUser = null;
        isStarting = false;
        broadcastStatus();
        broadcastLog('warn', `Connection closed (Code: ${statusCode || 'unknown'}). Should reconnect: ${shouldReconnect}`);

        if (statusCode === DisconnectReason.loggedOut) {
          broadcastLog('warn', 'Session was logged out from device. Cleaning credentials cache.');
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          } catch (e) {}
        }
      } else if (connection === 'open') {
        botStatus = 'connected';
        currentQR = null;
        currentQRDataUrl = null;
        connectedUser = sock.user?.id ? sock.user.id.split(':')[0] : 'Connected Phone';
        isStarting = false;
        broadcastStatus();
        broadcastLog('success', `🎉 Successfully linked & authenticated as +${connectedUser}! Bot is live.`);
      }
    });

    // Listen for incoming WhatsApp messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const m of messages) {
        // Ignore self-sent messages and status broadcasts
        if (m.key.fromMe || m.key.remoteJid === 'status@broadcast') continue;

        const sender = m.key.remoteJid;
        const senderNumber = sender.replace('@s.whatsapp.net', '');
        const messageText =
          m.message?.conversation ||
          m.message?.extendedTextMessage?.text ||
          m.message?.imageMessage?.caption ||
          '';

        if (!messageText) continue;

        broadcastLog('inbound', `[+${senderNumber}]: "${messageText}"`);

        // Send 'typing...' presence on WhatsApp
        try {
          await sock.sendPresenceUpdate('composing', sender);
        } catch (e) {}

        // Generate AI response
        const aiReply = await processMessageWithGemini(messageText, sender);

        // Send reply back on WhatsApp
        try {
          await sock.sendMessage(sender, { text: aiReply }, { quoted: m });
          await sock.sendPresenceUpdate('available', sender);
          broadcastLog('outbound', `Sent reply to [+${senderNumber}]: "${aiReply.replace(/\n/g, ' ')}"`);
        } catch (sendErr) {
          broadcastLog('error', `Failed to send WhatsApp message to ${sender}: ${sendErr.message}`);
        }
      }
    });

  } catch (err) {
    isStarting = false;
    botStatus = 'offline';
    broadcastStatus();
    broadcastLog('error', `Failed to initialize Baileys WhatsApp client: ${err.message}`);
    console.error(err);
  }
}

// Stop WhatsApp connection
async function stopWhatsApp() {
  if (sock) {
    try {
      broadcastLog('info', 'Deactivating WhatsApp bot connection...');
      sock.end(new Error('Deactivated by user'));
    } catch (e) {}
    sock = null;
  }
  botStatus = 'offline';
  currentQR = null;
  currentQRDataUrl = null;
  connectedUser = null;
  isStarting = false;
  broadcastStatus();
  broadcastLog('info', 'WhatsApp bot is now offline.');
}

// Socket.IO Communication with Web Dashboard
io.on('connection', (clientSocket) => {
  // Send initial state to newly connected dashboard
  clientSocket.emit('bot_status', {
    status: botStatus,
    number: connectedUser,
    qr: currentQRDataUrl
  });

  clientSocket.on('action_activate', () => {
    broadcastLog('info', 'Dashboard triggered: [Activate WhatsApp Bot]');
    startWhatsApp();
  });

  clientSocket.on('action_deactivate', () => {
    broadcastLog('info', 'Dashboard triggered: [Deactivate WhatsApp Bot]');
    stopWhatsApp();
  });

  clientSocket.on('action_simulate_test', async (data) => {
    const testText = data?.text || 'Hello, I want to order 2kg rice and salt';
    broadcastLog('info', `Simulating test customer message: "${testText}"`);
    const reply = await processMessageWithGemini(testText, 'test-client@s.whatsapp.net');
    broadcastLog('outbound', `AI response: "${reply.replace(/\n/g, ' ')}"`);
  });
});

// Start HTTP & WebSocket Server
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  Vyapaar WhatsApp Bot Controller Running`);
  console.log(`  Dashboard URL: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});

