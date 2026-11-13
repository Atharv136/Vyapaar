# 03 - IMPLEMENTATION GUIDE
## Step-by-step build plan for Antigravity

> Read `01-ARCHITECTURE.md` and `02-TECH-STACK.md` first. Build in order. Do not start a phase until the previous phase's "Done when" checks pass (see `04-VALIDATION.md`).

---

## 0. How to Work With This Guide (for the team and for Antigravity)

- Each step has: **Goal**, **Build**, **Done when**.
- Small commits. One step = one or more commits with clear messages.
- Never hard-code secrets. Use `.env` locally and a secrets store in cloud.
- If a step conflicts with the Golden Rules in `01-ARCHITECTURE.md`, the Golden Rules win. Stop and ask.
- Prefer boring, readable code. This product handles money.

---

## Phase 0: Foundation and Tooling (Day 1)

### Step 0.1 - Create the repository
- **Goal:** Clean monorepo with the structure from Architecture Section 12.
- **Build:**
  - Create GitHub repo `wa-commerce`.
  - Create folders: `apps/api`, `apps/dashboard`, `apps/workflows`, `packages/shared`, `supabase/migrations`, `docs`, `skills`, `evals`.
  - Add `.gitignore` (node_modules, .env, dist, *.log).
  - Add `.env.example` listing every variable (values blank).
- **Done when:** `git clone` gives the full structure and no secrets are in history.

### Step 0.2 - Local runtime
- **Build:** Install Node.js LTS, pnpm, Docker Desktop (free for personal and small teams; check license), Git.
- **Build:** `docker-compose.yml` with `postgres:16` and `redis` (optional, can skip at MVP).
- **Done when:** `docker compose up` starts Postgres and `pnpm -v` works.

### Step 0.3 - Backend skeleton
- **Build:** In `apps/api`: TypeScript, Fastify, Zod (validation), Pino (logs), Vitest (tests), dotenv.
- **Build:** `GET /health` returns `{ "ok": true, "version": "x" }`.
- **Done when:** `pnpm dev` runs and `curl localhost:3000/health` works. `pnpm test` runs one passing test.

### Step 0.4 - Public tunnel for webhooks
- **Build:** Install Cloudflare Tunnel (`cloudflared`) or ngrok (free). Expose `localhost:3000` on an HTTPS URL.
- **Done when:** the public URL returns the health JSON from outside your machine.

### Step 0.5 - Skills folder and agent rules
- **Build:** Create the `skills/` folder with the files in Section 9 of this guide.
- **Build:** Create `AGENTS.md` at repo root (see template in Section 9.1).
- **Done when:** Antigravity can read `AGENTS.md` and the skills folder when you start a task.

---

## Phase 1: WhatsApp Echo Bot (Days 2–3)

**Purpose:** prove that messages go in and out. No AI yet.

### Step 1.1 - Meta developer app and test number
- **Build (manual, by a human):**
  1. Create a Meta developer account and an app of type "Business".
  2. Add WhatsApp product. Meta gives a free test phone number and a temporary access token.
  3. Add your own phone as a test recipient.
  4. Note `PHONE_NUMBER_ID`, `WABA_ID`, and the App Secret.
- **Done when:** you can send a template test message from the Meta dashboard to your phone.

### Step 1.2 - Webhook verification endpoint
- **Build:** `GET /webhooks/whatsapp`:
  - Read `hub.mode`, `hub.verify_token`, `hub.challenge`.
  - If mode is `subscribe` and token matches `WA_VERIFY_TOKEN`, respond with the challenge as plain text, status 200.
  - Otherwise respond 403.
- **Done when:** the Meta dashboard "Verify and save" button succeeds.

### Step 1.3 - Webhook receive endpoint with signature check
- **Build:** `POST /webhooks/whatsapp`:
  - Read the raw body (needed for signature).
  - Compute HMAC-SHA256 of raw body using App Secret. Compare to header `X-Hub-Signature-256` (strip `sha256=`). Use constant-time compare (`crypto.timingSafeEqual`).
  - Reject with 401 if invalid.
  - Respond 200 immediately.
  - Log the event type (not the full body in production).
- **Done when:** a message sent to the test number appears in logs. A fake request without a valid signature gets 401.

````ts
// Sketch only. Let Antigravity implement the full version with tests.
import crypto from "node:crypto";

export function verifyMetaSignature(rawBody: Buffer, header: string | undefined, appSecret: string): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const received = Buffer.from(header.slice(7), "hex");
  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest();
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}
````

### Step 1.4 - Send a text reply
- **Build:** `channel/whatsappClient.ts` with `sendText(phoneNumberId, to, body)` calling `POST https://graph.facebook.com/{version}/{phone-number-id}/messages` with Bearer token. Use the current Graph API version listed in Meta docs.
- **Build:** Echo: when a text arrives, send "Got it: <text>".
- **Done when:** you send "hello" from your phone and receive the echo.

