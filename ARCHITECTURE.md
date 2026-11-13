# 01 - ARCHITECTURE
## AI-Powered WhatsApp Commerce Platform

> Status: v1.0 (MVP-first). Owner: Founding team. Read `02-TECH-STACK.md` for tool choices and `03-IMPLEMENTATION.md` for build steps.

---

## 0. Read This First (Plain English)

- **WhatsApp is the shop for customers.** Customers never open a website. They chat, send voice notes, or send photos.
- **The web dashboard is the back office for merchants.** Merchants manage products, orders, and chats there.
- **AI understands messages. Normal code handles money.** The AI works out what the customer wants. Ordinary, tested code decides prices, stock, totals, and whether a payment succeeded.

### Words you will see in this document

| Word | Simple meaning |
|---|---|
| **Webhook** | Meta (WhatsApp) calls our server when a customer sends something. |
| **Tenant** | One merchant's business. Each merchant's data is kept separate. |
| **Agent** | An AI helper with one job (for example, "understand the shopping request"). |
| **Tool** | A normal function an agent is allowed to call (for example, `search_products`). Agents cannot do anything else. |
| **Orchestrator** | The main controller that decides which agent or tool runs next. |
| **Idempotent** | Doing the same action twice has the same result as doing it once. Needed because webhooks can arrive twice. |
| **Escalation** | Handing a chat from the AI to a human merchant. |
| **Template** | A pre-approved WhatsApp message. Required to message a customer after 24 hours of silence. |
| **Paise** | The smallest Indian currency unit. ₹1 = 100 paise. We store all money as whole paise numbers. |

---

## 1. Golden Rules (Never Break These)

1. **The LLM never sets a price, stock count, total, discount, or payment status.** Those come from the database through tools.
2. **No order is created until the customer explicitly confirms** (a "yes" or a button tap on the cart summary).
3. **A payment becomes `paid` only when a verified payment-provider webhook arrives.** A screenshot never counts.
4. **Every business table has a `tenant_id`.** The database itself blocks cross-tenant reads (Row-Level Security).
5. **Every inbound WhatsApp message is stored once.** The unique WhatsApp message ID prevents double processing.
6. **Money is stored as integers in paise.** No floating-point money.
7. **Agents can only call registered tools.** No free-form database queries, no raw SQL from AI.
8. **An escalated conversation is silent for the AI.** Only the human merchant speaks until they hand it back.
9. **Abandonment reasons and product matches are labelled "probable."** Risk scores recommend actions; they never auto-reject a customer.
10. **Business-initiated messages outside the 24-hour window use approved templates only.**

---

## 2. System Context

````
   CUSTOMER                                   MERCHANT
   (WhatsApp app)                             (Web dashboard in browser)
       │                                            │
       │ text / voice / image / button              │ login, manage, take over
       ▼                                            ▼
┌──────────────────┐                      ┌──────────────────────┐
│ WhatsApp Cloud   │                      │  Merchant Dashboard  │
│ API (Meta)       │                      │  (React + Vite)      │
└────────┬─────────┘                      └──────────┬───────────┘
         │ webhook (HTTPS POST)                      │ HTTPS API
         ▼                                           ▼
┌───────────────────────────────────────────────────────────────┐
│                    BACKEND API (Node.js + TypeScript)          │
│  Channel Gateway → Ingestion Queue → Conversation Worker       │
│                         │                                      │
│        Input Understanding (audio / image → text & fields)     │
│                         │                                      │
│        Orchestrator ──► Agents ──► Tool Layer                  │
│                                      │                         │
│        Business Services: Catalog · Inventory · Cart · Order   │
│        · Payment · Customer · Recovery · Risk · CRM · Events   │
└───────────────┬────────────────────────────┬──────────────────┘
                │                            │
     ┌──────────▼──────────┐      ┌──────────▼──────────┐
     │ PostgreSQL (Supabase)│      │ Object storage      │
     │ + Realtime          │      │ (voice, images)     │
     └─────────────────────┘      └─────────────────────┘
                │
     ┌──────────▼──────────────────────────────┐
     │ n8n (async workflows: alerts, reminders, │
     │ tracking updates, reorder suggestions)   │
     └──────────┬──────────────────────────────┘
                │
     ┌──────────▼──────────┐
     │ Payment provider     │  (Razorpay: links + webhooks)
     └─────────────────────┘
