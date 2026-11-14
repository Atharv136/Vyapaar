import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  downloadMediaMessage
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode';
import pino from 'pino';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Process crash prevention for asynchronous library events
process.on('uncaughtException', (err) => {
  console.warn('⚠️ Process uncaughtException intercepted:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.warn('⚠️ Process unhandledRejection intercepted:', reason?.message || reason);
});

// 1. Load Environment Configuration
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT = 3001;
const UPI_VPA = process.env.UPI_VPA || process.env.MERCHANT_UPI_ID || 'cafevaidehi.demo@upi';
const SARVAM_API_KEY = process.env.SARVAM_API_KEY?.trim();
const SARVAM_AGENT_ID = process.env.SARVAM_AGENT_ID || 'whatsapp-ch-779ea7d0-dd9c';
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || '51c4e9533888957';

// 2. Setup Express & Socket.IO with CORS
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve parent storefront website (index.html, designuicss.css, images)
app.use(express.static(path.join(__dirname, '..')));
// Also serve dedicated bot control dashboard at /dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'public')));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 3. Gemini AI Client Setup
let aiClient = null;
const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
if (geminiApiKey && geminiApiKey !== 'your_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
    console.log('✨ Gemini Multimodal AI Client initialized (model: gemini-3-flash-preview)');
  } catch (err) {
    console.error('Failed to initialize Gemini AI client:', err);
  }
} else {
  console.log('ℹ️ Notice: GEMINI_API_KEY not configured or placeholder in .env; verified catalog fallback engine active.');
}

if (SARVAM_API_KEY) {
  console.log(`🤖 Sarvam AI Integration configured with Agent ID: ${SARVAM_AGENT_ID}`);
}

// 4. In-Memory Store & Verified Catalog
let activeStoreConfig = {
  storeName: 'Cafe Vaidehi',
  phone: '9876543210',
  occupation: 'Restaurant & Cafe',
  deliveryMode: 'delivery',
  activeStages: [
    { stageNum: 'Stage 01', tag: 'Voice Ingestion', title: 'Multilingual Voice STT', desc: 'Parses customer voice notes into dishes & units' },
    { stageNum: 'Stage 02', tag: 'Visual Menu', title: 'Visual Food Card Broadcast', desc: 'Dispatches dish photos with prices' },
    { stageNum: 'Stage 03', tag: 'Catalog Lock', title: 'Verified Menu Sync & My Usual', desc: 'Locks prices strictly to verified catalog' },
    { stageNum: 'Stage 04', tag: 'UPI Tap-to-Pay', title: 'Dynamic UPI QR & Deep Link', desc: 'Generates 1-click tap-to-pay link' },
    { stageNum: 'Stage 05', tag: 'Dispatch', title: '5km Local Delivery Dispatch', desc: 'Confirms address within 5km radius' }
  ],
  catalog: [
    {
      name: 'Paneer Tikka Pizza (10-inch)',
      cat: 'Woodfired Pizza',
      price: 349,
      stock: 'Ready to Fire',
      image: 'images/pizza.jpg'
    },
    {
      name: 'Dum Murgh Biryani (Handi)',
      cat: 'Biryanis & Rice',
      price: 389,
      stock: 'Ready to Fire',
      image: 'images/biryani.jpg'
    },
    {
      name: 'Crispy Chilli Babycorn',
      cat: 'Starters & Appetizers',
      price: 210,
      stock: 'Ready to Fire',
      image: 'images/babycorn.jpg'
    },
    {
      name: 'Dal Makhani (Slow Cooked)',
      cat: 'Main Course',
      price: 260,
      stock: 'Ready to Fire',
      image: 'images/dal.jpg'
    },
    {
      name: 'Gulab Jamun (2 Pieces)',
      cat: 'Desserts',
      price: 80,
      stock: 'In Kitchen',
      image: 'images/gulabjamun.jpg'
    },
    {
      name: 'Diet Coke Can (300ml)',
      cat: 'Beverages',
      price: 40,
      stock: 'Chilled (30)',
      image: 'images/coke.jpg'
    }
  ]
};

// 5. Persistent Customer State & Memory Store
const customerStore = new Map();

