# 02 - TECH STACK
## Free-first technology choices and why we chose them

> Principle: **start at ₹0**, use open-source where possible, and choose tools that can be replaced later without rewriting the whole product. Free tiers change often. Re-check limits before each phase.

---

## 1. Summary Table (Recommended Choice)

| Layer | Chosen (free) | Why this one | Free alternatives |
|---|---|---|---|
| Customer channel | **WhatsApp Cloud API (Meta)** | Official, free test number, required for multi-business SaaS | None suitable (WhatsApp Web automation is not allowed for a product) |
| Backend language | **TypeScript on Node.js** | One language for backend and dashboard; large community; easy for beginners with AI help | Python + FastAPI (also good, strong AI libraries) |
| Backend framework | **Fastify** | Fast, simple, good validation plugins | Express (more tutorials), NestJS (more structure, more to learn) |
| Validation | **Zod** | Same schemas for API, tools, and AI outputs | Joi, Valibot |
| Database | **PostgreSQL via Supabase (free tier)** | Relational data, transactions, RLS for tenancy, Realtime, Auth, Storage in one place | Neon (free Postgres), Render Postgres (free for limited time), local Postgres via Docker |
| Vector search | **pgvector (inside Postgres)** | No extra service; works in Supabase | Qdrant Cloud free tier, Chroma (local) |
| Cache / queue | **Postgres table queue at MVP** | Zero extra service | Upstash Redis free tier + BullMQ, or Redis via Docker |
| File storage | **Supabase Storage (free)** | Built in; signed URLs; retention rules | Cloudflare R2 (free tier with generous storage), local disk in dev |
| Auth (merchants) | **Supabase Auth** | Comes with DB; RLS integration | Clerk free tier, Auth.js (open source) |
| LLM (reasoning, extraction, agents) | **Google Gemini API via Google AI Studio (free tier)** | Strong multilingual (Hindi, Marathi and code-switching), multimodal (text, image, and audio in one API), generous free quota | Groq free tier (open models, very fast), OpenRouter free models, Ollama (local, fully free but needs a good PC) |
| Speech-to-text | **Gemini audio input** (first choice) or **Groq Whisper** | Gemini can read audio directly, which means fewer services; Whisper is strong for Hindi | faster-whisper (open source, runs locally, free), Deepgram free credit |
| OCR / vision | **Gemini vision** | Handles handwriting better than classic OCR and returns structured JSON | Tesseract OCR (open source, printed text only, weaker on handwriting), PaddleOCR (open source) |
| Embeddings | **Gemini embedding model (free tier)** or **open-source sentence-transformers** | Same provider keeps setup simple | `all-MiniLM-L6-v2` via sentence-transformers (fully local, free) |
| Agent orchestration | **Plain TypeScript orchestrator + tool calling** at MVP; **LangGraph.js** later | Easier to understand and debug for a new team; LangGraph adds structure when flows grow | LangChain.js, Vercel AI SDK (free, open source) |
| Automation | **n8n self-hosted (free Community Edition)** | Visual workflows, retries, schedules; free to self-host | Temporal (advanced, heavy), Inngest free tier, cron jobs |
| Merchant dashboard | **React + Vite + TypeScript + Tailwind CSS + shadcn/ui** | Fast, modern, free components; AI tools generate this code well | Next.js (adds server rendering), Refine admin framework (open source) |
| Realtime | **Supabase Realtime** | Included with Supabase | Polling every few seconds (simplest fallback) |
| Payments | **Razorpay test mode (free) with Payment Links and webhooks** | Supports UPI and cards; test mode costs nothing; strong docs | Cashfree (free test mode), PhonePe PG (check eligibility), Instamojo |
| Backend hosting (MVP) | **Render free web service** or **Koyeb free instance** | Free, deploys from GitHub; fine for demos and pilot | Google Cloud Run free tier (scales to zero), Oracle Cloud Always Free VM (more setup, always-on), Fly.io (limited free allowances) |
| Dashboard hosting | **Vercel Hobby** or **Cloudflare Pages** | Free static hosting with HTTPS | Netlify free tier, GitHub Pages |
| Domain and HTTPS | **Cloudflare Tunnel (dev)**, real domain later (~₹800–1,000 per year) | Tunnel is free for local webhooks | ngrok free tier (URL changes, limited) |
| Logs | **Pino (JSON logs) + Better Stack free tier or Logtail** | Structured logs, easy search | Grafana Cloud free tier, Axiom free tier, Supabase logs |
| Error tracking | **Sentry free developer plan** | Catches crashes with stack traces | GlitchTip (open source, self-host) |
| Uptime monitoring | **UptimeRobot free** | Pings webhook and alerts | Better Stack uptime free, Healthchecks.io |
| Load testing | **k6 (open source)** | Free, scriptable in JavaScript | Artillery (open source), JMeter (open source, heavier) |
| Testing | **Vitest** (unit/integration), **Playwright** (E2E) | Fast, same language as the app | Jest, Cypress (free for open source; check license) |
| Repo and CI | **GitHub (free) + GitHub Actions (free minutes for public; check private limits)** | Standard, free for small teams | GitLab CI, Bitbucket Pipelines |
| Secret scanning | **Gitleaks (open source)** | Stops secrets from entering Git | GitHub secret scanning (on public repos) |
| Dependency audit | **pnpm audit + Dependabot (GitHub, free)** | Built in | Snyk free tier |
| Container runtime (local) | **Docker Desktop** or **Podman (free, open source)** | Runs Postgres, n8n locally | OrbStack (macOS), Rancher Desktop |
| AI coding assistant | **Google Antigravity** (your choice) | Works with the docs and skills in this repo | Claude Code, Cursor free tier, GitHub Copilot free tier |
| Developer tools | **VS Code (free)**, **Postman (free tier)** or **Bruno (open source)** | Editing and testing APIs | Insomnia, Thunder Client (VS Code extension) |

