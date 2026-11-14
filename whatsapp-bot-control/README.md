# Cafe Vaidehi WhatsApp Assistant — Backend Engine

AI-powered conversational ordering assistant integrated with Sarvam AI and Google Gemini for WhatsApp commerce.

## Architecture & Features

1. **Multilingual Voice Note Audio-to-Order**:
   - Inbound `audioMessage` voice notes are downloaded via Baileys and processed inline.
   - Responds natively in the exact language/dialect spoken by the customer (English, Hindi, Marathi, Hinglish, Konkani, etc.).

2. **Photo Ordering & Handwritten List OCR**:
   - Inbound `imageMessage` photos of menus or handwritten slips are processed via Gemini Vision.
   - Items are verified strictly against the catalog and read back for quantity confirmation.

3. **Visual Menu Cards**:
   - Inquiring about the menu or dishes broadcasts individual WhatsApp image cards with photos, verified categories, and exact ₹ prices.

4. **Strict Out-of-Catalog Guardrails & Smart Alternatives**:
   - Strictly prevents inventing or confirming items outside the verified catalog.
   - Politely declines unavailable items and suggests 2–3 closest available options with prices.

5. **"Order My Usual" (The Usual)**:
   - Persistent per-customer memory keyed by WhatsApp phone number stores the customer's regular order.
   - Recalls items and bill total in one short message upon saying *"order my usual"*.

6. **Dynamic Pre-Filled UPI QR Code & Tap-to-Pay**:
   - Generates unique Order ID format `CV` + 4 digits (e.g. `CV1042`).
   - Deep link: `upi://pay?pa=<UPI_VPA>&pn=Cafe%20Vaidehi&am=<amount>&tn=<order_id>`.
   - Generates high-resolution QR code PNG buffer via `qrcode.toBuffer()` and sends as WhatsApp image receipt.

7. **Table Reservations & Complaints**:
   - Collects date, time, party size, and contact name for reservations.
   - Records customer complaints with order details for team follow-up.

---

## Environment Variables (`.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `SARVAM_API_KEY` | API Key from Sarvam AI console (optional) | _(Empty - uses native multimodal engine)_ |
| `SARVAM_AGENT_ID` | Sarvam AI Agent ID | `whatsapp-ch-779ea7d0-dd9c` |
| `UPI_VPA` | Merchant UPI Virtual Payment Address | `cafevaidehi.demo@upi` |
| `GEMINI_API_KEY` | Google Gemini API key for multimodal vision & audio | _(From parent `.env`)_ |
| `GEMINI_MODEL` | Gemini Model identifier | `gemini-3-flash-preview` |
| `PORT` | Local server port | `3001` |
| `STORE_NAME` | Store display name | `Cafe Vaidehi` |

---

## Running the Server

```bash
cd whatsapp-bot-control
npm install
node server.js
```

Health check endpoint: `http://localhost:3001/health`

