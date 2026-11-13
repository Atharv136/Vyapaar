AI-Powered WhatsApp Commerce Platform
> Conversational commerce infrastructure that lets customers discover, understand, select, purchase and track products entirely through WhatsApp conversations, with voice notes, photographs and natural language as first-class inputs.
Status: Concept / pre-PRD
Source: Derived from `ideation.md.txt` and the follow-up feasibility analysis (WhatsApp boundaries, Flows, Tech Provider onboarding, payments, architecture).
Audience: Founding team, engineers, hackathon judges, potential merchants and investors.
---
Table of Contents
Product Vision
Problem Statement
Solution Overview
Feature Modules
WhatsApp Capabilities and Boundaries
Target Customers and Use Cases
Customer Journey
Merchant Experience
Agentic AI Architecture
Technical Architecture
Automation Layer (n8n)
Payments
Data Model (Initial)
Compliance and Platform Constraints
Merchant Onboarding
Roadmap and MVP Scope
Revenue Model
Market and Competitive Positioning
Success Metrics
Risks and Mitigations
Open Questions
Glossary
Next Steps
---
1. Product Vision
Central promise:
> "From asking for a product to placing an order, everything happens through a conversation."
We are not building another WhatsApp chatbot. We are building an AI-powered conversational commerce platform.
WhatsApp is the storefront for customers. Customers never need to open a website, create an account or navigate multiple screens to buy.
The SaaS dashboard is the back office for merchants. Merchants operate the business from a web dashboard.
Core principle: We are not teaching customers how to use e-commerce. We are bringing e-commerce into the way customers already communicate.
Differentiator: Accessibility. A customer should not need to know how an e-commerce site works, know the exact product name, type a perfect query, or complete a multi-step checkout. They should be able to send a voice note, a photograph or a sentence and complete a purchase.
---
2. Problem Statement
2.1 Core problems
Problem	What happens today
Delayed responses	Customers wait for merchants to reply and eventually leave.
Complex ordering	Customers struggle with websites, forms, catalogs and checkout flows.
Product discovery	Customers don't know product names, specifications or good alternatives.
Rigid chatbots	Traditional bots rely on numbered menus and cannot handle contextual requests.
Inventory disconnect	Customers order unavailable products because stock is not current.
Lost conversions	Abandoned carts, failed payments and unfinished conversations cost revenue.
2.2 The digital accessibility gap
Older customers, people with limited digital literacy, first-time online shoppers and people who prefer speaking to typing often struggle with conventional e-commerce. A voice-and-photo-first channel makes commerce more inclusive.
---
3. Solution Overview
A business connects its product catalog, inventory, pricing and order management to the platform. AI agents act as its intelligent sales assistant on WhatsApp.
Customers interact through:
Natural-language text (including informal and incomplete sentences)
Voice notes (including Hindi-English and other code-switched speech)
Photographs of handwritten lists or unidentified products
Interactive WhatsApp messages (buttons, lists, product cards, Flows)
The system understands intent, recommends products, checks live inventory, builds a cart, asks for confirmation, facilitates payment and sends order updates, all within the chat.
Key design rule: AI handles understanding and decision support. Deterministic backend services handle prices, stock, cart totals, order creation and payment verification. An LLM never invents prices, stock levels or payment status.
---
4. Feature Modules
The product is organized into eight modules.
Module A: Multimodal AI Shopping Assistant (core differentiator)
A1. Audio-to-order
Customer sends a voice note, e.g. "Send me two packets of Amul milk, one kilogram of sugar, a packet of Maggi and some tea powder."
Pipeline: WhatsApp audio webhook → media download → speech-to-text → entity and quantity extraction → catalog match → inventory and price check → cart preview → customer confirmation.
Corrections are conversational: "Make that three packets of milk instead."
A2. Photo-to-order
Use case 1, shopping list: OCR and vision model extract handwritten items and quantities; ambiguous handwriting triggers a clarifying question; items are matched against the catalog.
Use case 2, unidentified product: Vision model proposes likely product or category; catalog search returns candidates as product cards; customer selects.
Image recognition suggests matches. It must never silently assume the identification is correct.
A3. Natural-language product discovery
Examples: "I need something to clean my sofa." "Suggest a shampoo for dry hair." "Budget-friendly birthday gift." "Something similar to this."
Module B: Intelligent Conversational AI (core platform)
Replaces rigid menus ("Press 1 for details") with an agent that:
Understands incomplete or informal input
Asks relevant follow-up questions
Handles multiple products in one conversation
Understands regional-language input
Recommends by requirement and budget
Remembers relevant preferences
Handles order corrections
Recognizes when it cannot answer confidently and escalates
The agent uses controlled tools (catalog search, inventory check, cart operations, permitted transactions). It does not free-generate commercial facts.
Module C: Personalized Shopping Memory (retention)
C1. My Usual
Analyzes order history to find frequently purchased items (e.g. milk ×18, bread ×12, eggs ×9).
"Send my usual groceries" → AI prepares a cart → customer confirms, removes or changes quantities.
Can also answer "What do I usually order?" in chat.
C2. My Wishlist
"Save this mixer for later." → stored against the customer's WhatsApp identifier and the merchant's tenant.
"Show my saved products." "Is that mixer still available?" "Has its price dropped?"
Shown via WhatsApp product messages.
C3. Replenishment suggestions
Detects purchase cadence (e.g. a product bought roughly every 30 days) and proposes a reorder at the right time, subject to consent and messaging rules (see Section 14).
Module D: Live Inventory and Intelligent Alternatives (commerce infrastructure)
Workflow:
Customer requests a product.
Catalog search finds candidates.
Inventory service checks current stock.
If available → recommend.
If unavailable → recommendation engine proposes alternatives matched on category, brand preference, price range, size/quantity, attributes and purchase history.
Example:
> Customer: *"A 1-litre packet of toned milk."*
> AI: *"Your preferred brand is out of stock. We have two similar 1-litre toned milk options. Would you like either?"*
Stock integrity: Reserve stock when a cart moves to checkout, and revalidate at order creation, so two customers cannot buy the last unit.
Module E: Cart Abandonment Intelligence (revenue recovery)
Rather than generic reminders, the system records the last completed step and the unresolved concern, then classifies the probable reason.
Customer behaviour	Probable reason	Suggested intervention
Asked for price, then went quiet	Price sensitivity	Suggest a cheaper alternative
Asked about delivery, then went quiet	Delivery uncertainty	Clarify estimated delivery
Added items but did not pay	Payment friction	Offer payment assistance
Asked about specifications	Insufficient information	Provide product details
Stopped after seeing delivery charges	Unexpected cost	Explain charges or offer alternatives
Example follow-up:
> *"You were looking at the wireless headphones. Would you like help comparing them with a more affordable option?"*
The system must classify reasons as probable, never claim certainty about why someone left.
Module F: RTO Shield (merchant protection)
RTO = Return to Origin: an order shipped but could not be delivered and came back to the seller. Most costly for cash-on-delivery (COD).
Capabilities:
Flag suspicious ordering patterns
Flag repeated COD cancellations
Detect incomplete or inconsistent delivery details
Detect duplicate or unusually frequent orders
Request confirmation before dispatch
Encourage prepaid orders through permitted incentives
Route high-risk orders to manual verification
Illustrative output:
> **Risk score: 62/100 (Medium)**
> - First-time COD customer
> - Delivery address needs confirmation
> - No prior successful delivery
> **Recommended action:** Ask the customer to confirm delivery details before dispatch.
Principle: Flag and recommend. Never automatically reject legitimate customers. The score is an illustrative heuristic until validated against real data.
Module G: Live Merchant / Human-in-the-Loop CRM (merchant operations)
Fully automated commerce should not remove humans. Escalation triggers:
Customer explicitly asks for a human
AI cannot confidently identify a product
Complaint or refund request
Payment succeeded but order confirmation failed
Inventory data is inconsistent
Unusual or high-risk order needs verification
Merchant alert contents: customer details, full conversation history, AI summary, requested products and cart, the specific issue, and a suggested next response.
The merchant can take over, reply, and hand control back to the AI. The AI pauses for that conversation while escalated.
Module H: Payments and Order Completion (conversion)
Customer flow: discover → add to cart → review quantities and totals → confirm delivery details → receive payment request → pay → receive confirmation → track order.
Payment routes are detailed in Section 12.
---
5. WhatsApp Capabilities and Boundaries
5.1 What WhatsApp gives us
WhatsApp capability	What it enables
Text messages	Natural-language conversation
Image messages	Product photos, shopping lists
Audio messages	Voice ordering
Interactive buttons	Confirm, cancel, choose, proceed
List messages	Categories and selectable options
Product messages	Single product card with image, price, description
Catalog messages	Browse the merchant's catalog inside WhatsApp
Multi-product messages	Display several products together
WhatsApp Flows	Structured forms (address, slot, variant, quantity, review, confirm) rendered natively
Webhooks	Inbound messages, status updates, delivery events
5.2 WhatsApp Flows
Flows let a business present structured interactive screens that open inside WhatsApp, not as an external website. Use them for:
Delivery address selection
Delivery slot selection
Variant and quantity selection
Customer details
Order review and confirmation
Principle: Conversational AI for understanding and decisions. Flows for structured collection and confirmation. Do not force everything into forms. "Tomorrow morning is fine" should work when the AI can interpret and confirm it safely.
5.3 Hard boundaries
Boundary 1: We cannot redesign WhatsApp's interface.
We cannot build custom screens, change message layouts, add arbitrary components, embed React, or run JavaScript inside a chat. We use only the formats Meta supports.
Boundary 2: The 24-hour customer service window.
A customer message opens a window of 24 hours.
Inside the window, free-form (including AI-generated) replies are permitted.
After it closes, business-initiated messages require an approved template.
Each new customer message resets the window.
Impact: cart-abandonment follow-ups and My Usual reorder nudges beyond the window must use approved templates. Pricing and categories follow Meta's current rules.
Boundary 3: Official platform only.
Use the WhatsApp Business Platform Cloud API. Do not build on WhatsApp Web automation or unofficial bots.
WhatsApp Business App	WhatsApp Business Platform
Manual conversations	Programmatic messaging and webhooks
Limited automation	AI agents and backend workflows
Basic catalog	API-connected catalog and commerce
Not multi-tenant	Foundation for a SaaS
Boundary 4: Merchant onboarding is a major dependency. See Section 15.
Boundary 5: AI cannot perform every action alone. See Section 9.
5.4 Feasibility summary
Feature	Possible inside chat?	Implementation
Text AI assistant	Yes	Cloud API + LLM
Audio-to-order	Yes	Media download + speech-to-text + AI
Photo of shopping list	Yes	Media download + OCR + AI
Photo of unknown product	Yes	Vision model + catalog matching
Product recommendations	Yes	AI + catalog
Interactive catalog	Yes	WhatsApp Catalog API
Add to cart	Yes	Native commerce messages or backend cart
Modify quantities	Yes	Interactive messages + backend
My Usual	Yes	Purchase history + AI
My Wishlist	Yes	Backend + chat
Real-time inventory	Yes	Inventory API + sync (must be built)
Alternatives	Yes	Recommendation engine
Cart abandonment recovery	Yes, subject to window rules	Event tracking + approved templates
RTO Shield	Yes (backend)	Risk model; customer sees only normal messages
Live merchant takeover	Yes	Shared inbox + handover
CRM	Yes	Backend + dashboard
Order tracking	Yes	Logistics integration + messages
WhatsApp-native payment	Conditional	Eligible payment integration
Payment link	Conditional	Gateway; may open external secure checkout
---
6. Target Customers and Use Cases
The platform is multi-industry. The core engine stays the same; catalog, attributes, business rules and workflows are configurable per industry.
Segment	Key use cases
Retailers and kirana stores	Voice grocery orders, handwritten list photos, My Usual, live stock, delivery updates
Restaurants and food businesses	Conversational food ordering, menu recommendations, customisation notes, payment, repeat meals
D2C brands	Personalised discovery, product comparison, preference-based recommendations, cart recovery, CRM
Distributors and wholesalers	Bulk natural-language ordering, repeat purchase orders, quantity and price tiers, inventory sync, business profiles
Pharmacies	Product search, voice requests, stock availability, pickup coordination, pharmacist escalation
Local businesses	Photo-based identification, discovery, recommendations, conversational orders, support
6.1 Pharmacy guardrails (mandatory)
Prescription validation and restricted-medicine rules must be enforced.
The AI must not independently recommend or substitute prescription medicines.
Prescription-required items route to a licensed pharmacist.
Applicable pharmacy regulations must be reviewed before launch in this vertical.
---
7. Customer Journey
7.1 Reference scenario
Customer: "I want my usual groceries. Also, I'm sending a picture of something I need." (sends a photo)
AI: Builds the usual list from history and runs visual search on the photo.
AI: Presents candidate products for the photographed item and asks which one.
Customer selects one.
AI: Presents cart: Milk ×2, Bread ×1, Eggs ×12, Sugar ×1 kg, identified product ×1. Prices and availability verified against the merchant catalog.
Customer: "Yes, confirm."
AI: Creates the order and sends a payment option.
Payment verified by webhook.
AI: Sends confirmation and delivery updates.
Merchant sees order, customer, payment status and conversation in the dashboard.
7.2 Pre-purchase support path
Product questions, specifications, delivery queries and price questions are answered from the catalog and merchant policies. Anything unresolved escalates to the merchant.
---
8. Merchant Experience
8.1 Dashboard sections
Section	Contents
Overview	Revenue, total orders, conversion rate, abandoned carts
Conversations	Active chats, AI-handled chats, escalations, takeovers
Products	Catalog, inventory, low-stock alerts, product sync status
Customers	Profiles, order history, preferences, My Usual, segments
Orders	Pending, confirmed, paid, dispatched, delivered, cancelled
8.2 Merchant configuration
Business information and working hours
Delivery areas, charges and slots
Return and refund policies
Product categories and attributes
AI persona, tone and response language
Escalation rules and notification preferences
Payment methods
Automation toggles (recovery, My Usual, RTO Shield)
8.3 Onboarding
A small business should be able to register, upload an Excel or CSV catalog, configure delivery policies and test the AI without a developer.
8.4 Conversation control
AI responds by default.
Escalated conversations pause AI responses.
Merchant replies from the dashboard or the connected WhatsApp inbox.
Control returns to the AI when the merchant resolves the issue.
---
9. Agentic AI Architecture
9.1 Principle
Do not build one large autonomous agent. Use a central orchestrator that routes to specialised agents and controlled tools.
9.2 Layers
```
WhatsApp communication layer      Text · Audio · Images · Interactive · Flows
        │
Input understanding layer         Transcription · OCR · Vision · Intent extraction
        │
Central AI orchestrator           Context, routing, tool selection, guardrails
        │
 ┌──────┼─────────┬──────────┬───────────┬───────────┬───────────┬───────────┐
Shopping  Catalog   Inventory  Order      Payment    Customer    Recovery    Risk
Agent     Agent     Agent      Agent      Agent      Agent       Agent       Agent
        │
Shared business services          Catalog · Inventory · CRM · Orders · Payments · Analytics
        │
Response to customer / merchant escalation
```
9.3 Responsibility split
AI may do	Backend must do
Understand "two packets of milk"	Retrieve the actual product and price
Recommend a product	Verify price and availability
Interpret a voice note	Validate extracted quantities
Identify a likely product from a photo	Match against the merchant catalog
Suggest alternatives	Confirm actual stock
Prepare an order	Create a transactional order record
Suggest payment	Generate a valid payment request
Interpret a payment event	Verify payment via gateway webhook
9.4 Guardrails
The customer must explicitly confirm the order before creation.
Confidence thresholds gate product identification. Below threshold → ask or escalate.
Agents may only call registered tools. No free-form database access.
Agents cannot mark an order paid, change a price, or fabricate a product.
Every consequential action is logged with its tool inputs and outputs.
---
10. Technical Architecture
10.1 Multi-tenancy
Multi-tenant SaaS. Every merchant has a tenant ID.
Every row in every business table carries `tenant_id`.
Row-level security enforced at the database.
Tenants must never see each other's customers, orders, inventory or conversations.
10.2 Stack (proposed for MVP)
Layer	Technology	Purpose
Customer interface	WhatsApp Cloud API (Business Platform)	Customer conversations
Merchant dashboard	React + TypeScript + Tailwind	Operations
Backend	Node.js + Express (or NestJS)	Business logic, APIs, webhooks
Database	PostgreSQL via Supabase	Merchants, products, orders, customers
Realtime	Supabase Realtime	Inventory and dashboard updates
AI orchestration	LangGraph or controlled tool-calling	Agent workflows
LLM	Gemini API (or equivalent)	Intent, reasoning, extraction
Speech-to-text	Multilingual STT model	Voice-to-order
Vision	Multimodal vision model + OCR	Photo-to-order
Automation	n8n	Asynchronous workflows
Cache	Redis (optional at MVP)	Session state, temporary data
Payments	Razorpay and supported UPI integrations	Payment requests and verification
CRM	Custom	Customer and conversation records
Hosting	Cloud	Webhook availability
These are proposals. Supabase alone can carry the MVP without Redis.
10.3 Message flow
```
Customer (WhatsApp)
   │  message / voice / image / interactive reply
   ▼
WhatsApp Cloud API ──webhook──▶ Backend API
                                  │ verify signature, identify tenant, load session
                                  ▼
                        Input understanding (STT / OCR / vision)
                                  ▼
                        Central AI orchestrator ──tools──▶ Catalog · Inventory · Cart · Orders · Payments · CRM
                                  ▼
                        Response composer (text / product cards / lists / buttons / Flows)
                                  ▼
                        WhatsApp Cloud API ──▶ Customer
```
Rule: Real-time message handling runs in the backend, not through n8n. Latency-sensitive chains must not depend on a workflow engine.
10.4 Event tracking
Track at least:
Product viewed
Product information requested
Product added to cart
Delivery charges displayed
Checkout initiated
Payment initiated
Payment completed
These events form a customer journey timeline used by abandonment analysis.
10.5 Idempotency and transactions
Webhooks can be retried. Every inbound message is deduplicated by WhatsApp message ID.
Order creation, stock reservation and payment verification run inside database transactions.
Payment webhooks are idempotent.
---
11. Automation Layer (n8n)
n8n is the asynchronous automation layer, not the core backend.
Trigger	Workflow
New order	Notify merchant; start order processing
Inventory updated	Refresh availability
Payment webhook received	Update payment and order status
Cart abandoned	Evaluate recovery eligibility; schedule template follow-up
Repeat purchase pattern	Generate reorder suggestion
Human escalation	Send merchant alert with conversation summary
Order dispatched	Send tracking update to customer
Boundary: Payment verification, stock reservation, order creation and other transactional steps stay in the backend. n8n coordinates the surrounding workflow.
---
12. Payments
12.1 Three routes
Route	Customer experience	Availability
1. WhatsApp-native payment	Pays inside WhatsApp	Where merchant and integration are eligible; best experience
2. UPI payment request / link	Receives UPI request; may open a UPI app	Broad, depending on integration
3. Payment gateway checkout	Secure gateway page, then returns to chat	Broadest coverage
Recommendation: Native payment when available. UPI and gateway checkout as fallbacks.
Do not make the MVP depend on WhatsApp-native payments being available to every merchant. Availability and API capabilities differ between the Business App and the Business Platform.
12.2 Verification rule
Payment is verified only through gateway or provider webhooks.
A customer sending a payment screenshot does not mark an order paid.
Orders move to paid only on verified webhook events.
12.3 Payment states
`pending_payment → paid | payment_failed | expired | cancelled`
---
13. Data Model (Initial)
Indicative entities. Full schema is a later deliverable.
Table	Key fields (illustrative)
`tenants`	id, business_name, plan, status
`merchants_whatsapp_accounts`	tenant_id, waba_id, phone_number_id, token_ref, status
`customers`	id, tenant_id, wa_id, name, phone, consent_status
`conversations`	id, tenant_id, customer_id, mode (ai / human), status, last_customer_message_at
`messages`	id, conversation_id, direction, type, content_ref, wa_message_id (unique), created_at
`products`	id, tenant_id, sku, name, description, price, currency, tax, meta_catalog_item_id, active
`product_variants`	id, product_id, attributes, price
`inventory`	product_variant_id, on_hand, reserved, updated_at
`carts`	id, conversation_id, status, total
`cart_items`	cart_id, product_variant_id, quantity, unit_price_snapshot
`orders`	id, tenant_id, customer_id, status, total, delivery_address, created_at
`order_items`	order_id, product_variant_id, quantity, unit_price
`payments`	id, order_id, provider, provider_ref, status, verified_at
`wishlists`	customer_id, product_id, created_at
`events`	id, tenant_id, customer_id, type, payload, occurred_at
`escalations`	id, conversation_id, reason, status, assigned_to
`risk_assessments`	order_id, score, factors, recommended_action
`consents`	customer_id, channel, purpose, granted_at, revoked_at
`agent_actions`	id, conversation_id, tool, input, output, created_at
Money fields use integer minor units (paise) to avoid floating-point errors.
---
14. Compliance and Platform Constraints
Official API only. WhatsApp Business Platform Cloud API. No unofficial automation.
24-hour window. Business-initiated messages outside the window require approved templates. Respect Meta's current template categories and pricing.
Consent and opt-outs. Record opt-in for marketing and replenishment messages. Honour opt-outs immediately.
Human escalation. Always available on request.
Tenant isolation. Enforced at the data layer, tested.
Accessibility. Regional languages, short replies, voice input, clear confirmations. Avoid long replies and too many choices.
Regulated categories. Pharmacy and similar categories have extra rules (Section 6.1).
Data protection. Follow applicable Indian data-protection requirements for personal data, including purpose limitation and retention. Legal review required before launch.
Risk scoring fairness. Scores recommend actions; they do not reject customers automatically. Review factors for unfair proxies.
Probabilistic labels. Abandonment reasons and product matches are presented as probable, never certain.
---
15. Merchant Onboarding
15.1 The problem
Each merchant has its own WhatsApp Business Account, phone number, catalog, customers, inventory and payment setup. We cannot send messages as 100 businesses from one personal number.
15.2 Route
Meta's Tech Provider onboarding and Embedded Signup are designed for this model.
Steps:
Register a Meta developer application.
Set up the required business portfolio.
Complete Tech Provider onboarding and business verification as applicable.
Configure permissions and complete app review.
Implement Embedded Signup.
Each merchant connects its own business assets and authorises permissions.
Store merchant credentials and phone-number identifiers securely (encrypted, scoped per tenant).
15.3 Dependency
Hackathon / demo: Use a test business account and test catalog.
Commercial launch: Plan and begin Tech Provider onboarding early. Do not promise unrestricted merchant onboarding before approvals are complete.
---
16. Roadmap and MVP Scope
16.1 MVP question
> Can a customer place an order through a natural WhatsApp conversation without visiting an e-commerce website?
16.2 Phase 1: Core MVP (must build)
WhatsApp integration: receive and send text, voice, images and interactive messages
Merchant onboarding: register a business and connect a catalog (CSV/Excel import, test account)
Product catalog: names, descriptions, images, prices, variants, availability
AI shopping agent: understand text, ask follow-ups, recommend products
Audio-to-order: transcribe, extract products and quantities, prepare cart
Photo-to-order: handwritten lists and product identification
Cart and order creation: add, remove, modify conversationally; explicit confirmation
Payment integration: payment links and webhook verification
Basic merchant dashboard: conversations, customers, orders, inventory
16.3 Phase 2: Intelligent commerce (next release)
My Usual and My Wishlist
Real-time inventory synchronisation
Alternative recommendations
Cart abandonment analysis and recovery (template-based)
Human handover and merchant alerts
Order tracking and automated updates
16.4 Phase 3: Advanced SaaS (expansion)
RTO Shield and predictive risk scoring
Advanced CRM and segmentation
Regional language support expansion
Replenishment predictions
Advanced analytics
ERP, POS and third-party integrations
Multiple agents and configurable business workflows
16.5 Demonstration recommendation
Build the first working demo around a grocery store. It naturally shows voice ordering, image ordering, repeat purchases, product matching, inventory and payment. Once the engine works, configure it for other verticals.
---
17. Revenue Model
Stream	How we earn
Monthly subscription	Recurring plan fee
Transaction fee	Small platform fee per completed order (if commercially and legally appropriate)
Premium modules	RTO Shield, advanced CRM, recovery automation
Usage charges	WhatsApp message and AI processing usage above plan allowances
Payment partnerships	Revenue from eligible gateway partnerships
17.1 Illustrative pricing (hypotheses for market testing, not researched prices)
Plan	Price	Includes
Starter	₹999 / month	Basic AI assistant, catalog, order management
Growth	₹2,999 / month	Multimodal AI, CRM and analytics, cart recovery
Business	₹6,999+ / month	Advanced agents, RTO Shield, custom integrations
WhatsApp messaging fees, AI usage and gateway costs must be transparent. Each plan includes usage allowances; overage is billed separately.
---
18. Market and Competitive Positioning
18.1 Market drivers
WhatsApp is already a core business communication channel in India.
Customers are comfortable with conversational interfaces but often find web commerce hard.
Small businesses need affordable automation without building their own app or support team.
18.2 Competitive landscape
Meta has announced Business AI on WhatsApp for India (May 2026), with business-owner takeover and plans for in-chat UPI payments, and a Business Agent Platform (June 2026) for building agents integrated with external systems.
These announcements come from the source discussion and must be verified against Meta's current documentation before the competitive section of any pitch is finalised.
Meta's native offering	Our proposed platform
Business-specific AI assistance	Configurable multi-industry commerce engine
Product recommendations	Multimodal audio and photo ordering
Business information and FAQs	Inventory-aware product matching
AI-assisted sales	Full cart and order orchestration
Human takeover	Dedicated CRM and merchant operations
Native WhatsApp experience	WhatsApp-first, with POS, inventory and payment integrations
General business AI	Specialised My Usual, RTO Shield, cart recovery
18.3 Positioning
> Not a chatbot builder. Not just a WhatsApp CRM. Not just a payment integration.
> **An end-to-end conversational commerce infrastructure for businesses.**
Differentiation to protect:
Multimodal ordering (voice and photo)
Agentic product discovery
Inventory-aware recommendations
Personalised repeat purchasing
Automated conversion recovery
Order and payment orchestration
Human-in-the-loop merchant operations
---
19. Success Metrics
Metric	Measures
Conversation-to-order conversion	Share of conversations that become orders
Order completion rate	Share of started orders that complete
Cart abandonment rate	Share of carts left incomplete
Recovery conversion	Share of abandoned carts that return to purchase
AI resolution rate	Conversations resolved without human intervention
Average response time	Speed of first customer response
Repeat purchase rate	Customers who order again
RTO rate	Share of orders returned to origin
North-star KPI: Completed orders per customer conversation.
---
20. Risks and Mitigations
Risk	Impact	Mitigation
Meta platform approval delays	Cannot onboard merchants	Start Tech Provider onboarding early; use test accounts for demos
Meta launches overlapping native features	Reduced differentiation	Focus on multimodal ordering, POS/inventory depth, CRM, RTO and recovery
24-hour window limits follow-ups	Lower recovery and retention	Approved templates; well-timed in-window prompts
Hallucinated prices or stock	Customer trust, financial loss	Deterministic tools for all commercial facts
Wrong product from photo	Wrong order	Suggest, do not assume; confirmation step
Double-sold inventory	Refunds, merchant anger	Stock reservation and checkout revalidation
Unverified payments	Fulfilment without money	Webhook-only verification
Pharmacy regulation breach	Legal exposure	Prescription guardrails; pharmacist escalation
Tenant data leak	Severe trust and legal damage	Tenant ID on all rows; RLS; isolation tests
Speech recognition errors in Indian languages	Wrong quantities	Confirmation before order; corrections in chat
Unfair RTO scoring	Customer harm, compliance risk	Recommend rather than reject; audit factors
Scope creep	Delayed MVP	Strict phase gates
---
21. Open Questions
Which merchant vertical is the first design partner? (Recommended: grocery.)
Which speech-to-text provider best handles Hindi-English and other regional code-switching at acceptable cost?
Which payment provider(s) are eligible for WhatsApp-native checkout for our first merchants?
What is the policy for COD in the MVP?
Who handles logistics and tracking integrations at launch?
What are the data retention periods for voice notes and images?
What is the required depth of POS and inventory integration for the first paying merchant?
What is the legal structure for the platform fee on transactions?
How will Meta's new Business AI and Agent Platform change our differentiation after launch?
---
22. Glossary
Term	Meaning
Tenant	One merchant's isolated workspace within the platform
WABA	WhatsApp Business Account
Cloud API	Meta's hosted WhatsApp Business Platform API
Webhook	Callback from Meta or a gateway to our backend
Template message	Pre-approved message used outside the 24-hour window
Customer service window	24-hour period after a customer message in which free-form replies are allowed
Flows	Structured interactive screens rendered inside WhatsApp
Tech Provider	Meta program for platforms that onboard other businesses
Embedded Signup	Flow that lets a merchant connect its WhatsApp assets to our platform
RTO	Return to Origin: shipment returned to seller undelivered
COD	Cash on delivery
STT	Speech-to-text
OCR	Optical character recognition
UPI	Unified Payments Interface (India)
RLS	Row-level security
---
23. Next Steps
Finalise the MVP PRD using Section 16.2 as the scope.
Build the capability map: for each feature, identify the Cloud API endpoints, webhook events, message types, Flows, database tables and n8n workflows. Separate what Meta provides from what we must build.
Verify Meta's current state for Business AI, Agent Platform, WhatsApp-native payments and Tech Provider requirements.
Start Tech Provider onboarding and app review in parallel with development.
Define agent responsibilities and tool contracts for the orchestrator.
Draft the database schema (Section 13) with tenancy and money-handling rules.
Design the n8n workflows for the Phase 2 triggers.
Build the grocery demo on a test WhatsApp Business account and test catalog.
Run pilot tests with 2–3 design-partner merchants and measure the Section 19 metrics.
---
This README is a planning document. Pricing, market claims and Meta platform capabilities are hypotheses to validate before commitment.