### Step 1.5 - Store the inbound event (deduplication)
- **Build:** Table `inbound_events` (see Phase 2 SQL, create it now if easier). Insert with unique `wa_message_id`. On conflict, skip processing.
- **Done when:** sending the same webhook payload twice produces one row and one reply.

---

## Phase 2: Database, Tenancy and Core Model (Days 4–6)

### Step 2.1 - Supabase project
- **Build (manual):** create a free Supabase project. Save `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only).
- **Build:** connect the backend using the service role key on the server only.
- **Done when:** a test insert into `tenants` works.

### Step 2.2 - Migrations
- **Build:** Use Supabase CLI migrations in `supabase/migrations/`. One file per logical group.
- **Build:** Core SQL (abridged; Antigravity expands it):

````sql
-- 0001_core.sql
create table tenants (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  plan text not null default 'starter',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table whatsapp_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  waba_id text not null,
  phone_number_id text not null unique,
  token_ciphertext text not null,        -- encrypted at app layer
  status text not null default 'active'
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  wa_id text not null,                   -- customer's WhatsApp number
  name text,
  consent_marketing boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, wa_id)
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  customer_id uuid not null references customers(id),
  mode text not null default 'ai' check (mode in ('ai','human')),
  status text not null default 'open',
  last_customer_message_at timestamptz,
  unique (tenant_id, customer_id)
);

create table inbound_events (
  id uuid primary key default gen_random_uuid(),
  wa_message_id text not null unique,    -- deduplication key
  phone_number_id text not null,
  payload jsonb not null,
  status text not null default 'queued' check (status in ('queued','processing','done','failed','dead')),
  attempts int not null default 0,
  lease_until timestamptz,
  received_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  conversation_id uuid not null references conversations(id),
  direction text not null check (direction in ('in','out')),
  type text not null,                    -- text, audio, image, interactive, template
  content text,
  media_ref text,
  wa_message_id text unique,
  sent_by text not null default 'ai' check (sent_by in ('ai','merchant','customer','system')),
  created_at timestamptz not null default now()
);

-- Money in paise (integer). Never float.
create table products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  sku text not null,
  name text not null,
  description text,
  category text,
  attributes jsonb not null default '{}',
  active boolean not null default true,
  meta_catalog_item_id text,
  unique (tenant_id, sku)
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  product_id uuid not null references products(id),
  variant_sku text not null,
  label text not null,                   -- e.g. "500 g pack"
  price_paise integer not null check (price_paise >= 0),
  tax_bps integer not null default 0,    -- basis points, e.g. 500 = 5%
  unique (tenant_id, variant_sku)
);

create table inventory (
  variant_id uuid primary key references product_variants(id),
  tenant_id uuid not null references tenants(id),
  on_hand integer not null default 0 check (on_hand >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  updated_at timestamptz not null default now(),
  check (reserved <= on_hand)
);

create table carts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  conversation_id uuid not null references conversations(id),
  status text not null default 'open' check (status in ('open','awaiting_confirmation','converted','abandoned')),
  updated_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  cart_id uuid not null references carts(id),
  variant_id uuid not null references product_variants(id),
  qty integer not null check (qty > 0),
  unit_price_paise integer not null,     -- snapshot at add time
  unique (cart_id, variant_id)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  customer_id uuid not null references customers(id),
  status text not null default 'draft',
  subtotal_paise integer not null,
  tax_paise integer not null,
  total_paise integer not null,
  delivery_address jsonb,
  payment_method text,                   -- prepaid_link | cod
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  order_id uuid not null references orders(id),
  variant_id uuid not null references product_variants(id),
  qty integer not null,
  unit_price_paise integer not null
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  order_id uuid not null references orders(id),
  provider text not null,
  provider_payment_id text unique,
  amount_paise integer not null,
  status text not null default 'created' check (status in ('created','pending','paid','failed','expired')),
  verified_at timestamptz
);

create table payment_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique, -- deduplication
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  conversation_id uuid references conversations(id),
  customer_id uuid references customers(id),
  type text not null,
  payload jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);

create table agent_actions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  conversation_id uuid references conversations(id),
  agent text not null,
  tool text,
  input jsonb,
  output jsonb,
  created_at timestamptz not null default now()
);
-- Also create: wishlists, escalations, risk_assessments, consents, templates (same pattern).
````

- **Done when:** `supabase db reset` runs cleanly and all tables exist.

### Step 2.3 - Row-Level Security
- **Build:** enable RLS on every table with `tenant_id`. Policy pattern:

````sql
alter table products enable row level security;
create policy tenant_isolation on products
  using (tenant_id = current_setting('app.tenant_id', true)::uuid);
````

- **Build:** the backend, at the start of each transaction, runs `set local app.tenant_id = '<uuid>'`. Service-role clients must still set it.
- **Done when:** a test script creates two tenants and proves that a query under tenant A cannot see tenant B's rows (see Validation T-ISO-01).

### Step 2.4 - Money helpers
- **Build:** `lib/money.ts` with functions: `addPaise`, `multiplyPaise(unit, qty)`, `taxPaise(amount, bps)` (rounding: round half up, documented). Unit tests for every function.
- **Done when:** tests pass including rounding edge cases (e.g., ₹0.01 tax).

### Step 2.5 - Encryption helper
- **Build:** `lib/crypto.ts` with AES-256-GCM encrypt/decrypt. Key from `APP_ENCRYPTION_KEY` env var (32 bytes base64).
- **Done when:** round-trip test passes and ciphertext is never equal to plaintext.

---

## Phase 3: Catalog and Merchant Onboarding (Days 7–9)

### Step 3.1 - Catalog CSV/Excel import
- **Build:** endpoint `POST /merchant/catalog/import` accepts CSV or XLSX.
- **Build:** Required columns: `sku, name, category, variant_sku, variant_label, price_rupees, tax_percent, on_hand`. Optional: `description`, `brand`, `attributes_json`.
- **Build:** Parse, validate row by row, convert `price_rupees` to paise (multiply by 100 using decimal-safe logic, not float math), upsert products, variants, inventory.
- **Build:** Return a report: `{ inserted, updated, rejected: [{ row, reason }] }`.
- **Done when:** a 500-row sample file imports in under 10 seconds and bad rows are reported, not silently skipped.

### Step 3.2 - Search
- **Build:** `search_products(tenant_id, query)`: Postgres full-text search (`to_tsvector`) plus trigram similarity (`pg_trgm`) for misspellings ("amul mlik" → "Amul Milk").
- **Done when:** validation set in `evals/catalog_search.jsonl` reaches the target in `04-VALIDATION.md`.

### Step 3.3 - Semantic search (for "something to clean my sofa")
- **Build:** generate embeddings for product name + description + category using the free embedding model listed in `02-TECH-STACK.md`. Store in `products.embedding vector(768)` with `pgvector` (enabled in Supabase).
- **Build:** `vector_search` tool returns top-k with cosine similarity.
- **Done when:** the semantic eval set reaches the target.

### Step 3.4 - Merchant auth
- **Build:** Supabase Auth email/password login for the dashboard. Merchant user row links `auth.users.id` to `tenant_id` in `merchant_users`.
- **Done when:** a logged-in merchant sees only their tenant's products.

---

## Phase 4: The Text Shopping Agent (Days 10–14)

### Step 4.1 - LLM client wrapper
- **Build:** `agents/llmClient.ts` wraps the chosen free LLM (Gemini via Google AI Studio by default). Functions: `generateStructured(schema, prompt)` returning validated JSON; `callWithTools(messages, tools)`.
- **Build:** timeout 15 s, max 2 retries, logs token counts (cost control).
- **Done when:** a mock-free call returns valid JSON for a sample prompt.

### Step 4.2 - Tool layer
- **Build:** `tools/registry.ts`: each tool is an object `{ name, description, inputSchema (Zod), outputSchema (Zod), handler }`. Only tools in this registry can run.
- **Build:** `tools/execute.ts`: validates input, injects `tenant_id` from the server context (never from the model), runs handler, validates output, writes to `agent_actions`.
- **Done when:** a test shows that the model-supplied `tenant_id` is ignored and replaced.

### Step 4.3 - Orchestrator loop
- **Build:** `orchestrator/run.ts`:

````ts
// Pseudo-flow. Implement with tests.
async function handleInbound(event: InboundEvent) {
  const ctx = await loadContext(event);           // tenant, customer, conversation, cart, last 10 msgs
  if (ctx.conversation.mode === "human") return;  // escalation rule
  const understanding = await shoppingAgent(ctx, event.text ?? event.transcript);
  assertValidAgentOutput(understanding);          // Section 5.1 contract
  for (const call of understanding.tool_calls) {
    if (!isRegisteredTool(call.name)) throw new GuardrailError("unknown tool");
    await executeTool(call, ctx);                 // tenant injected here
  }
  const reply = await composeReply(ctx, understanding);  // uses tool results, not model memory for prices
  await sendToWhatsApp(reply, ctx);
  await logEvents(ctx, understanding);
}
````

- **Done when:** unit tests cover: human mode skip, unknown tool rejection, invalid output rejection, tenant injection.

### Step 4.4 - Shopping Agent prompt
- **Build:** `agents/prompts/shopping.md`. Must include:
  - Role: "You help customers buy from this shop. You never state a price or stock level unless a tool returned it."
  - Output: JSON matching the contract in Architecture 5.1.
  - Language: reply in the customer's language or code-switched style (Hindi-English is common). Short sentences.
  - Ask at most one question at a time.
  - If unsure, set `needs_human: true` after two attempts.
- **Done when:** the prompt passes the text eval set in `04-VALIDATION.md` (AI-01 to AI-05).

### Step 4.5 - Composer
- **Build:** `channel/composer.ts` builds WhatsApp message types:
  - Plain text (max ~700 characters per message; split longer).
  - Reply buttons (max 3 buttons, labels ≤ 20 characters).
  - List message (max 10 rows).
  - Product message (single product card) and multi-product message, using the Meta catalog ID when available.
- **Done when:** each type sends successfully to the test number.

### Step 4.6 - Cart tools
- **Build:** `services/cart.ts`: `add_to_cart`, `update_cart_item`, `remove_from_cart`. Each recalculates totals in code and snapshots `unit_price_paise`.
- **Build:** Cart summary composer: lines, subtotal, tax, total, all in ₹ format from paise.
- **Done when:** adding the same variant twice increases qty instead of duplicating a row.

---

## Phase 5: Audio-to-Order (Days 15–18)

### Step 5.1 - Media download
- **Build:** `media/download.ts`:
  1. `GET https://graph.facebook.com/{version}/{media_id}` with Bearer token returns a temporary `url`.
  2. `GET {url}` with the same Bearer token downloads bytes.
  3. Store in object storage with key `tenant/{tenant_id}/{yyyy}/{mm}/{media_id}`.
  4. Record `media_ref` on the message.