````

---

## 3. Components

| # | Component | Responsibility | Built by us? |
|---|---|---|---|
| C1 | **Channel Gateway** | Receives Meta webhooks, verifies signature, stores raw event, returns `200 OK` fast. | Yes |
| C2 | **Ingestion Queue** | Holds events so the webhook reply is never slow. Retries on failure. | Yes (Postgres-backed queue at MVP) |
| C3 | **Conversation Worker** | Takes one event at a time, loads session, calls understanding and orchestrator, sends reply. | Yes |
| C4 | **Media Processor** | Downloads audio/image from Meta, converts format, transcribes or extracts text. | Yes (uses free AI services) |
| C5 | **Orchestrator** | Decides next step, selects agent, enforces guardrails, writes audit log. | Yes |
| C6 | **Agents** | Specialist AI helpers (Section 5). | Yes (prompts + tool calls) |
| C7 | **Tool Layer** | Typed functions agents may call. Validates input and output. | Yes |
| C8 | **Business Services** | Deterministic code for catalog, inventory, cart, orders, payments, risk, CRM. | Yes |
| C9 | **Response Composer** | Turns results into WhatsApp messages: text, list, button, product card, Flow. | Yes |
| C10 | **Merchant Dashboard** | Overview, conversations, products, customers, orders, settings. | Yes |
| C11 | **Automation (n8n)** | Async flows: merchant alerts, abandonment scheduling, dispatch updates. | Yes (workflows) |
| C12 | **Database** | System of record. Tenancy, RLS, transactions. | Managed service |
| C13 | **Object storage** | Holds raw voice notes and images for a limited retention period. | Managed service |
| C14 | **Meta WhatsApp Cloud API** | Sends and receives WhatsApp messages. Hosts media temporarily. | Meta |
| C15 | **Payment gateway** | Creates payment links, sends verified payment webhooks. | Provider |

---

## 4. Request Lifecycles

### 4.1 Text message: "I need two packets of milk"

1. Meta POSTs to `/webhooks/whatsapp`. Gateway verifies `X-Hub-Signature-256`.
2. Gateway stores the raw event in `inbound_events` with a unique key = WhatsApp message ID. Duplicate? Stop here and return 200.
3. Gateway returns `200 OK` within a second.
4. Worker picks the event. It resolves `tenant_id` from the receiving phone number ID.
5. Worker loads or creates `customer` and `conversation`. If `mode = human`, it stops (escalation rule).
6. Orchestrator builds context: last 10 messages, current cart, conversation state, tenant settings.
7. Shopping Agent extracts intent and entities: `{ product: "milk", quantity: 2 }`.
8. Orchestrator calls `search_products("milk")` (tool). Catalog returns real products with real prices.
9. Orchestrator calls `check_stock(variant_ids)` (tool).
10. Orchestrator calls `add_to_cart(...)` (tool). Cart total computed by code, not AI.
11. Response Composer sends a cart summary with buttons: **Confirm order** / **Change** / **Cancel**.
12. Event timeline records `product_added_to_cart`.

### 4.2 Voice note: "Send two packets of Amul milk and one kilo sugar"

1. Webhook arrives with `type = audio` and `media_id`.
2. Media Processor calls Meta to get the file URL, downloads it, stores it, and converts OGG/Opus to a format the speech service accepts.
3. Speech-to-text returns a transcript and language tag. Stored with the message.
4. From here it follows 4.1 starting at step 6 (the transcript is the text).
5. If confidence is low or quantities are unclear, the agent asks one short follow-up question.

### 4.3 Photo of a handwritten list

1. Webhook with `type = image`. Media Processor downloads it.
2. Vision/OCR returns line items with a confidence score per line.
3. Lines below threshold become clarifying questions ("Is this 'dal' or 'daal'?").
4. Each confirmed line goes through catalog matching (4.1 steps 8–10).

### 4.4 Photo of an unknown product

1. Vision model returns a likely category and attributes with a confidence score.
2. Catalog search returns up to 3 candidates.
3. AI says: "This looks like a handheld vegetable chopper. Here are 3 options." (Suggests, never assumes.)
4. Customer taps the right product. If none match, escalate to human.

### 4.5 Checkout and payment

