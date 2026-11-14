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

process.on('uncaughtException', (err) => {
  console.warn('⚠️ uncaughtException:', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.warn('⚠️ unhandledRejection:', reason?.message || reason);
});

// ─── 1. Config ────────────────────────────────────────────────────────────────
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const PORT            = process.env.PORT || 3001;
const UPI_VPA         = process.env.UPI_VPA         || 'cafevaidehi.demo@upi';
const SARVAM_API_KEY  = (process.env.SARVAM_API_KEY  || '').trim();
const SARVAM_AGENT_ID = process.env.SARVAM_AGENT_ID  || 'whatsapp-ch-779ea7d0-dd9c';
const OCR_SPACE_KEY   = process.env.OCR_SPACE_API_KEY || '51c4e9533888957';
const GEMINI_API_KEY  = (process.env.GEMINI_API_KEY  || '').trim();

// ─── 2. Express + Socket.IO ───────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));
app.use('/dashboard', express.static(path.join(__dirname, 'public')));

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET','POST'] } });

// ─── 3. Gemini Client (audio STT only) ───────────────────────────────────────
let aiClient = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log('✨ Gemini client ready (audio STT)');
  } catch (e) { console.warn('Gemini init failed:', e.message); }
} else {
  console.log('ℹ️  Gemini key not set – audio STT will fall back to text');
}

console.log(SARVAM_API_KEY
  ? `🤖 Sarvam AI primary agent: ${SARVAM_AGENT_ID}`
  : '⚠️  SARVAM_API_KEY not set – using local fallback');

// ─── 4. Store Config ──────────────────────────────────────────────────────────
let activeStoreConfig = {
  storeName   : 'Cafe Vaidehi',
  phone       : '9876543210',
  occupation  : 'Restaurant & Cafe',
  deliveryMode: 'delivery',
  catalog: [
    { name:'Paneer Tikka Pizza (10-inch)', cat:'Woodfired Pizza',      price:349, stock:'Ready to Fire', image:'images/pizza.jpg'      },
    { name:'Dum Murgh Biryani (Handi)',    cat:'Biryanis & Rice',       price:389, stock:'Ready to Fire', image:'images/biryani.jpg'    },
    { name:'Crispy Chilli Babycorn',       cat:'Starters & Appetizers', price:210, stock:'Ready to Fire', image:'images/babycorn.jpg'   },
    { name:'Dal Makhani (Slow Cooked)',    cat:'Main Course',           price:260, stock:'Ready to Fire', image:'images/dal.jpg'        },
    { name:'Gulab Jamun (2 Pieces)',       cat:'Desserts',              price: 80, stock:'In Kitchen',    image:'images/gulabjamun.jpg' },
    { name:'Diet Coke Can (300ml)',        cat:'Beverages',             price: 40, stock:'Chilled (30)',  image:'images/coke.jpg'       }
  ]
};

// ─── 5. Customer Store ────────────────────────────────────────────────────────
const customerStore = new Map();

function getCustomer(jid) {
  const phone = jid.split('@')[0];
  if (!customerStore.has(phone)) {
    customerStore.set(phone, {
      phone,
      orderSession: { status:'IDLE', cart:[], address:null },
      usualOrder  : null,
      lastOrder   : null,
      history     : []
    });
  }
  const c = customerStore.get(phone);
  if (!c.orderSession) c.orderSession = { status:'IDLE', cart:[], address:null };
  return c;
}

let orderCounter = Math.floor(1000 + Math.random() * 9000);
function generateOrderId() {
  orderCounter = (orderCounter >= 9999) ? 1000 : orderCounter + 1;
  return `CV${orderCounter}`;
}

// ─── 6. Item Alias Engine ─────────────────────────────────────────────────────
const KNOWN_ALIASES = {
  pizza     : ['paneer tikka pizza','tikka pizza','paneer pizza','pizza','pizzas'],
  biryani   : ['dum murgh biryani','murgh biryani','chicken biryani','dum biryani','biryani','biriyani','biryanis'],
  babycorn  : ['crispy chilli babycorn','chilli babycorn','chilli baby corn','babycorn','baby corn'],
  dal       : ['dal makhani','daal makhani','makhani dal','dal','daal','makhani'],
  gulabjamun: ['gulab jamun','gulabjamun','jamun','gulab jamuns'],
  coke      : ['diet coke','coca cola','cocacola','coke','cold drink','cokes','cola']
};

