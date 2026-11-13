import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode';
import pino from 'pino';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Process crash prevention for asynchronous Baileys library events
process.on('uncaughtException', (err) => {
  console.warn('⚠️ Process uncaughtException intercepted:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.warn('⚠️ Process unhandledRejection intercepted:', reason?.message || reason);
});

// 1. Load GEMINI_API_KEY from the parent .env file
dotenv.config({ path: path.join(__dirname, '../.env') });
// Also load local .env as fallback if present
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = 3001;

// 2. Setup Express & Socket.IO with CORS enabled for *
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 3. Gemini AI Client Setup
let aiClient = null;
const apiKey = process.env.GEMINI_API_KEY?.trim();
if (apiKey && apiKey !== 'your_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log('✨ Gemini AI Client initialized with model gemini-3-flash-preview');
  } catch (err) {
    console.error('Failed to initialize Gemini AI client:', err);
  }
} else {
  console.log('ℹ️ Notice: GEMINI_API_KEY not configured or placeholder in .env; verified catalog fallback engine active.');
}

// 4. In-Memory Store & Conversation State
let activeStoreConfig = {
  storeName: 'Vyapaar Store',
  phone: '9876543210',
  occupation: 'Retail & Commerce',
  deliveryMode: 'local',
  activeStages: [
    { stageNum: 'Stage 01', tag: 'Voice Ingestion', title: 'Multilingual Voice STT', desc: 'Parses customer voice notes into items' },
    { stageNum: 'Stage 02', tag: 'Catalog', title: 'Verified Inventory Sync', desc: 'Locks prices deterministically' },
    { stageNum: 'Stage 03', tag: 'Payment', title: 'Zero-Fee UPI Link & Pay', desc: 'Generates 1-click WhatsApp Pay link' },
    { stageNum: 'Stage 04', tag: 'Dispatch', title: 'Local Delivery Dispatch', desc: 'Alerts rider with buyer landmark' }
  ],
  catalog: [
    { name: 'Paneer Tikka Pizza (10-inch)', cat: 'Woodfired Pizza', price: 349, stock: 'Ready to Fire' },
    { name: 'Dum Murgh Biryani (Handi)', cat: 'Biryanis & Rice', price: 389, stock: 'Ready to Fire' },
    { name: 'Crispy Chilli Babycorn', cat: 'Starters & Appetizers', price: 210, stock: 'Ready to Fire' },
    { name: 'Dal Makhani (Slow Cooked)', cat: 'Main Course', price: 260, stock: 'Ready to Fire' },
    { name: 'Gulab Jamun (2 Pieces)', cat: 'Desserts', price: 80, stock: 'In Kitchen' },
    { name: 'Diet Coke Can (300ml)', cat: 'Beverages', price: 40, stock: 'Chilled (30)' }
  ]
};

// Per-sender conversation history: Map<remoteJid, Array<{ role: 'user' | 'model', parts: [{ text: string }] }>>
const conversationMemory = new Map();
const MAX_MEMORY_TURNS = 12;

function getSenderHistory(jid) {
  if (!conversationMemory.has(jid)) {
    conversationMemory.set(jid, []);
  }
  return conversationMemory.get(jid);
}

function recordTurn(jid, userText, botReply) {
  const history = getSenderHistory(jid);
  history.push({ role: 'user', parts: [{ text: userText }] });
  history.push({ role: 'model', parts: [{ text: botReply }] });
  if (history.length > MAX_MEMORY_TURNS * 2) {
    history.splice(0, history.length - MAX_MEMORY_TURNS * 2);
  }
}