- **Done when:** a voice note you send is saved and playable.

### Step 5.2 - Audio conversion
- **Build:** use `ffmpeg` (free) to convert OGG/Opus to WAV or MP3 if the chosen STT service needs it.
- **Done when:** converted file plays correctly.

### Step 5.3 - Transcription
- **Build:** `media/transcribe.ts` calling the free STT provider from `02-TECH-STACK.md`. Request language hint `hi` and `en` if supported; store transcript, language, and confidence.
- **Build:** if the provider returns no confidence, default to a neutral value and rely on the agent's clarifying questions.
- **Done when:** the audio eval set (AUD-01 to AUD-10 in `04-VALIDATION.md`) reaches its targets.

### Step 5.4 - Entity extraction
- **Build:** the Shopping Agent receives the transcript and returns entities with quantity and unit. Use the same flow as 4.3.
- **Build:** for numbers spoken in words ("do packet", "ek kilo"), include examples in the prompt and in `evals/`.
- **Done when:** extraction accuracy target (Validation AI-07) is met.

### Step 5.5 - Corrections
- **Build:** the agent handles "make that three" by finding the most recent cart item in context and calling `update_cart_item`. If ambiguous, ask which item.
- **Done when:** correction scenarios in `04-VALIDATION.md` pass.

---