// Default prices used when catalog item lookup fails
const DEFAULT_PRICES = {
  pizza:349, biryani:389, babycorn:210, dal:260, gulabjamun:80, coke:40
};

const WORD_NUM = {
  a:1,an:1,one:1,ek:1,
  two:2,do:2,
  three:3,teen:3,
  four:4,char:4,chaar:4,
  five:5,panch:5,paanch:5,
  six:6,che:6,seven:7,saat:7,
  eight:8,aath:8,nine:9,nau:9,ten:10,das:10
};

function getAliases(item) {
  const set = new Set();
  const lc  = (item.name || '').toLowerCase();
  set.add(lc);
  const clean = lc.replace(/\(.*?\)/g,'').trim();
  if (clean) set.add(clean);

  if (Array.isArray(item.aliases)) item.aliases.forEach(a => set.add(a.toLowerCase()));

  for (const [key, list] of Object.entries(KNOWN_ALIASES)) {
    if (lc.includes(key) || list.some(a => lc.includes(a)))
      list.forEach(a => set.add(a));
  }

  clean.split(/[\s,]+/).filter(w => w.length >= 3).forEach(w => set.add(w));
  return [...set].sort((a,b) => b.length - a.length);
}

function extractOrderItems(raw, catalog) {
  const text = (raw||'').toLowerCase();
  const out  = [];
  const matchedNames = new Set();
  console.log(`🔍 extractOrderItems input: "${text.slice(0,120)}"`);

  // Pass 1: match against active catalog
  for (const item of (catalog || activeStoreConfig.catalog)) {
    const aliases = getAliases(item);
    for (const alias of aliases) {
      if (text.includes(alias)) {
        const idx    = text.indexOf(alias);
        const prefix = text.substring(Math.max(0, idx-30), idx).trim();
        let qty = 1;
        const nm = prefix.match(/(\d+)\s*(?:x|\*|plate|plates|portion|portions|can|cans|piece|pieces|bottle|bottles)?\s*$/);
        if (nm) { qty = parseInt(nm[1],10); }
        else {
          const wm = prefix.match(/\b(a|an|one|two|three|four|five|six|seven|eight|nine|ten|ek|do|teen|char|chaar|panch|che|saat|aath|nau|das)\s*(?:x|\*|plate|plates|portion|portions|can|cans|piece|pieces|bottle|bottles)?\s*$/);
          if (wm && WORD_NUM[wm[1]]) qty = WORD_NUM[wm[1]];
        }
        console.log(`  ✅ Matched "${alias}" for ${item.name} qty=${qty} (prefix: "${prefix}")`);
        out.push({ name:item.name, price:item.price, qty });
        matchedNames.add(item.name);
        break;
      }
    }
  }

  // Pass 2: fallback — check KNOWN_ALIASES for items NOT already matched
  // (handles case where active catalog is non-restaurant but customer orders food by generic name)
  const catalogNames = (catalog || activeStoreConfig.catalog).map(i => i.name);
  for (const [key, aliases] of Object.entries(KNOWN_ALIASES)) {
    // Check if this key's catalog item was already matched
    const catalogItem = (catalog || activeStoreConfig.catalog).find(i =>
      aliases.some(a => i.name.toLowerCase().includes(a))
    );
    if (catalogItem && matchedNames.has(catalogItem.name)) continue; // already matched

    // Check if this alias key appears in the text
    const foundAlias = aliases.find(a => text.includes(a));
    if (foundAlias) {
      // If we already matched this via the catalog, skip
      if (catalogItem && matchedNames.has(catalogItem.name)) continue;

      const idx    = text.indexOf(foundAlias);
      const prefix = text.substring(Math.max(0, idx-30), idx).trim();
      let qty = 1;
      const nm = prefix.match(/(\d+)\s*(?:x|\*|plate|plates|portion|portions|can|cans|piece|pieces|bottle|bottles)?\s*$/);
      if (nm) { qty = parseInt(nm[1],10); }
      else {
        const wm = prefix.match(/\b(a|an|one|two|three|four|five|six|seven|eight|nine|ten|ek|do|teen|char|chaar|panch|che|saat|aath|nau|das)\s*(?:x|\*|plate|plates|portion|portions|can|cans|piece|pieces|bottle|bottles)?\s*$/);
        if (wm && WORD_NUM[wm[1]]) qty = WORD_NUM[wm[1]];
      }

      if (catalogItem) {
        // Use the catalog item with actual price
        console.log(`  ✅ [Pass2] Matched "${foundAlias}" → catalog item ${catalogItem.name} qty=${qty}`);
        out.push({ name:catalogItem.name, price:catalogItem.price, qty });
        matchedNames.add(catalogItem.name);
      } else {
        // No catalog item — use pretty name from key with default price
        const prettyNames = { pizza:'Pizza', biryani:'Biryani', babycorn:'Chilli Babycorn', dal:'Dal Makhani', gulabjamun:'Gulab Jamun', coke:'Coke' };
        const defaultPrices = { pizza:349, biryani:389, babycorn:210, dal:260, gulabjamun:80, coke:40 };
        const name  = prettyNames[key] || key;
        const price = defaultPrices[key] || 0;
        console.log(`  ✅ [Pass2-fallback] Matched "${foundAlias}" → ${name} qty=${qty} (default price ₹${price})`);
        out.push({ name, price, qty });
        matchedNames.add(name);
      }
    }
  }

  console.log(`🔍 extractOrderItems found ${out.length} items`);
  return out;
}