1. Customer taps **Confirm order**. Order Agent calls `create_order` (tool).
2. Backend, in one DB transaction: re-checks stock, reserves units (with a 15-minute expiry), writes `orders` and `order_items`, sets order to `pending_payment`.
3. Payment Agent calls `create_payment_link(order_id)`. Backend creates the link with the provider and stores `payments` row as `created`.
4. Customer pays.
5. Provider webhook hits `/webhooks/payments`. Signature verified. Event ID deduplicated.
6. Payment Service marks payment `paid`, order `paid`, converts reservation to a sale. Sends confirmation (template if outside 24h window).
7. If the reservation expired before payment, the order is cancelled and the customer is told honestly.

---

## 5. Agent Design

We use **several small agents** under one orchestrator, not one big agent. Each agent has a short prompt, a fixed list of tools, and a clear output shape.

| Agent | Job | Allowed tools (examples) | Must NOT |
|---|---|---|---|
| **Orchestrator** | Routes work, enforces rules, writes audit log | All agents, state read/write | Set prices or payment status |
| **Shopping Agent** | Understands the request, asks follow-ups, recommends | `search_products`, `get_customer_profile` | Quote prices from memory |
| **Catalog Agent** | Matches text or image-derived names to catalog items | `search_products`, `vector_search` | Create products |
| **Inventory Agent** | Checks stock, proposes alternatives | `check_stock`, `find_alternatives` | Change stock |
| **Order Agent** | Builds cart, prepares order summary | `add_to_cart`, `update_cart_item`, `remove_from_cart`, `create_order` | Create order without confirmation |
| **Payment Agent** | Offers payment, answers status questions | `create_payment_link`, `get_payment_status` | Mark paid |
| **Customer Agent** | My Usual, My Wishlist, preferences | `get_usual_items`, `wishlist_add`, `wishlist_list` | Send marketing without consent |
| **Recovery Agent** | Classifies abandonment reason, schedules follow-up | `log_event`, `schedule_followup`, `get_cart_events` | Message outside window without template |
| **Risk Agent** | Scores orders, recommends checks | `get_order_history`, `create_risk_assessment` | Reject orders |
| **Escalation Agent** | Writes merchant summary and suggested reply | `create_escalation`, `get_conversation` | Message the customer directly |

### 5.1 Agent output contract (every agent returns this shape)

````json
{
  "agent": "shopping",
  "intent": "order_items",
  "entities": [{ "text": "milk", "quantity": 2, "unit": "packet", "confidence": 0.92 }],
  "next_action": "call_tool",
  "tool_calls": [{ "name": "search_products", "args": { "query": "milk" } }],
  "customer_message_draft": null,
  "needs_human": false,
  "reason": "clear request with quantity"
}
````

The orchestrator rejects any output that does not match this shape, or that names an unregistered tool.

### 5.2 Confidence rules

| Confidence | What happens |
|---|---|
| ≥ 0.85 | Proceed (for example, show candidates) |
| 0.60 – 0.84 | Ask a clarifying question |
| < 0.60 | Ask the customer to rephrase, or escalate after 2 attempts |

---

## 6. Tool Registry (Contracts)

Each tool has a name, input schema, output schema, and an owner service. The Tool Layer validates both sides.

| Tool | Input (summary) | Output (summary) | Owner service |
|---|---|---|---|
| `search_products` | `tenant_id`, `query`, `limit` | list of `{product_id, name, price_paise, variants}` | Catalog |
| `vector_search` | `tenant_id`, `text_or_embedding`, `limit` | ranked product IDs with score | Catalog |
| `check_stock` | `variant_ids[]` | `{variant_id, available_qty}` | Inventory |
| `find_alternatives` | `variant_id`, `constraints` | up to 3 variants | Inventory |
| `add_to_cart` | `conversation_id`, `variant_id`, `qty` | updated cart with totals | Cart |
| `update_cart_item` | `cart_item_id`, `qty` | updated cart | Cart |
| `remove_from_cart` | `cart_item_id` | updated cart | Cart |
| `create_order` | `cart_id`, `delivery_address`, `confirmation_token` | `order_id`, `status` | Order |
| `create_payment_link` | `order_id` | `payment_url`, `expires_at` | Payment |
| `get_payment_status` | `order_id` | status from our DB | Payment |
| `get_usual_items` | `customer_id` | top N items by frequency | Customer |
| `wishlist_add` / `wishlist_list` | `customer_id`, `variant_id` | wishlist items | Customer |
| `log_event` | `conversation_id`, `type`, `payload` | `event_id` | Events |
| `schedule_followup` | `conversation_id`, `template_name`, `run_at` | `job_id` | Recovery (via n8n) |
| `create_risk_assessment` | `order_id` | `score`, `factors`, `recommended_action` | Risk |
| `create_escalation` | `conversation_id`, `reason` | `escalation_id` | CRM |