function getCustomer(jid) {
  const phone = jid.split('@')[0];
  if (!customerStore.has(phone)) {
    customerStore.set(phone, {
      phone,
      orderSession: {
        status: 'IDLE', // 'IDLE' | 'COLLECTING' | 'AWAITING_CONFIRMATION' | 'AWAITING_ADDRESS'
        cart: [],       // Array<{ name: string, price: number, qty: number }>
        address: null
      },
      usualOrder: null,
      lastOrder: null,
      complaints: [],
      history: []
    });
  }
  const cust = customerStore.get(phone);
  if (!cust.orderSession) {
    cust.orderSession = { status: 'IDLE', cart: [], address: null };
  }
  return cust;
}

// Unique Order ID Generator: "CV" + 4 digits (e.g. CV1042)
let orderCounter = Math.floor(1000 + Math.random() * 9000);
function generateOrderId() {
  orderCounter++;
  if (orderCounter > 9999) orderCounter = 1000;
  return `CV${orderCounter}`;
}

// 6. Robust Dynamic Item Aliases & Number Words Mapping
const KNOWN_ALIASES = {
  pizza: ['paneer tikka pizza', 'tikka pizza', 'paneer pizza', 'pizza', 'pizzas'],
  biryani: ['dum murgh biryani', 'murgh biryani', 'chicken biryani', 'dum biryani', 'biryani', 'biriyani', 'biryanis'],
  babycorn: ['crispy chilli babycorn', 'chilli babycorn', 'chilli baby corn', 'babycorn', 'baby corn'],
  dal: ['dal makhani', 'daal makhani', 'makhani dal', 'dal', 'daal', 'makhani'],
  gulabjamun: ['gulab jamun', 'gulabjamun', 'jamun', 'gulab jamuns'],
  coke: ['diet coke', 'coca cola', 'cocacola', 'coke', 'cold drink', 'cokes', 'cola'],
  milk: ['amul taaza milk', 'toned milk', 'amul milk', 'milk', 'doodh'],
  atta: ['aashirvaad chakki atta', 'chakki atta', 'aashirvaad atta', 'atta', 'flour', 'aata'],
  salt: ['tata iodized salt', 'tata salt', 'salt', 'namak'],
  oil: ['fortune sunlite oil', 'refined oil', 'fortune oil', 'sunflower oil', 'cooking oil', 'oil', 'tel'],
  coffee: ['bru instant coffee', 'bru coffee', 'instant coffee', 'coffee'],
  rice: ['india gate basmati rice', 'basmati rice', 'india gate rice', 'rice', 'chawal']
};

function getItemAliases(item) {
  const set = new Set();
  const lowerName = (item.name || '').toLowerCase();
  set.add(lowerName);

  if (Array.isArray(item.aliases)) {
    item.aliases.forEach(a => set.add(a.toLowerCase()));
  }

  // Clean parentheses like "(10-inch)", "(300ml)", "(Handi)"
  const cleanedName = lowerName.replace(/\(.*?\)/g, '').trim();
  if (cleanedName) set.add(cleanedName);

  // Match known aliases database
  for (const [key, aliasList] of Object.entries(KNOWN_ALIASES)) {
    if (lowerName.includes(key) || aliasList.some(a => lowerName.includes(a))) {
      aliasList.forEach(a => set.add(a));
    }
  }

  // Add individual significant words (>=3 letters)
  const words = cleanedName.split(/[\s,]+/).filter(w => w.length >= 3);
  words.forEach(w => set.add(w));

  return [...set].sort((a, b) => b.length - a.length);
}

function getItemDisplayName(fullName) {
  const lower = (fullName || '').toLowerCase();
  if (lower.includes('coke') || lower.includes('cola')) return 'Coke';
  if (lower.includes('pizza')) return 'Pizza';
  if (lower.includes('biryani') || lower.includes('biriyani')) return 'Biryani';
  if (lower.includes('babycorn') || lower.includes('baby corn')) return 'Chilli Babycorn';
  if (lower.includes('dal') || lower.includes('daal')) return 'Dal Makhani';
  if (lower.includes('jamun') || lower.includes('gulab')) return 'Gulab Jamun';
  return fullName.replace(/\(.*?\)/g, '').trim();
}

const WORD_NUMBERS = {
  'a': 1, 'an': 1, 'one': 1, 'ek': 1,
  'two': 2, 'do': 2,
  'three': 3, 'teen': 3,
  'four': 4, 'char': 4, 'chaar': 4,
  'five': 5, 'panch': 5, 'paanch': 5,
  'six': 6, 'che': 6,
  'seven': 7, 'saat': 7,
  'eight': 8, 'aath': 8,
  'nine': 9, 'nau': 9,
  'ten': 10, 'das': 10
};