### Module I: Lead Qualification and Sales Automation *(sales conversion, Lead mode)*

**Problem.** Businesses receive enquiries on WhatsApp but respond late, follow up inconsistently, fail to qualify prospects, and lose appointments and sales.

**What it does.**
- **Instant first response.** Every new lead gets a reply within seconds, in the customer's language, at any hour.
- **Qualification.** The AI asks short, one-question-at-a-time questions to learn what the lead needs, their budget range, their timeline, and whether they can make the decision. The answers produce a lead score and a stage.
- **Automated follow-up.** Leads who go quiet get a timed sequence of follow-ups. The sequence stops as soon as the lead replies, books, opts out, or is marked lost.
- **Appointment scheduling.** The AI proposes 2–3 free slots from the merchant's calendar, confirms the chosen slot, creates the calendar event, and sends reminders.
- **Human handover.** Hot leads, complaints, and out-of-scope questions go to a human sales agent with a full summary (see Module G).
- **Pipeline view.** A sales pipeline in the dashboard shows each lead's stage, score, last contact, next follow-up, and booked appointments.

**Target verticals.** Real estate agencies, education companies, insurance agencies, automobile dealers, travel agencies, and SMEs. Each vertical has its own qualification questions, rules, and forbidden claims (see Section 6.2).