**Important:** `create_order` requires a `confirmation_token` that the backend issued only after the customer tapped "Confirm." An agent cannot forge it.

---

## 7. State Machines

### 7.1 Conversation mode

````
  ai ──(escalation trigger)──► human ──(merchant clicks "Hand back")──► ai
   │
   └──(customer asks for human)──► human
````

### 7.2 Cart

`open → awaiting_confirmation → converted_to_order` or `open → abandoned`

### 7.3 Order

`draft → pending_payment → paid → dispatched → delivered`
Side paths: `pending_payment → expired | cancelled`, `paid → refund_requested → refunded`

### 7.4 Payment

`created → pending → paid | failed | expired`

**Rule:** only the Payment Service may change payment status. Only the webhook handler may set `paid`.

### 7.5 Inventory reservation

`available → reserved (TTL 15 min) → sold` or `reserved → released (on expiry or cancel)`

---

## 8. Data Model (Summary)

Full SQL is in `03-IMPLEMENTATION.md` (Phase 2). Every table below has `tenant_id` except where noted.

| Table | Purpose | Key notes |
|---|---|---|
| `tenants` | Merchants | Not tenant-scoped itself |
| `whatsapp_accounts` | Phone number IDs, token references | Token encrypted, never stored in plain text |
| `customers` | Shoppers per tenant | Unique `(tenant_id, wa_id)` |
| `conversations` | Chat thread | `mode` = ai / human |
| `messages` | Each inbound/outbound message | Unique `wa_message_id` |
| `inbound_events` | Raw webhook payloads | Dedup key, processing status, retry count |
| `products` / `product_variants` | Catalog | Price in paise |
| `inventory` | Stock per variant | `on_hand`, `reserved` |
| `carts` / `cart_items` | Shopping cart | Snapshot price on add |
| `orders` / `order_items` | Confirmed orders | Snapshot price at order time |
| `payments` | Payment records | `provider_payment_id` unique |
| `payment_events` | Raw provider webhooks | Dedup by provider event ID |
| `wishlists` | Saved items | Unique `(customer_id, variant_id)` |
| `events` | Journey timeline | Used by recovery |
| `escalations` | Handover records | Status, assigned merchant |
| `risk_assessments` | Order risk | Factors stored, probable labels |
| `consents` | Opt-in / opt-out | Required for marketing |
| `agent_actions` | Audit log of every tool call | Input, output, agent, time |
| `templates` | Approved WhatsApp templates | Name, language, status |

---

## 9. Multi-Tenancy and Security

- **Tenant resolution:** the receiving `phone_number_id` in the webhook maps to exactly one `tenant_id`. Never trust a tenant ID sent by the customer.
- **Row-Level Security (RLS):** every table has a policy `tenant_id = current_tenant()`. The backend sets `current_tenant` per transaction.
- **Service role:** the backend uses a server-only key. The browser dashboard uses user login (Supabase Auth) and RLS.
- **Secrets:** Meta app secret, access tokens, payment keys live in environment variables or a secrets manager. Never in Git.
- **Encryption:** merchant WhatsApp tokens are encrypted at rest with AES-256-GCM using a key kept outside the database.
- **PII minimisation:** store only what is needed. Voice and image files deleted after a retention window (default 30 days, configurable).
- **Logs:** never log full phone numbers or full addresses. Mask them.
- **Consent:** marketing and replenishment messages need an opt-in row in `consents`. STOP keyword writes an opt-out immediately.

---

## 10. Reliability