function extractOrderItems(rawText, catalogList) {
  const text = (rawText || '').toLowerCase();
  const matched = [];
  const catalog = catalogList || activeStoreConfig.catalog;

  for (const catItem of catalog) {
    const aliases = getItemAliases(catItem);

    for (const alias of aliases) {
      const regex = new RegExp('(?:^|\\s|[0-9])' + alias + '(?:$|\\s|[0-9]|\'|s|es)', 'i');
      const idx = text.search(regex);
      if (idx !== -1 || text.includes(alias)) {
        const foundIdx = idx !== -1 ? idx : text.indexOf(alias);
        let qty = 1;
        const prefix = text.substring(Math.max(0, foundIdx - 25), foundIdx).trim();
        const numMatch = prefix.match(/(\d+)\s*(?:x|\*|plate|plates|portion|portions|can|cans|piece|pieces|bottle|bottles)?\s*$/);
        if (numMatch) {
          qty = parseInt(numMatch[1], 10);
        } else {
          const wordMatch = prefix.match(/\b(a|an|one|two|three|four|five|six|seven|eight|nine|ten|ek|do|teen|char|chaar|panch|che|saat|aath|nau|das)\s*(?:x|\*|plate|plates|portion|portions|can|cans|piece|pieces|bottle|bottles)?\s*$/);
          if (wordMatch && WORD_NUMBERS[wordMatch[1]]) {
            qty = WORD_NUMBERS[wordMatch[1]];
          }
        }
        matched.push({ name: catItem.name, price: catItem.price, qty });
        break;
      }
    }
  }
  return matched;
}

function addToCart(session, items) {
  for (const item of items) {
    const existing = session.cart.find(i => i.name === item.name);
    if (existing) {
      existing.qty += item.qty;
    } else {
      session.cart.push({ ...item });
    }
  }
}

function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function formatItemizedBill(cart, storeName) {
  const total = getCartTotal(cart);
  const itemsText = cart.map(i => {
    const displayName = getItemDisplayName(i.name);
    const lineTotal = i.price * i.qty;
    return `• ${displayName} (${i.qty}x) - ${lineTotal}rs`;
  }).join('\n');

  return `🧾 *${storeName || 'Cafe Vaidehi'} Order Bill*\n─────────────────────\n${itemsText}\n─────────────────────\n💰 *Total Amount: ${total}rs*`;
}

// 7. Dynamic System Instruction (Cafe Vaidehi + Sarvam Spec)
function buildSystemInstruction(storeConfig, customer) {
  const storeName = storeConfig.storeName || 'Cafe Vaidehi';

  const catalogList = (storeConfig.catalog || []).map((item) =>
    `- ${item.name} (${item.cat || 'Special'}): ₹${item.price} [${item.stock || 'Available'}]`
  ).join('\n');

  const usualSummary = customer?.usualOrder
    ? `Customer's saved Usual Order: ${customer.usualOrder.items.map(i => `${i.qty}x ${i.name}`).join(', ')} (Total ₹${customer.usualOrder.totalAmount})`
    : 'No usual order saved yet for this customer.';

  const currentCartSummary = customer?.orderSession?.cart?.length > 0
    ? `Current Cart Items: ${customer.orderSession.cart.map(i => `${i.qty}x ${i.name} (₹${i.price * i.qty})`).join(', ')}. Subtotal: ₹${getCartTotal(customer.orderSession.cart)}`
    : 'Cart is currently empty.';

  return `## Persona
You are the official WhatsApp assistant for "${storeName}". You help customers order food, book tables, ask about the menu, follow up on orders, and raise complaints. When asked whether you are AI, state that you are ${storeName}'s virtual assistant and that a team member can step in whenever needed.

## Speaking Style Rules
- Messages are short, warm, and natural (1 or 2 sentences maximum).
- Ask only ONE question at a time, then stop and wait for the customer's answer.
- Replies MUST match the exact language and script the customer writes or speaks in (English, Hindi, Marathi, Hinglish, etc.).
- Never recite long unstructured lists.

## Cafe Facts & Policies
- ${storeName} is open daily from 11:00 AM to 10:00 PM.
- Home delivery is available strictly within 5 km. Customers can also pick up at the cafe.
- Payment is accepted by UPI, cards, and cash on delivery.
- Refunds are available only for orders cancelled before food preparation starts.
- Vegetarian meals and freshly prepared dishes are available.

## STRICT VERIFIED MENU & EXACT PRICES (IN ₹ INR):
${catalogList}

## STRICT OUT-OF-MENU GUARDRAIL & ALTERNATIVES:
- You must NEVER invent, agree to, or confirm items outside the verified menu above.
- If a customer asks for an item not in the verified menu (e.g. burgers, pasta, noodles, sushi, sandwich, etc.), politely decline: "Sorry, [item] isn't available with us right now." and immediately suggest 2–3 closest available items from our menu with their prices.

## CURRENT CART STATE:
${currentCartSummary}

## "ORDER MY USUAL" LOGIC:
${usualSummary}
- When a customer says "order my usual", "the usual", or similar:
  - If they have a saved usual order, read back the items, quantities, and total bill in one short message and ask for confirmation.
  - If their usual order is not known, say so briefly, ask what they would like today, and tell them you will remember it as their usual for next time.

## RESERVATIONS:
Collect date, time, number of guests, and contact name, then repeat back and confirm.

## COMPLAINTS:
Acknowledge, collect order details and what went wrong, state that the cafe team will follow up. Never promise refunds beyond policy.`;
}