---

## 2. Why Each Major Choice (In Simple Words)

### 2.1 WhatsApp Cloud API
- **What it is:** Meta's official way for programs to send and receive WhatsApp messages.
- **Why:** It is the only safe way to build a commercial product on WhatsApp. It gives us a test phone number for free, webhooks for incoming messages, and multi-business onboarding (Tech Provider / Embedded Signup).
- **Avoid:** unofficial "WhatsApp Web" bots. They break, they can get numbers banned, and they cannot be sold to businesses.

### 2.2 TypeScript + Node.js + Fastify
- **Why one language:** the backend and the dashboard both use TypeScript, so types can be shared (`packages/shared`). Fewer mistakes for a new team.
- **Why Fastify:** fast, clear plugin system, built-in request validation, easy to test.
- **If the team knows Python well:** FastAPI is an excellent alternative. Only switch if the team is already more comfortable in Python; do not switch mid-project.

### 2.3 Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Why Postgres:** orders and payments need transactions and strict rules. Postgres is the most reliable free option for this.
- **Why Supabase:** one dashboard gives us the database, login, live updates for the merchant screen, file storage, and Row-Level Security (the tenant wall). That is four services in one free account.
- **Watch out:** the free project pauses after inactivity. Keep a scheduled ping during the pilot or upgrade when merchants go live.
- **Alternative:** Neon for a database only, if you want to avoid the Supabase bundle.

### 2.4 pgvector inside Postgres
- **Why:** semantic search ("something to clean my sofa") needs vectors. Keeping them in Postgres means one database to back up, and joins with price and stock are simple.
- **When to move:** only if the catalog grows to millions of items.

### 2.5 Google Gemini (LLM, speech, vision, embeddings)
- **Why:** one provider covers text reasoning, image understanding, and audio understanding. That reduces the number of services the team must learn.
- **Why good for India:** strong on Hindi and Indian English code-switching; can read handwritten text in images.
- **Free tier reality:** free quotas exist via Google AI Studio, but limits and model names change. Use a small set of model names in one config file so they are easy to switch.
- **Key guardrail:** the model returns JSON only. Our code validates it. The model is never trusted with prices.

### 2.6 Speech-to-text choice
- **First choice: Gemini audio input.** Fewer moving parts; the same key and SDK as the LLM.
- **Second choice: Groq Whisper.** Very fast and free within limits; strong multilingual performance. Use it if Gemini audio quality or quotas are not enough in your tests.
- **Offline / cost-zero option: faster-whisper** running on a laptop or a small GPU server. Good for development and for privacy-sensitive pilots. Slower and needs setup.
- **Decision rule:** run the audio eval set (Validation Section 4) on two options and pick the one with the better word error rate and speed.

### 2.7 OCR and vision
- **Gemini vision first:** handwriting is hard for classic OCR. Vision models return structured lines with confidence.
- **Tesseract** is free and reliable for printed text (for example, product labels). Use it as a fallback or for bulk printed scans, not handwriting.

### 2.8 Agent orchestration (plain code first, LangGraph later)
- **Why not a framework on day one:** new teams lose time learning abstractions. A small TypeScript orchestrator with clear steps is easier to test and debug.
- **When to add LangGraph.js:** when flows have many branches (for example, cart → address → payment → dispatch with retries). LangGraph provides a state graph and checkpoints.
- **Why not one giant agent:** smaller agents are cheaper per call, easier to test, and safer.

### 2.9 n8n
- **Why:** visual workflows for scheduled jobs and notifications. Non-engineers can see what runs and when.
- **Why not for live chat:** each extra step adds delay. Real-time work stays in the backend (Architecture Section 11).
- **Free option:** self-host with Docker. The Community Edition is free to self-host; check the current license if you plan to sell a hosted version.