function addToCart(session, items) {
  for (const item of items) {
    const ex = session.cart.find(i => i.name === item.name);
    if (ex) ex.qty += item.qty;
    else session.cart.push({ ...item });
  }
}

function cartTotal(cart) {
  return cart.reduce((s,i) => s + i.price * i.qty, 0);
}

function displayName(fullName) {
  const lc = (fullName||'').toLowerCase();
  if (lc.includes('coke')  || lc.includes('cola'))    return 'Coke';
  if (lc.includes('pizza'))                            return 'Pizza';
  if (lc.includes('biryani'))                          return 'Biryani';
  if (lc.includes('babycorn') || lc.includes('baby corn')) return 'Chilli Babycorn';
  if (lc.includes('dal')   || lc.includes('daal'))    return 'Dal Makhani';
  if (lc.includes('jamun') || lc.includes('gulab'))   return 'Gulab Jamun';
  return fullName.replace(/\(.*?\)/g,'').trim();
}

function formatBill(cart, storeName) {
  const rows = cart.map(i =>
    `• ${displayName(i.name)} (${i.qty}x) — ${i.price * i.qty}rs`
  ).join('\n');
  const total = cartTotal(cart);
  return `🧾 *${storeName || 'Cafe Vaidehi'} Order Bill*\n─────────────────────\n${rows}\n─────────────────────\n💰 *Total: ${total}rs*`;
}

// ─── 7. Sarvam AI — Primary Conversational Brain ──────────────────────────────
//
// Every general message (greetings, questions, reservations, complaints,
// anything not caught by the deterministic cart state machine) is routed
// here.  We inject current cart context so Sarvam always knows the basket.
//
// For audio:  Gemini transcribes → text sent here with [Voice note] prefix.
// For photos: OCR.space extracts → text sent here with [Photo] prefix.
// Multilingual: Sarvam replies in whatever language the customer wrote in.
//
async function callSarvam(jid, messageForAgent, customer) {
  if (!SARVAM_API_KEY) return null;

  const phone   = jid.split('@')[0];
  const session = customer.orderSession;

  // Build a brief cart context note to prepend so Sarvam stays aware
  let cartNote = '';
  if (session.cart.length > 0) {
    const summary = session.cart
      .map(i => `${i.qty}x ${displayName(i.name)} (${i.price * i.qty}rs)`)
      .join(', ');
    cartNote = `[Cart so far: ${summary}. Subtotal: ${cartTotal(session.cart)}rs. Session state: ${session.status}]\n`;
  }

  const fullMessage = cartNote + messageForAgent;

  try {
    console.log(`🤖 Sarvam (${SARVAM_AGENT_ID}) ← "${fullMessage.slice(0,120)}"`);
    const res = await fetch(
      `https://api.sarvam.ai/v1/agents/${SARVAM_AGENT_ID}/chat`,
      {
        method : 'POST',
        headers: {
          'Content-Type'       : 'application/json',
          'api-subscription-key': SARVAM_API_KEY
        },
        body: JSON.stringify({ message: fullMessage, session_id: phone })
      }
    );

    if (res.ok) {
      const data  = await res.json();
      const reply = data.reply || data.response || data.message || data.output || data.text;
      if (reply) {
        console.log(`🤖 Sarvam → "${String(reply).slice(0,120)}"`);
        return String(reply).trim();
      }
      console.warn('Sarvam response had no recognisable reply field:', JSON.stringify(data).slice(0,200));
    } else {
      const errText = await res.text().catch(() => '');
      console.warn(`Sarvam HTTP ${res.status}: ${errText.slice(0,200)}`);
    }
  } catch (err) {
    console.warn('Sarvam fetch error:', err.message);
  }
  return null;
}