// 8. UPI Link and Dynamic QR Code Generator
function buildUpiUri(orderId, amountDigits, storeName) {
  const cleanAmount = String(amountDigits).replace(/[^0-9.]/g, '');
  return `upi://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(storeName || 'Cafe Vaidehi')}&am=${cleanAmount}&tn=${orderId}`;
}

async function generateUpiQrBuffer(upiUri) {
  return await qrcode.toBuffer(upiUri, {
    width: 400,
    margin: 2,
    color: {
      dark: '#0A3622',
      light: '#FFFFFF'
    }
  });
}

// 8.1. tool:read_photo_text via OCR.space API (Key: 51c4e9533888957)
async function readPhotoTextWithOCRSpace(buffer, mimeType) {
  try {
    const base64 = `data:${mimeType || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    const formData = new FormData();
    formData.append('apikey', OCR_SPACE_API_KEY);
    formData.append('base64Image', base64);
    formData.append('isOverlayRequired', 'false');

    console.log(`🔍 [tool:read_photo_text] Submitting image buffer to OCR.space...`);
    const res = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data && data.ParsedResults && data.ParsedResults.length > 0) {
      const text = data.ParsedResults[0].ParsedText?.trim();
      if (text) {
        console.log(`✅ [tool:read_photo_text] Extracted ${text.length} characters of OCR text: "${text.slice(0, 80)}..."`);
        return text;
      }
    }
  } catch (err) {
    console.warn('⚠️ [tool:read_photo_text] OCR.space API call failed:', err.message);
  }
  return null;
}

// 9. Visual Menu Cards Broadcast
async function sendVisualMenuCards(sock, from, catalog, storeName) {
  const imagesDir = path.resolve(__dirname, '../images');
  console.log(`📸 Broadcasting visual menu cards to ${from}...`);

  for (const item of catalog) {
    let imageBuffer = null;
    if (item.image) {
      const fileName = path.basename(item.image);
      const fullPath = path.join(imagesDir, fileName);
      if (fs.existsSync(fullPath)) {
        try {
          imageBuffer = fs.readFileSync(fullPath);
        } catch (e) {
          console.error(`Could not read image file for ${item.name}:`, e.message);
        }
      }
    }

    const caption = `🍽️ *${item.name}*\n🏷️ Category: ${item.cat || 'Special'} | 💰 *₹${item.price}*\n⚡ Status: _${item.stock || 'Ready to Fire'}_`;

    try {
      if (imageBuffer) {
        await sock.sendMessage(from, { image: imageBuffer, caption });
      } else {
        await sock.sendMessage(from, { text: caption });
      }
    } catch (sendErr) {
      console.error(`Error sending card for ${item.name}:`, sendErr.message);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  await sock.sendMessage(from, {
    text: `Here is our current visual menu at *${storeName || 'Cafe Vaidehi'}*! 🍽️\n\nWhat would you like to order today? You can reply with items (e.g. "1 coke" or "2 biryani") or send a voice note!`
  });
}

// 10. Sarvam AI Agent Integration
async function callSarvamAgent(userText, customer) {
  if (!SARVAM_API_KEY) return null;

  try {
    console.log(`🤖 Routing message to Sarvam AI Agent (${SARVAM_AGENT_ID})...`);
    const res = await fetch(`https://api.sarvam.ai/v1/agents/${SARVAM_AGENT_ID}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY
      },
      body: JSON.stringify({
        message: userText,
        session_id: customer.phone
      })
    });

    if (res.ok) {
      const data = await res.json();
      const reply = data.reply || data.response || data.message || data.output;
      if (reply) return reply.trim();
    } else {
      console.warn(`Sarvam AI returned status ${res.status}. Falling back to Gemini...`);
    }
  } catch (err) {
    console.warn('Sarvam API call failed:', err.message);
  }
  return null;
}