| Concern | Design |
|---|---|
| Duplicate webhooks | Unique key on `inbound_events.wa_message_id`. Second insert fails safely. |
| Slow processing | Webhook returns 200 immediately. Work runs in the queue. |
| Crash mid-processing | Event stays `processing` with a lease. Expired lease is retried. Max 5 retries, then dead-letter and alert. |
| Double-sold stock | Reserve in the same transaction as order creation. Re-check at payment. TTL releases stale reservations. |
| Payment webhook retried | `payment_events` unique on provider event ID. Status transitions are guarded (cannot go `paid` → `created`). |
| LLM timeout or error | Fallback: reply with a safe message ("Let me connect you to the shop team") and log the failure. |
| Meta send failure | Retry with backoff. Store outbound message as `failed` if it still fails. |

---

## 11. Automation (n8n) Boundary

**n8n handles:** merchant alerts, scheduling follow-up jobs, sending dispatch updates, reorder suggestion generation, daily summaries.

**Backend handles (never n8n):** webhook handling, AI replies, cart, stock reservation, order creation, payment verification.

| Trigger | n8n workflow | Calls back into backend |
|---|---|---|
| `order.created` | Notify merchant (WhatsApp/email) | No |
| `escalation.created` | Send alert with summary | No |
| `cart.abandoned` (after T hours) | Check window, choose template, send | `POST /internal/followups/send` |
| `order.dispatched` | Send tracking template | `POST /internal/outbound/template` |
| `customer.reorder_due` | Build suggestion, check consent, send template | Same as above |
| Daily 9 PM | Merchant summary email | Read-only API |

Every n8n call into the backend uses a signed internal token and an idempotency key.

---

## 12. Repository Structure

````
wa-commerce/
├─ apps/
│  ├─ api/                    # Backend (Node.js + TypeScript + Fastify)
│  │  ├─ src/
│  │  │  ├─ webhooks/         # whatsapp.ts, payments.ts
│  │  │  ├─ worker/           # queue consumer
│  │  │  ├─ orchestrator/     # router, guardrails, audit
│  │  │  ├─ agents/           # prompts + output parsers, one file per agent
│  │  │  ├─ tools/            # tool definitions + schema validation
│  │  │  ├─ services/         # catalog, inventory, cart, orders, payments, risk, crm, events
│  │  │  ├─ media/            # download, convert, transcribe, ocr
│  │  │  ├─ channel/          # WhatsApp send helpers, template registry
│  │  │  ├─ db/               # client, migrations, RLS helpers
│  │  │  └─ lib/              # money, logging, crypto, idempotency
│  │  └─ tests/
│  ├─ dashboard/              # React + Vite + TypeScript + Tailwind
│  └─ workflows/              # n8n exported JSON workflows
├─ packages/
│  └─ shared/                 # shared types, zod schemas
├─ supabase/
│  └─ migrations/             # SQL migrations (version controlled)
├─ docs/                      # these four documents
├─ skills/                    # agent skill instructions (see 03 Section 9)
├─ evals/                     # AI test datasets (see 04)
└─ .github/workflows/         # CI
````

---

## 13. Environments

| Environment | Purpose | WhatsApp | Payments | Hosting |
|---|---|---|---|---|
| **local** | Developer machine | Test number + ngrok/Cloudflare tunnel | Provider test mode | Docker Compose |
| **staging** | Demo and pilot testing | Test number, test catalog | Test mode | Free cloud tier |
| **production** | Real merchants | Verified business number (after Meta approvals) | Live mode | Paid tier when traffic grows |

---

## 14. Key Architecture Decisions (ADR Log)

| ID | Decision | Why |
|---|---|---|
| ADR-01 | Multi-agent with orchestrator, not one agent | Smaller prompts are easier to test and cheaper to run |
| ADR-02 | Deterministic code owns money and stock | Prevents hallucinated prices and wrong charges |
| ADR-03 | Webhook-only payment verification | A screenshot or a customer claim is not proof |
| ADR-04 | Postgres-backed queue at MVP | One fewer service to run; Redis can be added later |
| ADR-05 | n8n for async only | Keeps the chat path fast and debuggable |
| ADR-06 | Row-Level Security for tenancy | Protection lives in the database, not only in app code |
| ADR-07 | Integer paise money | Avoids rounding bugs |
| ADR-08 | WhatsApp Cloud API only | Official, supports multi-tenant onboarding |
| ADR-09 | Flows for structured forms, AI for free text | Matches WhatsApp limits and feels natural |
| ADR-10 | Probable labels for abandonment and risk | Avoids false certainty and unfair decisions |