### 2.10 React + Vite + Tailwind + shadcn/ui
- **Why Vite over Next.js:** the dashboard does not need server rendering. Vite is simpler and faster to start.
- **Why shadcn/ui:** you copy components into your repo instead of installing a heavy library. Easy for AI coding tools to edit.

### 2.11 Razorpay (test mode)
- **Why:** widely used in India; supports UPI, cards, and payment links; webhooks are well documented.
- **Free:** test mode has no transaction fee. Live mode charges fees; plan that cost into pricing (PRD Section 17).
- **Compliance:** merchant onboarding with the provider requires KYC. Start the paperwork early.
- **Alternatives:** Cashfree, PhonePe Payment Gateway (check eligibility), Instamojo for small merchants.

### 2.12 Hosting: Render or Koyeb for MVP
- **Why:** free to start, deploy from GitHub, HTTPS included.
- **Limit:** free instances may sleep when idle, which delays the first webhook reply. Meta retries webhooks, but slow replies hurt customers. For the pilot, upgrade the backend to a small paid instance (usually a few dollars per month) or use Oracle Cloud Always Free VM if you can handle setup.

### 2.13 Observability and quality tools
- **Pino** is fast and produces searchable JSON logs.
- **Sentry free** catches crashes early; invaluable for a team new to backend work.
- **UptimeRobot** tells you when the webhook is down; WhatsApp customers notice before you do otherwise.

---

## 3. Free-Tier Reality Check

| Service | Free tier (verify before use) | When you will pay |
|---|---|---|
| WhatsApp Cloud API | Test number free; service and utility conversations have free allowances under Meta's current pricing; marketing and authentication templates are charged | Real merchant volume and template marketing messages |
| Supabase | Free project with database size and bandwidth caps; projects pause when idle | Pilot with real merchants, or when you need backups and more storage |
| Gemini API | Free quota via Google AI Studio; rates and limits change | High usage or paid tier |
| Razorpay | Test mode free | Live transaction fees per payment |
| Render / Koyeb | Free instance with sleep behaviour | Always-on instance for production |
| Vercel / Cloudflare Pages | Hobby / free static hosting | Team features or high traffic |
| Sentry / Better Stack / UptimeRobot | Free developer tiers with event caps | Larger volumes |
| Domain | Not free | About ₹800–1,000 per year for `.in` or `.com` (check registrar) |
| n8n | Self-hosted free | Hosted plan if you do not want to run it |

**Budget for the MVP:** ₹0 for build and demo, plus a domain (optional). For a live pilot expect small monthly costs for hosting, WhatsApp conversations beyond the free allowance, and AI usage. The PRD's pricing plans should cover these.

---

## 4. Free Learning Path for a Team New to Agentic AI

| Topic | Free resource type | Why it matters |
|---|---|---|
| Node.js and TypeScript basics | Official docs, free YouTube tutorials | Needed for every backend step |
| REST APIs and webhooks | Meta developer docs (WhatsApp Cloud API getting started) | Core of our product |
| SQL and transactions | Supabase docs and free SQL tutorials | Money and stock depend on this |
| LLM basics: prompts, JSON output, tool calling | Google AI Studio quickstart; vendor cookbooks on GitHub | The agent layer depends on this |
| Evaluation of AI | Free course-style articles on LLM evals; our own `evals/` folder | Keeps AI quality measurable |
| Automation with n8n | n8n free docs and community workflows | For Phase 12 |
| Testing | Vitest docs; Playwright docs | Validation depends on this |

**Tip:** ask Antigravity to explain each new concept in plain English with a small example before writing code for it.

---

## 5. Decisions to Revisit Later

| Decision | Revisit when |
|---|---|
| Supabase for everything | Traffic or compliance needs a dedicated database host |
| Postgres queue | Event volume is high enough that Redis-based queues are simpler |
| Gemini as the only AI vendor | Cost, quality, or availability problems appear in pilots |
| Plain orchestrator | Agent flows become complex enough to need LangGraph.js |
| n8n self-hosted | Team wants managed workflows and has budget |
| Single region hosting | Merchants outside India need lower latency |

---

## 6. Minimum Setup Checklist (Day 0)

- [ ] GitHub account and private repo `wa-commerce`
- [ ] Meta developer account and a Business app with WhatsApp product
- [ ] Supabase account and project
- [ ] Google AI Studio API key (store as a secret, never in Git)
- [ ] Razorpay test account
- [ ] Render or Koyeb account
- [ ] Vercel or Cloudflare account for the dashboard
- [ ] Sentry and UptimeRobot accounts (free)
- [ ] Docker Desktop (or Podman) installed
- [ ] Node.js LTS, pnpm, ffmpeg installed
- [ ] Antigravity installed and pointed at the repo