**Revenue (Lead mode).**
- Monthly subscription (base platform fee).
- Per-agent pricing: a monthly fee for each human sales agent seat with dashboard access.
- Per-conversation charges above the plan's included allowance. A conversation follows Meta's current definition (see Section 14.3).
- Premium CRM integrations (HubSpot, Zoho, and others).
- Enterprise licences for multi-branch businesses.

**Market potential.** Potentially very high, but unproven. The thesis is that merchants will pay for measurable lead conversion and booked appointments. Validate this with pilot data (Section 19 metrics plus the lead metrics in Section 19.1) before presenting a market size figure.

### 19.1 Lead metrics (added to Section 19)

| Metric | Measures |
|---|---|
| Speed to first response | Time from lead's first message to our first reply |
| Qualification completion rate | Share of leads who answer all required qualification questions |
| Lead-to-appointment rate | Share of leads who book an appointment |
| Appointment show-up rate | Share of booked appointments attended |
| Follow-up response rate | Share of leads who reply after a follow-up |
| Lead-to-won rate | Share of leads that a merchant marks as won |
| Cost per qualified lead | Platform and AI cost ÷ qualified leads |

### 14.3 Lead-mode compliance additions (added to Section 14)

11. **Consent before marketing.** Leads from ads or forms must see a clear notice that the business will message them on WhatsApp. Store the source and time of consent in `consents`.
12. **Personal data.** Follow India's Digital Personal Data Protection Act, 2023 (DPDP Act) for lead data: purpose limitation, retention limits, and the right to request deletion. Legal review is required before launch.
13. **Regulated verticals.** Insurance, real estate, and education have advertising and solicitation rules. The AI must not give policy advice, promise returns, guarantee admission or outcomes, or quote prices that the merchant has not configured. These rules are enforced by the guardrails in Section 6.2 of the Validation document.
14. **Message windows.** Ad-driven conversations and free-entry conversations have their own window rules. Confirm current durations in Meta's documentation before relying on them in the follow-up design.