// 5. Build Dynamic Gemini System Instruction
function buildSystemInstruction(storeConfig) {
  const storeName = storeConfig.storeName || 'Vyapaar Store';
  const occupation = storeConfig.occupation || 'Store';
  const deliveryMode = storeConfig.deliveryMode || 'local';
  
  const fulfillmentDesc = deliveryMode === 'local'
    ? '🛵 Local Delivery: Dispatched via in-house rider within 5km (estimated 30-45 minutes).'
    : deliveryMode === 'pickup'
      ? '🛍️ Store Pickup: Customer collects order directly at store counter.'
      : '📦 Courier Dispatch: Surface shipping with tracking across India.';

  const catalogStr = (storeConfig.catalog || []).map((item, idx) => 
    `${idx + 1}. ${item.name} (${item.cat || 'General'}) — ₹${item.price} [${item.stock || 'In Stock'}]`
  ).join('\n');

  const stagesStr = (storeConfig.activeStages || []).map(st => 
    `- [${st.stageNum || ''}] ${st.title}: ${st.desc}`
  ).join('\n');

  return `You are the official WhatsApp AI Shopping and Ordering Assistant for "${storeName}", an Indian ${occupation}.
You are interacting directly with customers inside WhatsApp.

STORE OPERATING DETAILS:
- Merchant Name: ${storeName}
- Business Type: ${occupation}
- Fulfillment Model: ${fulfillmentDesc}
- Active Store Workflow Stages:
${stagesStr}

STRICT VERIFIED CATALOG & PRICES (IN ₹ INR):
${catalogStr}

CORE BEHAVIOR RULES:
1. GREETING & TONE: Greet customers warmly and naturally in English or conversational Indian Hinglish (e.g., "Namaste!", "Welcome to ${storeName}! How can I help you today?"). Match the customer's language.
2. STRICT CATALOG ACCURACY: YOU MUST ONLY RECOMMEND, QUOTE, AND CONFIRM ITEMS AND PRICES THAT APPEAR IN THE VERIFIED CATALOG ABOVE. Do not invent products or offer arbitrary discounts.
3. MENU / CATALOG BROWSING: When asked for the menu, prices, or options, present them clearly with clean emojis, categories, and exact ₹ prices.
4. ORDER TAKING & TOTAL CALCULATION:
   - When the customer indicates what they want, verify the item name and quantity.
   - Calculate the exact total price in ₹ (sum of item prices * quantity).
   - Ask for their delivery address / landmark and recipient phone number if not already provided.
   - Summarize the final order: list the items, total in ₹, delivery mode (${deliveryMode}), and inform them that their order has been locked and a 1-click UPI payment link is ready.
5. CONCISE & MOBILE OPTIMIZED: Keep replies concise, polite, well-structured, and easy to read on mobile screens using WhatsApp Markdown (*bold*, bullet points).
6. Never break character. Always represent ${storeName} with warmth and reliability.`;
}

// 6. Conversational Fallback Engine (when Gemini API key is unset or network error)
function generateFallbackReply(userText, storeConfig) {
  const text = (userText || '').toLowerCase();
  const storeName = storeConfig.storeName || 'Vyapaar Store';
  const catalog = storeConfig.catalog || [];

  if (text.includes('hi') || text.includes('hello') || text.includes('namaste') || text.includes('hey')) {
    const previewList = catalog.slice(0, 3).map(i => `• *${i.name}* - ₹${i.price}`).join('\n');
    return `Namaste! Welcome to *${storeName}* on WhatsApp 🙏\n\nHow can I help you today? Here are some of our popular items:\n${previewList}\n\nType *Menu* to see all items, or tell me what you'd like to order!`;
  }

  if (text.includes('menu') || text.includes('catalog') || text.includes('list') || text.includes('price') || text.includes('item')) {
    const fullList = catalog.map((item, idx) => `*${idx + 1}. ${item.name}*\n   Category: ${item.cat || 'General'} | Price: *₹${item.price}* (${item.stock || 'In Stock'})`).join('\n\n');
    return `📋 *${storeName} — Verified Catalog*\n\n${fullList}\n\nTo place an order, just reply with the item name or number!`;
  }

  // Check if user requested an item from catalog
  for (const item of catalog) {
    const itemWords = item.name.toLowerCase().split(' ').filter(w => w.length > 3);
    const matched = itemWords.some(w => text.includes(w));
    if (matched) {
      const mode = storeConfig.deliveryMode === 'local' ? '🛵 Local delivery within 5km' : '🛍️ Store takeaway';
      return `Great choice! I have noted *${item.name}* (₹${item.price}) for you.\n\n• Price: *₹${item.price}*\n• Fulfillment: *${mode}*\n\nPlease reply with your delivery address / landmark and quantity to confirm your order!`;
    }
  }

  if (text.includes('order') || text.includes('buy') || text.includes('deliver') || text.includes('address')) {
    return `Thank you! Your order is being processed by *${storeName}*.\n\nOur delivery team is notified. A secure zero-fee UPI payment link is generated for your checkout. Reply with any special instructions or additional items!`;
  }

  // Default natural response
  return `Thank you for messaging *${storeName}*! We have received your request. You can browse our verified catalog by typing *Menu*, or let us know which items you would like to order today.`;
}