## Phase 6: Photo-to-Order (Days 19–22)

### Step 6.1 - Image download
- Reuse 5.1. Accept JPEG and PNG. Reject other types with a friendly message.

### Step 6.2 - Shopping list OCR
- **Build:** `media/extractList.ts` sends the image to the free vision model with a strict JSON prompt: list of `{ text, quantity, unit, confidence }`.
- **Build:** any line with confidence < 0.7 becomes a clarifying question. Never silently guess handwriting.
- **Done when:** handwritten list eval set reaches target (Validation AI-10).

### Step 6.3 - Unknown product identification
- **Build:** vision call returns `{ likely_category, attributes, confidence, candidate_search_terms }`.
- **Build:** run `vector_search` and `search_products` with those terms. Show up to 3 product cards. Always ask "Is this one?"
- **Done when:** photo eval set passes and no product is added without a customer tap.

---

## Phase 7: Order Confirmation and Checkout (Days 23–25)

### Step 7.1 - Confirmation token
- **Build:** when the cart is shown, create a `confirmation_token` (random 128-bit, stored hashed, expires in 10 min) bound to `cart_id` and cart version.
- **Build:** "Confirm order" button carries the token. Backend verifies token, cart version, and that cart items still match.
- **Done when:** a changed cart invalidates an old token (test V-ORD-03).

### Step 7.2 - Address and slot collection
- **Build:** if the address is missing, send a WhatsApp Flow (structured form) for address. Use AI free-text only when the Flow is unavailable.
- **Build:** store `delivery_address` as JSON.
- **Done when:** address collection works end to end on the test number.

### Step 7.3 - Create order (transactional)
- **Build:** `services/orders.ts` `createOrder`:
  - One DB transaction.
  - `SELECT ... FOR UPDATE` on inventory rows for cart variants.
  - Verify `on_hand - reserved >= qty`.
  - Increase `reserved`. Insert order and items with price snapshot.
  - Set cart to `converted`.
  - Commit.
- **Done when:** concurrency test (V-STK-01) shows no oversell with 20 parallel buyers for 5 units.

### Step 7.4 - Reservation expiry job
- **Build:** a job (n8n schedule every 5 minutes calling an internal endpoint, or a simple worker loop at MVP) releases reservations whose order is still `pending_payment` after 15 minutes.
- **Done when:** expired reservations are released and the customer is informed.

---

## Phase 8: Payments (Days 26–29)