### 6.2 Vertical guardrails (added to Section 6)

| Vertical | Must do | Must never do |
|---|---|---|
| Real estate | Show RERA project ID if configured; route site visits to an agent | Promise price growth or returns; quote unlisted prices |
| Insurance | Collect needs and contact details; hand off to a licensed advisor | Recommend a specific policy; compare or rank insurers as advice; promise claim outcomes |
| Education | Share only configured course, fee, and intake information; book counselling | Guarantee admission, placement, or scholarships; invent rankings |
| Auto dealers | Book test drives; share configured offers | Confirm loan approval or interest rates; promise delivery dates not in the system |
| Travel | Share configured packages; collect travel dates and group size | Quote fares or availability not returned by a tool; promise visa outcomes |
| SMEs | Qualify and book demos | Make claims about the merchant's product not in its configuration |

### Glossary additions

| Term | Meaning |
|---|---|
| **Lead** | A person who has enquired and is not yet a customer |
| **Lead mode** | Tenant configuration that turns on lead qualification and follow-up |
| **Sales agent (human)** | A merchant's staff member who handles escalated leads. Not AI. |
| **Per-agent pricing** | Subscription charge per human sales-agent seat |
| **Qualification** | Structured questions that establish need, budget, timeline, and decision authority |
| **Lead score** | A 0–100 estimate of how ready a lead is to buy. Labelled "probable," not certain. |
| **Free-entry conversation** | A conversation opened by a customer from an ad or link. Has its own window rules. |