// 7. Generate Response using Gemini 3 Flash Preview (with Fallback)
async function callGemini(jid, userText, storeConfig) {
  const history = getSenderHistory(jid);
  const systemInstruction = buildSystemInstruction(storeConfig);

  if (aiClient) {
    try {
      console.log(`🤖 Invoking Gemini (gemini-3-flash-preview) for ${jid}...`);
      const response = await aiClient.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userText }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      const reply = response.text?.trim();
      if (reply) {
        recordTurn(jid, userText, reply);
        return reply;
      }
    } catch (err) {
      console.warn('Gemini 3 Flash call failed, attempting gemini-2.5-flash fallback:', err.message);
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            ...history,
            { role: 'user', parts: [{ text: userText }] }
          ],
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });
        const reply = response.text?.trim();
        if (reply) {
          recordTurn(jid, userText, reply);
          return reply;
        }
      } catch (err2) {
        console.warn('Gemini 2.5 Flash fallback also failed:', err2.message);
      }
    }
  }

  const fallback = generateFallbackReply(userText, storeConfig);
  recordTurn(jid, userText, fallback);
  return fallback;
}

// 8. Baileys Multi-Device WhatsApp Socket Manager
const authPath = path.join(__dirname, 'auth_info');
if (!fs.existsSync(authPath)) {
  fs.mkdirSync(authPath, { recursive: true });
}

let sock = null;
let currentStatus = { state: 'starting', message: 'Ready to connect' };
let lastQrDataUrl = null;
let isStartingSocket = false;

async function startWhatsAppSocket() {
  if (isStartingSocket) return;
  isStartingSocket = true;

  try {
    currentStatus = { state: 'starting', message: 'Initializing WhatsApp session...' };
    io.emit('wa:status', currentStatus);

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`📱 WhatsApp Multi-Device Engine v${version.join('.')} (Latest: ${isLatest})`);

    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: state,
      browser: ['Vyapaar Storefront', 'Chrome', '120.0.0'],
      syncFullHistory: false,
      generateHighQualityLinkPreview: false,
      markOnlineOnConnect: true,
      defaultQueryTimeoutMs: 60000
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          lastQrDataUrl = await qrcode.toDataURL(qr, { margin: 2, scale: 6 });
          currentStatus = { state: 'qr', message: 'Scan QR Code' };
          console.log('📲 QR Code generated! Broadcasting to frontend...');
          io.emit('wa:qr', lastQrDataUrl);
          io.emit('wa:status', currentStatus);
        } catch (qrErr) {
          console.error('Failed to encode QR code:', qrErr);
        }
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error instanceof Boom)
          ? lastDisconnect.error.output?.statusCode
          : (lastDisconnect?.error?.code || null);

        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`⚠️ WhatsApp connection closed (code: ${statusCode}). Reconnect: ${shouldReconnect}`);

        currentStatus = { state: 'disconnected', message: 'Disconnected' };
        io.emit('wa:status', currentStatus);

        isStartingSocket = false;
        if (shouldReconnect) {
          setTimeout(() => startWhatsAppSocket(), 3000);
        } else {
          console.log('User logged out from WhatsApp. Resetting session...');
          try {
            if (sock) {
              sock.ev.removeAllListeners('connection.update');
              sock.ev.removeAllListeners('creds.update');
              sock.ev.removeAllListeners('messages.upsert');
              sock.end?.();
            }
          } catch (_) {}
          try {
            fs.rmSync(authPath, { recursive: true, force: true });
            fs.mkdirSync(authPath, { recursive: true });
          } catch (rmErr) {
            console.error('Failed to clean auth_info:', rmErr);
          }
          setTimeout(() => startWhatsAppSocket(), 2000);
        }
      } else if (connection === 'open') {
        console.log('🟢 WhatsApp Connection OPEN! Bot is live and listening.');
        currentStatus = { state: 'connected', message: '🟢 WhatsApp Bot Live & Listening' };
        lastQrDataUrl = null;
        isStartingSocket = false;
        io.emit('wa:status', currentStatus);
      }
    });

    // Handle inbound customer messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation ||
                     msg.message.extendedTextMessage?.text ||
                     msg.message.imageMessage?.caption || '';

        if (!text.trim()) continue;

        console.log(`📩 [WhatsApp] Message from ${from}: "${text}"`);

        // Generate response using Gemini with dynamic store context
        const botReply = await callGemini(from, text, activeStoreConfig);
        console.log(`📤 [WhatsApp] Replying to ${from}: "${botReply.slice(0, 100)}..."`);

        try {
          await sock.sendMessage(from, { text: botReply });
        } catch (sendErr) {
          console.error(`Failed to send WhatsApp message to ${from}:`, sendErr);
        }
      }
    });

  } catch (err) {
    console.error('Error starting WhatsApp socket:', err);
    currentStatus = { state: 'disconnected', message: err.message };
    io.emit('wa:status', currentStatus);
    isStartingSocket = false;
  }
}