// 11. Conversational Fallback Engine
function generateFallbackReply(userText, storeConfig, customer) {
  const text = (userText || '').toLowerCase();
  const storeName = storeConfig.storeName || 'Cafe Vaidehi';
  const catalog = storeConfig.catalog || [];

  // Greetings
  if (text.includes('hi') || text.includes('hello') || text.includes('namaste') || text.includes('hey')) {
    return `Namaste! Welcome to *${storeName}* 🙏 How can I help you today: would you like to order food, book a table, or view our menu?`;
  }

  // Table Reservation
  if (text.includes('table') || text.includes('reserve') || text.includes('booking')) {
    return `We would be happy to host you! Could you please share the date, time, number of guests, and your name?`;
  }

  // Complaints
  if (text.includes('complaint') || text.includes('wrong') || text.includes('late') || text.includes('bad') || text.includes('cold')) {
    return `I am truly sorry to hear that. Could you share your order ID or details of what went wrong? Our cafe team will follow up directly.`;
  }

  // Out-of-menu item requested
  const outOfMenuItems = ['burger', 'pasta', 'noodles', 'sushi', 'taco', 'sandwich', 'ice cream', 'roti', 'dosa', 'idli'];
  for (const oom of outOfMenuItems) {
    if (text.includes(oom)) {
      const suggestions = catalog.slice(0, 3).map(i => `• *${i.name}* (₹${i.price})`).join('\n');
      return `Sorry, ${oom} is not available with us right now. Would you like to try something from our fresh specialties?\n${suggestions}`;
    }
  }

  return `Welcome to *${storeName}*! You can browse our visual menu, tell me what you'd like to eat, or say "order my usual"!`;
}

// 12. Multimodal Processor (Voice STT, Vision OCR & Text via Gemini 3 Flash)
async function processWithGemini(jid, incomingMedia, textInput, storeConfig) {
  const customer = getCustomer(jid);
  const systemInstruction = buildSystemInstruction(storeConfig, customer);

  if (aiClient) {
    try {
      const parts = [];

      // Voice Note Audio
      if (incomingMedia?.type === 'audio') {
        console.log(`🎙️ Transcribing voice note via Gemini 3 Flash (${incomingMedia.mimeType})...`);
        parts.push({
          inlineData: {
            mimeType: incomingMedia.mimeType.split(';')[0] || 'audio/ogg',
            data: incomingMedia.base64
          }
        });
        parts.push({
          text: "The customer sent this WhatsApp voice note. Transcribe and reply in the EXACT same language and script they spoke in. Be concise (1-2 sentences) and follow all Cafe Vaidehi rules."
        });
      }
      // Photo / Slip OCR
      else if (incomingMedia?.type === 'image') {
        console.log(`🖼️ Processing image via Gemini Vision...`);
        parts.push({
          inlineData: {
            mimeType: incomingMedia.mimeType || 'image/jpeg',
            data: incomingMedia.base64
          }
        });
        const ocrNote = incomingMedia.ocrText ? `tool:read_photo_text OCR extracted text: "${incomingMedia.ocrText}". ` : '';
        parts.push({
          text: (textInput ? `Customer caption: "${textInput}". ` : "") + ocrNote +
            "The customer sent this photo of an order, handwritten dish list, or menu. Match the items strictly with our verified catalog and list them with quantities."
        });
      }
      // Text
      else {
        parts.push({ text: textInput });
      }

      const history = customer.history.slice(-6);

      const response = await aiClient.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history,
          { role: 'user', parts }
        ],
        config: {
          systemInstruction,
          temperature: 0.6
        }
      });

      const reply = response.text?.trim();
      if (reply) {
        customer.history.push({ role: 'user', parts: [{ text: textInput || '[Voice/Photo Message]' }] });
        customer.history.push({ role: 'model', parts: [{ text: reply }] });
        if (customer.history.length > 12) customer.history.splice(0, customer.history.length - 12);
        return reply;
      }
    } catch (err) {
      console.warn('Gemini 3 Flash call failed:', err.message);
    }
  }

  // Sarvam AI fallback
  if (!incomingMedia && SARVAM_API_KEY) {
    const sarvamReply = await callSarvamAgent(textInput, customer);
    if (sarvamReply) return sarvamReply;
  }

  return generateFallbackReply(textInput, storeConfig, customer);
}