// ─── 8. Gemini — Audio STT Transcription Only ────────────────────────────────
async function transcribeAudio(base64Audio, mimeType) {
  if (!aiClient) {
    console.warn('⚠️ [Audio STT] Cannot transcribe voice note: GEMINI_API_KEY is not configured in whatsapp-bot-control/.env!');
    return null;
  }
  const cleanMime = (mimeType || 'audio/ogg').split(';')[0];
  const prompt = 'Transcribe this WhatsApp voice note audio accurately. ' +
                'The user might speak in Hindi, Hinglish, Marathi, English, or any Indian regional language. ' +
                'Output ONLY the transcribed words in the exact same language/dialect spoken. ' +
                'Do NOT explain, summarize, or translate. Just return the transcript.';

  // Attempt 1: gemini-3.8-flash via SDK
  try {
    console.log(`🎙️ Transcribing voice note with Gemini 3.8 Flash (${cleanMime})...`);
    const response = await aiClient.models.generateContent({
      model   : 'gemini-3.8-flash',
      contents: [{
        role : 'user',
        parts: [
          { inlineData: { mimeType: cleanMime, data: base64Audio } },
          { text: prompt }
        ]
      }],
      config: { temperature: 0.1 }
    });
    const t = response.text?.trim();
    if (t) {
      console.log(`🎙️ STT transcription succeeded: "${t}"`);
      return t;
    }
  } catch (e) {
    console.warn('⚠️ Gemini 3.8 Flash STT error:', e.message);
  }

  // Attempt 2: gemini-flash-latest via SDK
  try {
    const response2 = await aiClient.models.generateContent({
      model   : 'gemini-flash-latest',
      contents: [{
        role : 'user',
        parts: [
          { inlineData: { mimeType: cleanMime, data: base64Audio } },
          { text: prompt }
        ]
      }]
    });
    const t2 = response2.text?.trim();
    if (t2) {
      console.log(`🎙️ Fallback STT result: "${t2}"`);
      return t2;
    }
  } catch (e2) {
    console.warn('⚠️ Fallback Gemini STT error:', e2.message);
  }

  // Attempt 3: Direct REST API call (v1beta)
  try {
    console.log('🎙️ Trying direct REST API for transcription...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: cleanMime, data: base64Audio } },
            { text: prompt }
          ]
        }]
      })
    });
    const data = await res.json();
    const t3 = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (t3) {
      console.log(`🎙️ Direct REST STT succeeded: "${t3}"`);
      return t3;
    }
  } catch (e3) {
    console.warn('⚠️ Direct REST STT error:', e3.message);
  }

  return null;
}