// 9. Socket.IO Connection & Frontend Event Listeners
io.on('connection', (socket) => {
  console.log(`🔌 Frontend client connected: ${socket.id}`);

  // Send immediate status upon connection
  socket.emit('wa:status', currentStatus);
  if (lastQrDataUrl && currentStatus.state === 'qr') {
    socket.emit('wa:qr', lastQrDataUrl);
  }

  // Handle launch-store-bot event from "Launch WhatsApp Store & Go Live 🚀" button
  socket.on('launch-store-bot', async (payload) => {
    console.log('🚀 Received launch-store-bot event from frontend:');
    console.log(`   • Store: "${payload.storeName || activeStoreConfig.storeName}"`);
    console.log(`   • Phone: "${payload.phone || activeStoreConfig.phone}"`);
    console.log(`   • Occupation: "${payload.occupation || activeStoreConfig.occupation}"`);
    console.log(`   • Delivery Mode: "${payload.deliveryMode || activeStoreConfig.deliveryMode}"`);
    console.log(`   • Catalog SKUs: ${payload.catalog ? payload.catalog.length : 0} items`);
    console.log(`   • Active Stages: ${payload.activeStages ? payload.activeStages.length : 0} stages`);

    if (payload) {
      activeStoreConfig = {
        storeName: payload.storeName || activeStoreConfig.storeName,
        phone: payload.phone || activeStoreConfig.phone,
        occupation: payload.occupation || activeStoreConfig.occupation,
        deliveryMode: payload.deliveryMode || activeStoreConfig.deliveryMode,
        activeStages: payload.activeStages || activeStoreConfig.activeStages,
        catalog: (payload.catalog && payload.catalog.length > 0) ? payload.catalog : activeStoreConfig.catalog
      };
    }

    // Start Baileys socket if not already open
    if (!sock || currentStatus.state === 'disconnected') {
      startWhatsAppSocket();
    } else {
      socket.emit('wa:status', currentStatus);
      if (lastQrDataUrl && currentStatus.state === 'qr') {
        socket.emit('wa:qr', lastQrDataUrl);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// 10. HTTP Health Check & API routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    waStatus: currentStatus,
    store: activeStoreConfig.storeName,
    catalogCount: activeStoreConfig.catalog.length
  });
});

// 11. Start Server on Port 3001
httpServer.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 WhatsApp Bot Control Server running at http://localhost:${PORT}`);
  console.log(`   • Socket.IO ready on port ${PORT}`);
  console.log(`   • Listening for 'launch-store-bot' event`);
  console.log(`=======================================================`);
});