// 13. Baileys Multi-Device WhatsApp Socket Manager
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
      browser: ['Cafe Vaidehi WhatsApp Bot', 'Chrome', '120.0.0'],
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

    // Inbound customer message router
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const from = msg.key.remoteJid;
        const customer = getCustomer(from);
        const session = customer.orderSession;
        const storeName = activeStoreConfig.storeName || 'Cafe Vaidehi';

        let incomingMedia = null;
        let textContent = '';

        // 1. Detect Voice Note (Audio)
        if (msg.message?.audioMessage) {
          try {
            console.log(`🎙️ Inbound Voice Note from ${from}...`);
            const buffer = await downloadMediaMessage(
              msg,
              'buffer',
              {},
              { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
            );
            incomingMedia = {
              type: 'audio',
              base64: buffer.toString('base64'),
              mimeType: msg.message.audioMessage.mimetype || 'audio/ogg; codecs=opus'
            };
          } catch (mediaErr) {
            console.error('Failed to download audio message:', mediaErr.message);
          }
        }
        // 2. Detect Photo (Image / Handwritten slip)
        else if (msg.message?.imageMessage) {
          try {
            console.log(`📷 Inbound Photo from ${from}...`);
            const buffer = await downloadMediaMessage(
              msg,
              'buffer',
              {},
              { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
            );
            const mimeType = msg.message.imageMessage.mimetype || 'image/jpeg';

            // Call tool:read_photo_text with OCR.space
            const ocrExtractedText = await readPhotoTextWithOCRSpace(buffer, mimeType);

            incomingMedia = {
              type: 'image',
              base64: buffer.toString('base64'),
              mimeType,
              ocrText: ocrExtractedText
            };
            textContent = msg.message.imageMessage.caption || '';
          } catch (mediaErr) {
            console.error('Failed to download image message:', mediaErr.message);
          }
        }
        // 3. Text Message
        else {
          textContent = msg.message.conversation ||
                        msg.message.extendedTextMessage?.text || '';
        }

        if (!incomingMedia && !textContent.trim()) continue;

        // If voice note was received, process through Gemini to get audio transcription
        let effectiveText = textContent.trim();
        if (incomingMedia?.type === 'audio') {
          try {
            const voiceTranscription = await processWithGemini(from, incomingMedia, '', activeStoreConfig);
            if (voiceTranscription) {
              console.log(`🎙️ [Voice STT] Decoded audio message: "${voiceTranscription}"`);
              effectiveText = voiceTranscription;
            }
          } catch (sttErr) {
            console.warn('Voice transcription error:', sttErr.message);
          }
        } else if (incomingMedia?.type === 'image' && incomingMedia.ocrText) {
          effectiveText = (effectiveText + ' ' + incomingMedia.ocrText).trim();
        }

        console.log(`📩 [WhatsApp] Inbound from ${from} [State: ${session.status}]: "${effectiveText}"`);

        const lowerText = effectiveText.toLowerCase();

        // =========================================================================
        // STATE 1: AWAITING_ADDRESS -> Generate Bill, Order ID & Pre-Fed UPI QR
        // =========================================================================
        if (session.status === 'AWAITING_ADDRESS' && effectiveText.length > 3) {
          session.address = effectiveText;
          const orderId = generateOrderId();
          const totalAmount = getCartTotal(session.cart);

          // Save to customer memory (usualOrder + lastOrder)
          customer.lastOrder = {
            orderId,
            items: [...session.cart],
            totalAmount,
            mode: 'delivery',
            address: session.address,
            payment: 'UPI',
            status: 'confirmed',
            timestamp: new Date()
          };
          customer.usualOrder = {
            items: [...session.cart],
            totalAmount,
            timestamp: new Date()
          };
          console.log(`💾 Saved Order ${orderId} as usual order for ${customer.phone}! Total: ${totalAmount}rs`);

          // Generate dynamic UPI URI with pre-fed bill values:
          const upiUri = buildUpiUri(orderId, totalAmount, storeName);
          const qrBuffer = await generateUpiQrBuffer(upiUri);

          const itemsFormatted = session.cart.map(i => {
            const displayName = getItemDisplayName(i.name);
            const lineTotal = i.price * i.qty;
            return `• ${displayName} (${i.qty}x) - ${lineTotal}rs`;
          }).join('\n');

          const qrCaption = `Tap here to pay ${totalAmount}rs for order ${orderId}:\n${upiUri}\n\n🧾 *Order ${orderId} Receipt*\n📍 *Delivery Address:* ${session.address}\n─────────────────────\n${itemsFormatted}\n─────────────────────\n💰 *Total to Pay: ${totalAmount}rs*\n\nScan the QR code above with any UPI app (GPay, PhonePe, Paytm). Our kitchen is firing your fresh order! 🚀`;

          try {
            await sock.sendMessage(from, {
              image: qrBuffer,
              caption: qrCaption
            });
            console.log(`💳 Dispatched dynamic UPI QR code for Order ${orderId} (${totalAmount}rs) to ${from}`);
          } catch (qrErr) {
            console.error('Failed to send UPI QR image:', qrErr.message);
            await sock.sendMessage(from, { text: qrCaption });
          }

          // Reset cart session to IDLE
          session.status = 'IDLE';
          session.cart = [];
          session.address = null;
          continue;
        }

        // =========================================================================
        // STATE 2: AWAITING_CONFIRMATION -> Check if user confirms order
        // =========================================================================
        const isConfirmIntent = /\b(yes|confirm|confirmed|haan|ha|sahi|sahi hai|ok|okay|sure|proceed|right|bilkul|correct)\b/i.test(lowerText);
        if (session.status === 'AWAITING_CONFIRMATION' && isConfirmIntent) {
          session.status = 'AWAITING_ADDRESS';
          await sock.sendMessage(from, {
            text: `Order confirmed! 🛵\n\nPlease share your complete delivery address (and nearby landmark) for delivery within 5 km:`
          });
          continue;
        }

        // =========================================================================
        // STATE 3: Visual Menu Cards Request
        // =========================================================================
        const isMenuQuery = !incomingMedia && (
          lowerText === 'menu' ||
          lowerText === 'catalog' ||
          lowerText.includes('show menu') ||
          lowerText.includes('show dishes') ||
          lowerText.includes("what's the menu") ||
          lowerText.includes("what's there to eat") ||
          lowerText.includes('kya milega') ||
          lowerText.includes('menu card')
        );

        if (isMenuQuery) {
          await sendVisualMenuCards(sock, from, activeStoreConfig.catalog, storeName);
          continue;
        }

        // =========================================================================
        // STATE 4: "ORDER MY USUAL"
        // =========================================================================
        const isUsualIntent = /\b(usual|my usual|same as last|same order)\b/i.test(lowerText);
        if (isUsualIntent) {
          if (customer?.usualOrder && customer.usualOrder.items?.length > 0) {
            session.cart = JSON.parse(JSON.stringify(customer.usualOrder.items));
            session.status = 'AWAITING_CONFIRMATION';
            const billText = `Found your usual order! 🍽️\n\n` + formatItemizedBill(session.cart, storeName) +
              `\n\nWould you like to confirm this order? (Reply *"Yes"* or *"Confirm"* to proceed)`;
            await sock.sendMessage(from, { text: billText });
            continue;
          } else {
            await sock.sendMessage(from, {
              text: `I don't have your usual order saved yet! What would you like to have today? You can browse our menu or name any item.`
            });
            continue;
          }
        }

        // =========================================================================
        // STATE 5: Order Items Detected (e.g. "1 coke 2 pizza 3 biryani", "1 coke")
        // SHOW ORDER TOGETHER AS AN ITEMIZED BILL
        // =========================================================================
        const matchedItems = extractOrderItems(effectiveText, activeStoreConfig.catalog);
        const isDoneIntent = /\b(done|that's all|thats all|bas|bas itna|bas itna hi|finish|finished|complete|khatam|itna hi|nothing else)\b/i.test(lowerText);

        if (matchedItems.length > 0) {
          addToCart(session, matchedItems);

          if (isDoneIntent) {
            session.status = 'AWAITING_CONFIRMATION';
            const billText = formatItemizedBill(session.cart, storeName) +
              `\n\nWould you like to confirm this order? (Reply *"Yes"* or *"Confirm"* to proceed)`;
            await sock.sendMessage(from, { text: billText });
            continue;
          } else {
            session.status = 'COLLECTING';
            const billText = formatItemizedBill(session.cart, storeName) +
              `\n\nWould you like to add anything else? (Reply with more items, or say *"DONE"* to confirm and place your order)`;
            await sock.sendMessage(from, { text: billText });
            continue;
          }
        }

        // =========================================================================
        // STATE 6: "DONE" Trigger without new items
        // =========================================================================
        if (isDoneIntent) {
          if (session.cart.length > 0) {
            session.status = 'AWAITING_CONFIRMATION';
            const billText = formatItemizedBill(session.cart, storeName) +
              `\n\nWould you like to confirm this order? (Reply *"Yes"* or *"Confirm"* to proceed)`;
            await sock.sendMessage(from, { text: billText });
            continue;
          } else {
            await sock.sendMessage(from, {
              text: `Your order is currently empty! What would you like to have today? You can browse our menu or name any item.`
            });
            continue;
          }
        }

        // =========================================================================
        // STATE 7: Out-of-Menu Guardrail
        // =========================================================================
        const outOfMenuItems = ['burger', 'pasta', 'noodles', 'sushi', 'taco', 'sandwich', 'ice cream', 'roti', 'dosa', 'idli'];
        const matchedOom = outOfMenuItems.find(oom => lowerText.includes(oom));
        if (matchedOom) {
          const suggestions = activeStoreConfig.catalog.slice(0, 3).map(i => `• *${i.name}* (₹${i.price})`).join('\n');
          const reply = `Sorry, *${matchedOom}* isn't available with us right now. Would you like to try something from our fresh specialties?\n${suggestions}`;
          await sock.sendMessage(from, { text: reply });
          continue;
        }

        // =========================================================================
        // STATE 8: General Assistant Conversations / Multimodal (Gemini 3 Flash)
        // =========================================================================
        try {
          const reply = await processWithGemini(from, incomingMedia, effectiveText, activeStoreConfig);
          if (reply) {
            await sock.sendMessage(from, { text: reply });
            console.log(`📤 [WhatsApp] Replying to ${from}: "${reply.slice(0, 100)}..."`);
          }
        } catch (procErr) {
          console.error('Error during message processing:', procErr.message);
          const fallback = generateFallbackReply(effectiveText, activeStoreConfig, customer);
          await sock.sendMessage(from, { text: fallback });
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

// 14. Socket.IO Connection & Frontend Event Listeners
io.on('connection', (socket) => {
  console.log(`🔌 Frontend client connected: ${socket.id}`);

  socket.emit('wa:status', currentStatus);
  if (lastQrDataUrl && currentStatus.state === 'qr') {
    socket.emit('wa:qr', lastQrDataUrl);
  }

  socket.on('launch-store-bot', async (payload) => {
    console.log('🚀 Received launch-store-bot event from frontend:');
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

// 15. HTTP Endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    waStatus: currentStatus,
    store: activeStoreConfig.storeName,
    agentId: SARVAM_AGENT_ID,
    catalogCount: activeStoreConfig.catalog.length,
    customersInMemory: customerStore.size
  });
});

// 16. Start Server on Port 3001
httpServer.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Cafe Vaidehi WhatsApp Assistant Live on http://localhost:${PORT}`);
  console.log(`   • Sarvam Agent ID: ${SARVAM_AGENT_ID}`);
  console.log(`   • UPI VPA: ${UPI_VPA}`);
  console.log(`   • Multi-Turn Cart Accumulation & Itemized Billing`);
  console.log(`   • Dynamic Pre-Fed UPI QR Code & Tap-To-Pay Link`);
  console.log(`   • Multimodal: Voice (STT) + Photos (OCR) + Visual Cards`);
  console.log(`=======================================================`);
});