// ─── 9. OCR.space — Photo to Text ────────────────────────────────────────────
async function ocrPhoto(buffer, mimeType) {
  try {
    const b64  = `data:${mimeType || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    const form = new FormData();
    form.append('apikey',           OCR_SPACE_KEY);
    form.append('base64Image',      b64);
    form.append('isOverlayRequired','false');

    const res  = await fetch('https://api.ocr.space/parse/image', { method:'POST', body:form });
    const data = await res.json();
    const text = data?.ParsedResults?.[0]?.ParsedText?.trim();
    if (text) console.log(`🔍 OCR result: "${text.slice(0,120)}"`);
    return text || null;
  } catch (e) {
    console.warn('OCR.space error:', e.message);
    return null;
  }
}

// ─── 10. Single Visual Menu Card ──────────────────────────────────────────────
async function sendMenuCards(sock, to, catalog, storeName) {
  const imagesDir = path.resolve(__dirname, '../images');
  const singleMenuPath = path.join(imagesDir, 'menu.jpg');

  const caption =
    `🍽️ *${storeName || 'The Daily Spice Café & Kitchen'} — Official Menu Card*\n\n` +
    `Here is our full menu! 📜\n\n` +
    `What would you like to order today? You can:\n` +
    `• Reply with items (e.g. *"1 coke 2 pizza"* or *"do plate babycorn"*)\n` +
    `• Send a voice note 🎙️\n` +
    `• Send a photo of your handwritten order 📷\n` +
    `• Or say *"order my usual"*!`;

  if (fs.existsSync(singleMenuPath)) {
    try {
      const buf = fs.readFileSync(singleMenuPath);
      await sock.sendMessage(to, { image: buf, caption });
      console.log(`📜 Sent single menu card image to ${to}`);
      return;
    } catch (e) {
      console.error('Menu card image send error:', e.message);
    }
  }

  // Fallback: send individual item cards if menu.jpg not found
  for (const item of catalog) {
    let buf = null;
    if (item.image) {
      const fp = path.join(imagesDir, path.basename(item.image));
      if (fs.existsSync(fp)) buf = fs.readFileSync(fp);
    }
    const itemCaption =
      `🍽️ *${item.name}*\n` +
      `🏷️ ${item.cat || 'Special'} | 💰 *₹${item.price}*\n` +
      `⚡ _${item.stock || 'Available'}_`;
    try {
      if (buf) await sock.sendMessage(to, { image: buf, caption: itemCaption });
      else     await sock.sendMessage(to, { text : itemCaption });
    } catch (e) { console.error(`Card send error (${item.name}):`, e.message); }
    await new Promise(r => setTimeout(r, 200));
  }
  await sock.sendMessage(to, { text: caption });
}

// ─── 11. Local Fallback (no Sarvam key / Sarvam down) ────────────────────────
function localFallback(text, storeName, catalog) {
  const lc = (text||'').toLowerCase();
  if (/\b(hi|hello|namaste|hey|hola)\b/.test(lc))
    return `Namaste! Welcome to *${storeName}* 🙏 How can I help you today — order food, book a table, or check our menu?`;
  if (/\b(table|reserve|booking)\b/.test(lc))
    return `Happy to book a table! Could you share the date, time, number of guests, and your name?`;
  if (/\b(complaint|wrong|late|bad|cold)\b/.test(lc))
    return `I'm sorry to hear that. Could you share your order details and what went wrong? Our team will follow up.`;
  for (const oom of ['burger','pasta','noodles','sushi','taco','sandwich','roti','dosa','idli']) {
    if (lc.includes(oom)) {
      const s = catalog.slice(0,3).map(i=>`• *${i.name}* (₹${i.price})`).join('\n');
      return `Sorry, *${oom}* isn't available right now. Here are some of our fresh options:\n${s}`;
    }
  }
  return `Welcome to *${storeName}*! 🍽️ You can order food, check our menu, book a table, or ask anything.`;
}

// ─── 12. UPI QR ───────────────────────────────────────────────────────────────
function buildUpiUri(orderId, amount, name) {
  return `upi://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(name||'Cafe Vaidehi')}&am=${amount}&tn=${orderId}`;
}
async function upiQrBuffer(uri) {
  return qrcode.toBuffer(uri, { width:400, margin:2, color:{ dark:'#0A3622', light:'#FFFFFF' } });
}

// ─── 13. Baileys WhatsApp Socket ──────────────────────────────────────────────
const authPath = path.join(__dirname, 'auth_info');
if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive:true });

let sock = null;
let currentStatus = { state:'starting', message:'Ready to connect' };
let lastQrDataUrl  = null;
let isStarting     = false;