### Step 8.1 - Provider setup
- **Build (manual):** create a Razorpay account, enable test mode, create a webhook with a secret. Save `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.

### Step 8.2 - Payment link creation
- **Build:** `services/payments.ts` `createPaymentLink(order)` calls the provider Payment Links API with amount in paise, a reference ID equal to our `order_id`, and an expiry matching the reservation TTL.
- **Build:** store `payments` row with `status = created`. Send link via WhatsApp.
- **Done when:** a test payment link opens and the amount is correct.

### Step 8.3 - Webhook handler
- **Build:** `POST /webhooks/payments`:
  1. Read raw body. Verify `X-Razorpay-Signature` (HMAC-SHA256 of raw body with webhook secret). Reject if invalid.
  2. Insert into `payment_events` with unique provider event ID. Duplicate → return 200 and stop.
  3. If event is "payment captured/paid": in one transaction, set payment `paid`, order `paid`, convert reservation to sold, set `verified_at`.
  4. Send the confirmation message.
- **Done when:** replaying the same webhook twice changes nothing the second time (V-PAY-02).

### Step 8.4 - Failure and expiry handling
- **Build:** handle "failed" and "link expired" events. Release reservation. Message customer with a retry option.
- **Done when:** scenarios V-PAY-03 and V-PAY-04 pass.

### Step 8.5 - Cash on delivery (optional MVP)
- **Build:** COD option only if the merchant enables it. Route order through Risk Agent (Phase 11) before dispatch confirmation.
- **Done when:** COD order is created with `payment_method = cod` and status `pending_dispatch_confirmation`.

---

## Phase 9: Merchant Dashboard (Days 30–34)

### Step 9.1 - Dashboard shell
- **Build:** `apps/dashboard` with Vite + React + TypeScript + Tailwind. Pages: Login, Overview, Conversations, Products, Customers, Orders, Settings.
- **Done when:** navigation works and unauthenticated users are redirected to Login.

### Step 9.2 - Overview
- **Build:** cards: today's revenue (sum of `paid` orders), total orders, conversion rate (converted carts ÷ opened carts), abandoned carts count. All computed in SQL views.
- **Done when:** numbers match a manual check against seed data.

### Step 9.3 - Conversations and takeover
- **Build:** list of conversations with status and mode badge. Open chat view with full history.
- **Build:** "Take over" sets `mode = human` and records who. Merchant reply calls the WhatsApp send helper with `sent_by = merchant`.
- **Build:** "Hand back to AI" sets `mode = ai`.
- **Done when:** while in human mode, a customer message does not trigger an AI reply (V-ESC-01).

### Step 9.4 - Realtime updates
- **Build:** Supabase Realtime subscription on `messages` and `orders` for the tenant.
- **Done when:** a new message appears in the dashboard within 3 seconds without refresh.

### Step 9.5 - Products and inventory
- **Build:** table with search, low-stock filter (on_hand − reserved < threshold), edit price and stock.
- **Done when:** a stock edit reflects in the next customer conversation.

### Step 9.6 - Settings
- **Build:** business info, working hours, delivery charges, return policy text, AI tone, escalation rules, automation toggles.
- **Done when:** changing a delivery charge updates cart totals for new carts.

---

## Phase 10: Intelligent Commerce (Phase 2 Features) (Days 35–45)

### Step 10.1 - My Usual
- **Build:** SQL view or job computing top items per customer by order frequency over the last 180 days.
- **Build:** Customer Agent tool `get_usual_items`. Intent "send my usual" builds a cart draft and asks for confirmation.
- **Done when:** the eval set for usual-order intent passes and no item is added without confirmation.

### Step 10.2 - My Wishlist
- **Build:** `wishlist_add`, `wishlist_list`. Show items as product messages. "Is it still available?" calls `check_stock`.
- **Done when:** wishlist scenarios in Validation pass.

### Step 10.3 - Alternatives
- **Build:** `find_alternatives` ranks by: same category, similar price (within ±20%), same size/quantity attribute, previously bought brand. Returns max 3 with reason text.
- **Done when:** out-of-stock scenario gives 1 to 3 alternatives and the reason is shown.

### Step 10.4 - Abandonment recovery
- **Build:** event logging at every step listed in Architecture 4 and the events table.
- **Build:** Recovery Agent classifies probable reason from last events plus last messages. Output: `{ probable_reason, confidence, suggested_intervention }`.
- **Build:** n8n workflow (Section 11 of Architecture) waits T hours, checks:
  - consent_marketing = true,
  - no opt-out,
  - whether the 24-hour window is open,
  - if closed, use approved template.
- **Done when:** follow-up scheduling respects all four checks (V-REC-01 to V-REC-04).

### Step 10.5 - Escalation and human handover
- **Build:** escalation triggers from the PRD (human request, low confidence twice, complaint, refund, payment confirmation failure, inventory inconsistency, high-risk order).
- **Build:** `create_escalation` writes a summary, cart, last messages, and a suggested reply. n8n sends merchant alert.
- **Done when:** each trigger produces one escalation and the AI goes silent.

### Step 10.6 - Order tracking
- **Build:** `POST /internal/orders/:id/status` (called by merchant dashboard or logistics webhook). Changing to `dispatched` triggers the tracking template via n8n.
- **Done when:** a status change sends the correct template.

---

## Phase 11: RTO Shield (Days 46–50)

### Step 11.1 - Risk signals
- **Build:** compute from permitted data only: COD cancellations count, address completeness, number of orders in last 7 days, first-order flag, address mismatch with prior successful deliveries. Document each factor's weight in `config/risk.json`.

### Step 11.2 - Score and action
- **Build:** score 0–100. Bands: Low (<40), Medium (40–69), High (≥70).
- **Build:** actions: Low → proceed; Medium → ask customer to confirm address; High → merchant manual verification. Never auto-reject.
- **Build:** label as "Illustrative heuristic" in the dashboard until validated.
- **Done when:** V-RISK-01 to V-RISK-03 pass.

### Step 11.3 - Fairness review
- **Build:** monthly report comparing band distribution by area (pincode) to catch unfair proxies. Dashboard shows the report to the merchant.

---

## Phase 12: n8n Automation (Days 51–54)

### Step 12.1 - Self-host n8n
- **Build:** add `n8n` service to docker-compose (free, self-hosted). Protect with basic auth.
- **Done when:** n8n UI opens locally.

### Step 12.2 - Workflows
- **Build:** export workflows to `apps/workflows/*.json`:
  1. `order-created-notify`
  2. `escalation-alert`
  3. `cart-abandon-followup`
  4. `dispatch-update`
  5. `reorder-suggestion`
  6. `daily-merchant-summary`
  7. `reservation-expiry` (every 5 minutes)
- **Build:** every workflow calls the backend using `X-Internal-Token` and an `Idempotency-Key` header.
- **Done when:** each workflow runs once successfully in staging and a repeat run does not duplicate messages.

---

## Phase 13: Hardening and Pilot (Days 55–60)

- Complete every item in `04-VALIDATION.md` Section 9 (release gate).
- Load test with 50 concurrent conversations.
- Pilot with 2–3 friendly merchants on the test account. Collect metrics from PRD Section 19.
- Write a short runbook: how to restart workers, check dead-letter events, rotate keys.

---

## 9. Skills (Instructions for Antigravity and the Team)

### 9.1 What a skill is
A skill is a short Markdown file that tells the coding agent how to do one kind of job in this project. Antigravity should read the relevant skill before writing code for that area. Keep each file under about 150 lines so it stays cheap to load.

### 9.2 `AGENTS.md` template (repo root)

````markdown
# AGENTS.md - Rules for any AI coding agent in this repo

## Project
WhatsApp conversational commerce platform. Read docs/01-ARCHITECTURE.md first.

## Non-negotiable rules
1. The LLM never sets prices, stock, totals, or payment status.
2. Every DB table has tenant_id. Never query without tenant scope.
3. Payment becomes paid only from a verified webhook.
4. Money is integer paise. No floats.
5. Agents may only call tools registered in apps/api/src/tools/registry.ts.
6. Never log full phone numbers, addresses, or tokens.
7. Every new feature needs tests. Run pnpm test before finishing.
8. Ask before adding a new paid service or dependency.

## How to work
- Follow docs/03-IMPLEMENTATION.md step by step.
- Read the matching skill in /skills before coding that area.
- Keep changes small. One step per commit.
- When done, list what changed and which validation checks (docs/04-VALIDATION.md) you ran.
````

### 9.3 Skill files to create

| File | When Antigravity must read it |
|---|---|
| `skills/whatsapp-webhooks.md` | Any webhook, signature, or send-message code |
| `skills/agent-tools.md` | Any agent prompt, tool, or orchestrator change |
| `skills/money-and-stock.md` | Cart, order, price, inventory, reservation code |
| `skills/payments.md` | Payment links, payment webhooks, status changes |
| `skills/tenancy-and-security.md` | Any DB query, RLS, secrets, logs |
| `skills/media-understanding.md` | Audio, image, OCR, transcription code |
| `skills/testing.md` | Writing tests or running evals |
| `skills/whatsapp-policy.md` | Any outbound message, template, consent, follow-up |

### 9.4 Example skill: `skills/money-and-stock.md`

````markdown
# Skill: Money and Stock

## Use when
Editing cart, order, price, tax, inventory, or reservation code.

## Rules
- Store money as integer paise. Convert to rupees only for display.
- Prices come from product_variants at the time of add-to-cart. Snapshot them.
- Stock check and reservation happen in the same DB transaction as order creation.
- Use SELECT ... FOR UPDATE on inventory rows before changing reserved.
- Reservations expire after 15 minutes if unpaid.
- Never let reserved exceed on_hand (DB check constraint exists; respect it).

## Checklist before finishing
- [ ] Unit tests for rounding and totals
- [ ] Concurrency test exists for stock changes
- [ ] No float math on money
- [ ] Price shown to customer comes from a tool result
````

### 9.5 Token-efficiency tips for using skills
- Ask Antigravity to load only the skills matching the current task (the table in 9.3 tells it which).
- Keep prompts in `agents/prompts/*.md` short. Put long rules in skills and reference them.
- Reuse the Architecture doc by section number ("see Architecture 4.5") instead of pasting it again.
- Start each new chat with: "Context: docs/03, Phase X, Step Y. Skills: [list]."

---

## Phase 14: Lead Mode Foundation (Days 61–64)

**Goal:** a tenant can turn on Lead mode, choose a vertical, and see a pipeline. No automation yet.

### Step 14.1 - Tenant mode switch
- **Build:** add `modes` to the tenant settings: `commerce`, `lead`, or both. Dashboard toggle.
- **Build:** the webhook router reads the mode and passes the event to the right orchestrator path. Commerce path is unchanged.
- **Done when:** a tenant with Lead mode off never reaches lead code (test V-MODE-01).

### Step 14.2 - Lead tables and migrations
- **Build:** migration `0010_leads.sql` creating `leads`, `lead_answers`, `lead_sources`, `pipelines`, `vertical_configs`, `usage_events`. Use the same RLS pattern as Phase 2.3.

```sql
-- 0010_leads.sql (abridged; Antigravity expands it)
create table leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  customer_id uuid not null references customers(id),
  stage text not null default 'new'
    check (stage in ('new','contacted','qualifying','qualified',
                     'appointment_booked','visited','won','nurture','lost')),
  score integer not null default 0 check (score between 0 and 100),
  score_label text not null default 'probable',
  lost_reason text,
  source text,
  updated_at timestamptz not null default now(),
  unique (tenant_id, customer_id)
);

create table usage_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  type text not null,
  quantity integer not null default 1,
  billing_period text not null,           -- e.g. '2026-11'
  occurred_at timestamptz not null default now()
);
-- No UPDATE or DELETE policies on usage_events. Corrections are new rows.
-- Also create: lead_answers, lead_sources, pipelines, vertical_configs (same pattern).
```

- **Done when:** `supabase db reset` runs and the usage table rejects update and delete (test V-MODE-02).

### Step 14.3 - Vertical configuration as data
- **Build:** `config/verticals/*.json`, one file per vertical (start with `real-estate.json`). Each file lists: qualification questions in order, required fields, score weights, qualification threshold, forbidden claims, and escalation keywords.
- **Build:** a loader validates each file with Zod at startup. An invalid file stops the server with a clear error.
- **Done when:** adding a second vertical file requires no code change (test V-VERT-01).

Example (abridged):

```json
{
  "vertical": "real-estate",
  "questions": [
    { "field": "need", "ask": "Are you looking to buy, rent, or invest?", "required": true },
    { "field": "location", "ask": "Which area are you interested in?", "required": true },
    { "field": "budget", "ask": "What is your approximate budget range?", "required": true },
    { "field": "timeline", "ask": "When would you like to move?", "required": false },
    { "field": "decision_maker", "ask": "Will you be deciding alone or with family?", "required": false }
  ],
  "score_weights": { "need": 20, "location": 15, "budget": 25, "timeline": 20, "decision_maker": 20 },
  "qualified_threshold": 60,
  "forbidden_claims": ["guaranteed returns", "price growth", "lowest price"],
  "escalate_keywords": ["site visit today", "talk to agent", "complaint"]
}
```

### Step 14.4 - Pipeline dashboard (read-only)
- **Build:** Pipeline page with columns for each stage, a card per lead (name, score with "probable" label, last contact, next follow-up).
- **Done when:** seeded leads show in the correct columns (test D-PIPE-01).

---

## Phase 15: Lead Qualification (Days 65–69)

**Goal:** new leads get an instant reply and are qualified one question at a time.

### Step 15.1 - Lead creation from first contact
- **Build:** when a message arrives from a customer with no lead record and Lead mode is on, create the lead at stage `new`, record `source` (from the ad or link referral data if present, else `direct`), and log `lead_created`.
- **Build:** if the message contains a referral object (ad click), store the campaign ID in `lead_sources`.
- **Done when:** a first message creates one lead, and a second message does not duplicate it.

### Step 15.2 - Instant first response
- **Build:** the Lead Qualifier sends a greeting with the business name and the first question from the vertical config. Target: reply within 10 seconds of the webhook.
- **Done when:** latency test L-LAT-01 passes.

### Step 15.3 - Answer extraction and next question
- **Build:** the Lead Qualifier receives the customer's reply and returns `{ field, value, confidence }` for each answer found. Save only answers with confidence at or above 0.7. Otherwise ask again, one time, in simpler words.
- **Build:** after each answer, compute the score from the config weights and ask the next unanswered question. Never ask more than one question per message.
- **Done when:** the qualification eval set reaches its targets (Validation L-EVAL-01 to L-EVAL-03).

### Step 15.4 - Stage transitions
- **Build:** `set_lead_stage` checks the allowed transitions in Architecture 15.5. Rejects anything else.
- **Build:** move to `qualified` only when required fields are present and the score meets the threshold.
- **Done when:** invalid transitions are rejected in tests (V-STG-01).

### Step 15.5 - Handover rules
- **Build:** escalate when: customer asks for a person; a configured escalation keyword appears; a forbidden-claim question is asked (for example, insurance product advice); confidence is low twice.
- **Build:** the escalation summary includes answers collected, score, stage, and the exact question the customer asked.
- **Done when:** each rule produces one escalation and the AI goes silent (V-ESC-L01 to V-ESC-L04).

---

## Phase 16: Follow-ups and Appointments (Days 70–75)

**Goal:** leads who go quiet are followed up safely, and qualified leads can book a visit or call.

### Step 16.1 - Follow-up sequence engine
- **Build:** `services/followups.ts`. Each sequence step is a row in `followup_jobs` with a unique `idempotency_key` (`lead_id + step`).
- **Build:** on each scheduled run, the backend re-checks every stop condition in Architecture 15.6 before sending. The n8n trigger only calls the backend; it never decides to send.
- **Done when:** duplicate scheduler runs send one message (V-FU-06), and each stop condition blocks the send (V-FU-01 to V-FU-05).

### Step 16.2 - Window-aware sending
- **Build:** before each follow-up, check the last customer message time. Inside the window, send free text. Outside it, send the approved template for that step. Templates must be registered in the `templates` table with Meta approval status.
- **Done when:** V-FU-03 and V-FU-04 pass.

### Step 16.3 - Google Calendar connection
- **Build (manual, by merchant):** OAuth connect from the Settings page. Store refresh token encrypted (`calendar_connections`).
- **Build:** `calendar/googleAdapter.ts` with `freeBusy(range)` and `createEvent(...)`. Use the free-busy call to compute availability; do not read full event details.
- **Done when:** a test event appears in the connected calendar.

### Step 16.4 - Slot offer and booking
- **Build:** `services/appointments.ts`:
  - `getAvailability` builds slots from `availability_rules` minus busy time, with a 15-minute buffer and a 10-minute slot hold.
  - `bookAppointment` re-checks the slot inside a transaction, creates the calendar event, and writes `appointments`. If the re-check fails, offer the next slot.
- **Build:** composer sends up to 3 slots as reply buttons (labels under 20 characters) or a list message.
- **Done when:** concurrency test L-APT-01 passes (two leads, one slot, one booking).

### Step 16.5 - Reminders and reschedule
- **Build:** schedule reminders at 24 hours and 1 hour before the appointment, using the window rule from 16.2.
- **Build:** reschedule and cancel intents go to the Appointment Agent and create new rows, never edit history.
- **Done when:** V-APT-03 and V-APT-04 pass.

---

## Phase 17: Usage Metering, CRM Sync, and Pilot Readiness (Days 76–82)

### Step 17.1 - Usage meter
- **Build:** `lib/usage.ts` with `recordUsage(tenantId, type, qty)`. Call it from the webhook path (conversation opened), the AI call wrapper, the template sender, and a daily job that counts active seats.
- **Build:** monthly rollup query per tenant; dashboard "Usage" card shows included allowance vs used.
- **Done when:** a seeded month produces the expected totals (V-USE-01), and an update attempt on `usage_events` fails (V-MODE-02).

### Step 17.2 - Seats and roles
- **Build:** roles `owner`, `sales_agent`, `viewer`. Seats are counted from active `sales_agent` users. Sales agents can take over and reply; viewers cannot.
- **Done when:** a viewer cannot send a reply (V-ROLE-01).

### Step 17.3 - HubSpot or Zoho push (one-way)
- **Build:** `crm/hubspotAdapter.ts` (or Zoho). Push on `lead_created`, `stage_changed`, and `appointment_booked` events. Log each attempt in `crm_sync_log`.
- **Build:** retries with backoff; after 5 failures, mark as `dead` and alert.
- **Done when:** a stage change appears in the CRM test account (V-CRM-01) and a repeated event does not create a duplicate contact (V-CRM-02).

### Step 17.4 - Pilot lead dataset
- **Build:** seed 50 synthetic leads across the chosen vertical with realistic messages (including Hindi-English and misspellings) and save to `evals/leads.jsonl`.
- **Done when:** the lead eval targets in Validation Section 4A are measured on the saved baseline.

---

## Skill file to add (Section 9.3 table)

| File | When Antigravity must read it |
|---|---|
| `skills/lead-qualification.md` | Any lead stage, qualification question, score, or vertical config change |

Keep this skill short: the rule that the AI asks one question at a time; the rule that a stage changes only through `set_lead_stage`; the list of forbidden claims from the active vertical config; the rule that scores are always labelled "probable."