async function startSocket() {
  if (isStarting) return;
  isStarting = true;

  currentStatus = { state:'starting', message:'Initializing…' };
  io.emit('wa:status', currentStatus);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version }          = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      logger                      : pino({ level:'silent' }),
      printQRInTerminal           : false,
      auth                        : state,
      browser                     : ['Cafe Vaidehi Bot','Chrome','120.0.0'],
      syncFullHistory             : false,
      generateHighQualityLinkPreview: false,
      markOnlineOnConnect         : true,
      defaultQueryTimeoutMs       : 60000
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        try {
          lastQrDataUrl = await qrcode.toDataURL(qr, { margin:2, scale:6 });
          currentStatus = { state:'qr', message:'Scan QR Code' };
          io.emit('wa:qr', lastQrDataUrl);
          io.emit('wa:status', currentStatus);
          console.log('📲 QR ready');
        } catch (e) { console.error('QR encode error:', e); }
      }

      if (connection === 'close') {
        const code = (lastDisconnect?.error instanceof Boom)
          ? lastDisconnect.error.output?.statusCode
          : lastDisconnect?.error?.code;
        const reconnect = code !== DisconnectReason.loggedOut;
        console.log(`⚠️  WA closed (code ${code}). Reconnect: ${reconnect}`);
        currentStatus = { state:'disconnected', message:'Disconnected' };
        io.emit('wa:status', currentStatus);
        isStarting = false;
        if (reconnect) { setTimeout(startSocket, 3000); }
        else {
          try {
            sock?.ev.removeAllListeners?.();
            sock?.end?.();
          } catch (_) {}
          try {
            fs.rmSync(authPath, { recursive:true, force:true });
            fs.mkdirSync(authPath, { recursive:true });
          } catch (_) {}
          setTimeout(startSocket, 2000);
        }
      } else if (connection === 'open') {
        console.log('🟢 WA connected — bot is live');
        currentStatus = { state:'connected', message:'🟢 WhatsApp Bot Live' };
        lastQrDataUrl = null;
        isStarting    = false;
        io.emit('wa:status', currentStatus);
      }
    });

    // ── Message Router ────────────────────────────────────────────────────────
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const from     = msg.key.remoteJid;
        const customer = getCustomer(from);
        const session  = customer.orderSession;
        const storeName = activeStoreConfig.storeName || 'Cafe Vaidehi';

        // ── A. Detect & download media ──────────────────────────────────────
        let mediaType  = null;   // 'audio' | 'image' | null
        let mediaB64   = null;
        let mediaMime  = null;
        let ocrText    = null;
        let textContent= '';

        if (msg.message?.audioMessage) {
          try {
            const buf = await downloadMediaMessage(msg,'buffer',{},
              { logger: pino({ level:'silent' }), reuploadRequest: sock.updateMediaMessage });
            mediaType = 'audio';
            mediaB64  = buf.toString('base64');
            mediaMime = msg.message.audioMessage.mimetype || 'audio/ogg; codecs=opus';
            console.log(`🎙️  Voice note from ${from}`);
          } catch (e) { console.error('Audio download error:', e.message); }

        } else if (msg.message?.imageMessage) {
          try {
            const buf = await downloadMediaMessage(msg,'buffer',{},
              { logger: pino({ level:'silent' }), reuploadRequest: sock.updateMediaMessage });
            mediaMime  = msg.message.imageMessage.mimetype || 'image/jpeg';
            ocrText    = await ocrPhoto(buf, mediaMime);
            mediaType  = 'image';
            textContent= msg.message.imageMessage.caption || '';
            console.log(`📷  Photo from ${from}${ocrText ? ' — OCR OK' : ' — OCR empty'}`);
          } catch (e) { console.error('Image download error:', e.message); }

        } else {
          textContent = msg.message.conversation ||
                        msg.message.extendedTextMessage?.text ||
                        msg.message.buttonsResponseMessage?.selectedDisplayText ||
                        msg.message.listResponseMessage?.title || '';
          if (textContent) console.log(`📝 Raw text: "${textContent.slice(0,100)}"`);
        }

        // ── B. Build effective text ─────────────────────────────────────────
        // For audio: transcribe via Gemini first, then work from the transcript.
        // For photo: combine caption + OCR text.
        let effectiveText = textContent.trim();

        if (mediaType === 'audio' && mediaB64) {
          const transcript = await transcribeAudio(mediaB64, mediaMime);
          if (transcript) {
            effectiveText = transcript;
            console.log(`🎙️ Successfully converted Voice Note to order text: "${effectiveText}"`);
          } else {
            console.warn(`⚠️ [Voice Note] Failed to transcribe audio from ${from}. Informing customer.`);
            await sock.sendMessage(from, {
              text: `🎙️ Voice note received! Audio transcription requires a valid GEMINI_API_KEY in the bot's .env file. Please type your order items (e.g. "1 coke 2 pizza") or send a photo of your handwritten slip!`
            });
            continue;
          }
        }

        if (mediaType === 'image') {
          const parts = [];
          if (textContent) parts.push(textContent);
          if (ocrText)      parts.push(`[Photo OCR text: "${ocrText}"]`);
          if (!ocrText)     parts.push('[Customer sent a photo — OCR could not extract text. Ask them to retype or send a clearer photo.]');
          effectiveText = parts.join(' ').trim();
        }

        if (!effectiveText) continue;

        const lc = effectiveText.toLowerCase();
        console.log(`📩 [${from}] [${session.status}] "${effectiveText.slice(0,120)}"`);

        // ════════════════════════════════════════════════════════════════════
        // DETERMINISTIC LAYER — runs before Sarvam for precision
        // ════════════════════════════════════════════════════════════════════

        // ── 1. AWAITING_ADDRESS: collect address → generate UPI QR ────────
        if (session.status === 'AWAITING_ADDRESS' && effectiveText.length > 3) {
          session.address  = effectiveText;
          const orderId    = generateOrderId();
          const total      = cartTotal(session.cart);

          customer.lastOrder = {
            orderId, items:[...session.cart], totalAmount:total,
            mode:'delivery', address:session.address, payment:'UPI',
            status:'confirmed', timestamp:new Date()
          };
          customer.usualOrder = {
            items:[...session.cart], totalAmount:total, timestamp:new Date()
          };
          console.log(`💾 Order ${orderId} saved. Total: ${total}rs`);

          const upiUri = buildUpiUri(orderId, total, storeName);
          const qrBuf  = await upiQrBuffer(upiUri);

          const rows = session.cart.map(i =>
            `• ${displayName(i.name)} (${i.qty}x) — ${i.price * i.qty}rs`
          ).join('\n');

          const caption =
            `Tap here to pay ${total}rs for order ${orderId}:\n${upiUri}\n\n` +
            `🧾 *Order ${orderId} Receipt*\n` +
            `📍 *Delivery:* ${session.address}\n` +
            `─────────────────────\n${rows}\n` +
            `─────────────────────\n💰 *Total: ${total}rs*\n\n` +
            `Scan with GPay / PhonePe / Paytm. Your order is on its way! 🚀`;

          try {
            await sock.sendMessage(from, { image: qrBuf, caption });
          } catch (e) {
            await sock.sendMessage(from, { text: caption });
          }

          // reset
          session.status  = 'IDLE';
          session.cart    = [];
          session.address = null;
          continue;
        }

        // ── 2. AWAITING_CONFIRMATION: listen for yes/confirm ──────────────
        const confirmed = /\b(yes|confirm|confirmed|haan|ha|sahi|sahi hai|ok|okay|sure|proceed|right|bilkul|correct)\b/i.test(lc);
        if (session.status === 'AWAITING_CONFIRMATION' && confirmed) {
          session.status = 'AWAITING_ADDRESS';
          await sock.sendMessage(from, {
            text: `Order confirmed! 🛵\n\nPlease share your complete delivery address (and a nearby landmark) — we deliver within 5 km.`
          });
          continue;
        }

        // ── 3. Visual menu request ────────────────────────────────────────
        const isMenuQuery = /^(menu|catalog|menu card|rate card|price list)$/i.test(lc) ||
          /\b(show|send|share|give|see|view|check|display|want)\b.*\b(menu|catalog|card|list)\b/i.test(lc) ||
          /\b(menu dikhao|menu bhejo|kya milega|kya hai|menu please|food menu|dishes|the menu)\b/i.test(lc);
        if (isMenuQuery) {
          await sendMenuCards(sock, from, activeStoreConfig.catalog, storeName);
          continue;
        }

        // ── 4. "Order my usual" ───────────────────────────────────────────
        if (/\b(usual|my usual|same as last|same order)\b/i.test(lc)) {
          if (customer.usualOrder?.items?.length > 0) {
            session.cart   = JSON.parse(JSON.stringify(customer.usualOrder.items));
            session.status = 'AWAITING_CONFIRMATION';
            const bill = formatBill(session.cart, storeName);
            await sock.sendMessage(from, {
              text: `Found your usual order! 🍽️\n\n${bill}\n\nWould you like to confirm? (Reply *Yes* or *Confirm*)`
            });
          } else {
            await sock.sendMessage(from, {
              text: `I don't have your usual saved yet! What would you like today? I'll remember this order as your usual for next time.`
            });
          }
          continue;
        }

        // ── 5. Detect catalog items → show itemized bill every time ───────
        const matchedItems = extractOrderItems(effectiveText, activeStoreConfig.catalog);
        const doneIntent   = /\b(done|that's all|thats all|bas|bas itna|bas itna hi|finish|finished|complete|khatam|itna hi|nothing else)\b/i.test(lc);

        if (matchedItems.length > 0) {
          addToCart(session, matchedItems);

          if (doneIntent || session.status === 'AWAITING_CONFIRMATION') {
            // If customer added items AND said done in same message
            session.status = 'AWAITING_CONFIRMATION';
            const bill = formatBill(session.cart, storeName);
            await sock.sendMessage(from, {
              text: `${bill}\n\nWould you like to confirm this order? (Reply *Yes* or *Confirm* to place it)`
            });
          } else {
            session.status = 'COLLECTING';
            const bill = formatBill(session.cart, storeName);
            await sock.sendMessage(from, {
              text: `${bill}\n\nWould you like to add anything else? (Reply with more items, or say *DONE* to finalise)`
            });
          }
          continue;
        }

        // ── 6. DONE with nothing new ──────────────────────────────────────
        if (doneIntent) {
          if (session.cart.length > 0) {
            session.status = 'AWAITING_CONFIRMATION';
            const bill = formatBill(session.cart, storeName);
            await sock.sendMessage(from, {
              text: `${bill}\n\nWould you like to confirm this order? (Reply *Yes* or *Confirm* to place it)`
            });
          } else {
            await sock.sendMessage(from, {
              text: `Your cart is empty! What would you like to have? Say "menu" to see our dishes.`
            });
          }
          continue;
        }

        // ── 7. Out-of-menu item detection ─────────────────────────────────
        const ooms = ['burger','pasta','noodles','sushi','taco','sandwich','ice cream','roti','dosa','idli'];
        const hitOom = ooms.find(o => lc.includes(o));
        if (hitOom) {
          const sug = activeStoreConfig.catalog.slice(0,3).map(i=>`• *${i.name}* (₹${i.price})`).join('\n');
          await sock.sendMessage(from, {
            text: `Sorry, *${hitOom}* isn't on our menu right now. Here are some of our fresh options:\n${sug}`
          });
          continue;
        }

        // ════════════════════════════════════════════════════════════════════
        // SARVAM AI — Primary conversational brain for everything else
        // Handles: greetings, reservations, complaints, enquiries,
        //          order status, multilingual replies, general chat
        // ════════════════════════════════════════════════════════════════════
        let reply = await callSarvam(from, effectiveText, customer);

        if (!reply) {
          // Sarvam unavailable — use local fallback
          reply = localFallback(effectiveText, storeName, activeStoreConfig.catalog);
        }

        try {
          await sock.sendMessage(from, { text: reply });
          console.log(`📤 → "${reply.slice(0,120)}"`);
        } catch (e) {
          console.error('Send error:', e.message);
        }
      }
    });

  } catch (err) {
    console.error('Socket start error:', err);
    currentStatus = { state:'disconnected', message: err.message };
    io.emit('wa:status', currentStatus);
    isStarting = false;
  }
}

// ─── 14. Socket.IO frontend events ───────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Frontend connected: ${socket.id}`);
  socket.emit('wa:status', currentStatus);
  if (lastQrDataUrl && currentStatus.state === 'qr') socket.emit('wa:qr', lastQrDataUrl);

  socket.on('launch-store-bot', (payload) => {
    console.log('🚀 launch-store-bot received');
    if (payload) {
      activeStoreConfig = {
        storeName   : payload.storeName    || activeStoreConfig.storeName,
        phone       : payload.phone        || activeStoreConfig.phone,
        occupation  : payload.occupation   || activeStoreConfig.occupation,
        deliveryMode: payload.deliveryMode || activeStoreConfig.deliveryMode,
        activeStages: payload.activeStages || activeStoreConfig.activeStages || [],
        catalog     : (payload.catalog?.length > 0) ? payload.catalog : activeStoreConfig.catalog
      };
    }
    if (!sock || currentStatus.state === 'disconnected') startSocket();
    else {
      socket.emit('wa:status', currentStatus);
      if (lastQrDataUrl && currentStatus.state === 'qr') socket.emit('wa:qr', lastQrDataUrl);
    }
  });

  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

// ─── 15. HTTP endpoints ───────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({
  status          : 'ok',
  waStatus        : currentStatus,
  store           : activeStoreConfig.storeName,
  agentId         : SARVAM_AGENT_ID,
  sarvamConnected : !!SARVAM_API_KEY,
  catalogCount    : activeStoreConfig.catalog.length,
  customersInMemory: customerStore.size
}));

// ─── 16. Start ────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log('='.repeat(55));
  console.log(`🚀  Cafe Vaidehi Bot  →  http://localhost:${PORT}`);
  console.log(`    Primary brain  :  Sarvam AI  (${SARVAM_AGENT_ID})`);
  console.log(`    Audio STT      :  Gemini 3 Flash (voice → text)`);
  console.log(`    Photo OCR      :  OCR.space`);
  console.log(`    Cart & billing :  Deterministic state machine`);
  console.log(`    UPI VPA        :  ${UPI_VPA}`);
  console.log('='.repeat(55));
});
