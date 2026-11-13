import React, { useState } from 'react';
import { ArrowRight, Check, ShieldCheck, ShoppingBag, Mic, Camera, Sparkles, Building2, Utensils, Pill, Car, GraduationCap, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { WhatsAppSimulator } from '../components/simulator/WhatsAppSimulator';
import { SparkleDoodle, SquiggleUnderline } from '../components/common/DoodleIcons';

interface ShowcasePageProps {
  onOpenDashboard: () => void;
}

export const ShowcasePage: React.FC<ShowcasePageProps> = ({ onOpenDashboard }) => {
  const [activeVertical, setActiveVertical] = useState<'kirana' | 'restaurant' | 'pharmacy' | 'd2c' | 'leads'>('kirana');
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="min-h-screen bg-canvas">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-soft border-[1.5px] border-amber-300 text-xs font-bold text-amber-dark shadow-xs">
                <SparkleDoodle className="w-4 h-4 text-amber-DEFAULT" />
                <span>Not another rigid chatbot — Full Conversational Commerce</span>
              </div>

              {/* Title */}
              <h1 className="font-display font-normal text-4xl sm:text-5xl md:text-6xl text-ink-primary tracking-tight leading-[1.08]">
                Bring e-commerce into the way customers{' '}
                <span className="relative inline-block text-emerald-dark italic font-normal">
                  already talk.
                  <span className="absolute -bottom-2 left-0 w-full h-3">
                    <SquiggleUnderline className="w-full h-3 text-amber-DEFAULT" />
                  </span>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-xl">
                Customers discover products, send Hinglish voice notes, snap handwritten grocery lists, book appointments, and pay—all inside a single WhatsApp chat. No apps to download, no confusing websites.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenDashboard}
                  className="btn-forest px-6 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 group"
                >
                  <span>Launch Merchant Back-Office</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#architecture"
                  className="btn-sketch bg-white px-6 py-3 rounded-full text-sm font-bold text-forest hover:bg-tinted transition-colors"
                >
                  Inspect Agent Architecture
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-dashed border-border-light grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-ink-secondary font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald"></span>
                  <span>Official Meta Cloud API</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald"></span>
                  <span>Hinglish & Regional Voice</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald"></span>
                  <span>Deterministic UPI & Stocks</span>
                </div>
              </div>
            </div>

            {/* Right: Live Interactive WhatsApp Simulator */}
            <div className="lg:col-span-5 flex justify-center">
              <WhatsAppSimulator />
            </div>
          </div>
        </div>
      </section>

      {/* 2. DIGITAL ACCESSIBILITY GAP */}
      <section id="problem" className="py-20 bg-tinted border-y border-border-light">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-dark bg-mint px-3 py-1 rounded-full border border-mint-border">
              Bridging the Digital Accessibility Gap
            </span>
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-ink-primary">
              Why traditional e-commerce leaves millions behind
            </h2>
            <p className="text-sm sm:text-base text-ink-secondary">
              Older shoppers, regional-language speakers, and busy everyday buyers shouldn't have to wrestle with filters, search bars, or 5-screen checkouts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <article className="card-sketch p-6 bg-white hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-amber-soft border-[1.5px] border-sketch flex items-center justify-center mb-4 text-amber-dark">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-ink-primary mb-2">Delayed Merchant Replies</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Customers message a kirana or brand on WhatsApp, wait 3 hours for price checks, and abandon the purchase.
              </p>
            </article>

            <article className="card-sketch p-6 bg-white hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-mint-dark border-[1.5px] border-sketch flex items-center justify-center mb-4 text-forest">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-ink-primary mb-2">Complex Catalogs & Forms</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Searching exact English spellings and filling checkout forms creates friction for tier-2/3 users.
              </p>
            </article>

            <article className="card-sketch p-6 bg-white hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-coral-soft border-[1.5px] border-sketch flex items-center justify-center mb-4 text-coral-dark">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-ink-primary mb-2">Rigid &quot;Press 1&quot; Chatbots</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Menu-tree bots crash when a customer sends a mixed voice note or asks for alternatives in Hindi.
              </p>
            </article>

            <article className="card-sketch p-6 bg-white hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] border-[1.5px] border-sketch flex items-center justify-center mb-4 text-[#075985]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-ink-primary mb-2">Disconnected Stock & RTO</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Selling out-of-stock items causes refunds, while unverified COD orders trigger costly Return-to-Origin losses.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* 3. MULTIMODAL AI SHOPPING ASSISTANT (MODULE A) */}
      <section id="multimodal" className="py-20 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-left max-w-2xl mb-14 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-dark bg-mint px-3 py-1 rounded-full border border-mint-border">
              Module A · Multimodal Intelligence
            </span>
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-ink-primary">
              Speak it, snap it, or describe it naturally
            </h2>
            <p className="text-sm sm:text-base text-ink-secondary">
              Three first-class input pipelines built specifically for Indian shopping habits—backed by strict confirmation guardrails so the AI never guesses prices or stock.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pipeline 1: Voice */}
            <div className="border border-border-light rounded-2xl p-6 bg-canvas flex flex-col justify-between shadow-soft">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-forest font-mono text-[11px] font-bold mb-4">
                  <Mic className="w-3.5 h-3.5 text-emerald-dark" />
                  <span>01 · Audio-to-Order</span>
                </div>
                <h3 className="font-bold text-lg text-ink-primary mb-2">Multilingual Voice Note Ordering</h3>
                <p className="text-xs text-ink-secondary leading-relaxed mb-6">
                  Supports code-switched Hindi-English, Marathi, and regional phrasing. Extracts multiple SKUs, quantities, and conversational edits in seconds.
                </p>
              </div>

              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-3.5 space-y-2">
                <div>
                  <span className="font-mono text-[10px] uppercase text-ink-muted block">Voice Input</span>
                  <span className="text-xs font-medium text-forest">&quot;Ek kilo cheeni aur do packet doodh bhej do&quot;</span>
                </div>
                <div className="text-emerald-dark flex justify-center">↓</div>
                <div>
                  <span className="font-mono text-[10px] uppercase text-emerald-dark font-bold block">Structured Cart</span>
                  <span className="text-xs font-semibold text-ink-primary">Sugar (1kg) × 1 · Toned Milk (500ml) × 2</span>
                </div>
              </div>
            </div>

            {/* Pipeline 2: Photo */}
            <div className="border border-border-light rounded-2xl p-6 bg-canvas flex flex-col justify-between shadow-soft">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-forest font-mono text-[11px] font-bold mb-4">
                  <Camera className="w-3.5 h-3.5 text-emerald-dark" />
                  <span>02 · Photo-to-Order</span>
                </div>
                <h3 className="font-bold text-lg text-ink-primary mb-2">Handwritten Lists & Visual Search</h3>
                <p className="text-xs text-ink-secondary leading-relaxed mb-6">
                  Dual-pipeline vision: reads handwritten paper lists via OCR or identifies unknown appliances and spare parts from a camera snapshot.
                </p>
              </div>

              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-3.5 space-y-2">
                <div>
                  <span className="font-mono text-[10px] uppercase text-ink-muted block">Camera Snap</span>
                  <span className="text-xs font-medium text-forest">Photo of a broken mixer jar or paper note</span>
                </div>
                <div className="text-emerald-dark flex justify-center">↓</div>
                <div>
                  <span className="font-mono text-[10px] uppercase text-emerald-dark font-bold block">Candidate Cards</span>
                  <span className="text-xs font-semibold text-ink-primary">&quot;Looks like 500ml chutney jar. Which one fits?&quot;</span>
                </div>
              </div>
            </div>

            {/* Pipeline 3: Memory */}
            <div className="border border-border-light rounded-2xl p-6 bg-canvas flex flex-col justify-between shadow-soft">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-forest font-mono text-[11px] font-bold mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-dark" />
                  <span>03 · Personalized Memory</span>
                </div>
                <h3 className="font-bold text-lg text-ink-primary mb-2">&quot;My Usual&quot;, Wishlist & Substitutes</h3>
                <p className="text-xs text-ink-secondary leading-relaxed mb-6">
                  Remembers repeat baskets for 1-tap reorders, tracks wishlist price drops, and suggests in-stock substitutes when a brand runs out.
                </p>
              </div>

              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-3.5 space-y-2">
                <div>
                  <span className="font-mono text-[10px] uppercase text-ink-muted block">Customer Intent</span>
                  <span className="text-xs font-medium text-forest">&quot;Send my monthly usuals, skip the rice.&quot;</span>
                </div>
                <div className="text-emerald-dark flex justify-center">↓</div>
                <div>
                  <span className="font-mono text-[10px] uppercase text-emerald-dark font-bold block">Instant Recall</span>
                  <span className="text-xs font-semibold text-ink-primary">Rebuilds 6-item basket minus Rice · Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DUAL ENGINE: COMMERCE & LEADS */}
      <section id="platform-modes" className="py-20 bg-mint border-y border-[#B7E4CC]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-forest bg-white px-3 py-1 rounded-full border border-forest">
              One Shared Platform · Two High-Impact Modes
            </span>
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-forest">
              Direct Basket Checkout & High-Ticket Lead Sales
            </h2>
            <p className="text-sm sm:text-base text-forest/80">
              Merchants can activate Commerce Mode, Lead Mode, or both on the exact same WhatsApp Business number.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Commerce Mode */}
            <div className="card-mint-sketch p-8 bg-white">
              <span className="inline-block px-3 py-1 rounded-full bg-mint-dark text-emerald-dark font-mono text-xs font-bold mb-4">
                Commerce Mode (Modules A–H)
              </span>
              <h3 className="font-bold text-2xl text-ink-primary mb-2">From Inquiry to Verified Payment</h3>
              <p className="text-xs text-ink-secondary pb-4 mb-6 border-b border-border-light">
                For Kirana stores, restaurants, D2C brands, pharmacies, and wholesale distributors.
              </p>

              <ul className="space-y-4 text-xs text-ink-secondary">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span><strong>WhatsApp Native Flows & Catalogs:</strong> Interactive product cards, delivery slot pickers, and address forms inside WhatsApp.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span><strong>Live Stock Reservation:</strong> Locks stock at checkout and revalidates so two buyers never claim the last unit.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span><strong>RTO Shield Risk Scoring:</strong> Flags risky COD orders (vague address, repeat returns) and nudges ₹50 UPI prepaid incentives.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span><strong>Probable Abandonment Recovery:</strong> Classifies whether buyer stopped due to price or delivery fee, sending compliant templates.</span>
                </li>
              </ul>
            </div>

            {/* Lead Mode */}
            <div className="card-mint-sketch p-8 bg-white">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-soft text-amber-dark font-mono text-xs font-bold mb-4">
                Lead Mode (Module I)
              </span>
              <h3 className="font-bold text-2xl text-ink-primary mb-2">From Enquiry to Booked Appointment</h3>
              <p className="text-xs text-ink-secondary pb-4 mb-6 border-b border-border-light">
                For Real Estate, Education, Insurance, Auto Dealers, and Travel Agencies.
              </p>

              <ul className="space-y-4 text-xs text-ink-secondary">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-amber-DEFAULT flex items-center justify-center text-black shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span><strong>Instant 24/7 Qualification:</strong> Replies in seconds, asking one short question at a time for budget, requirement, and timeline.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-amber-DEFAULT flex items-center justify-center text-black shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span><strong>Google Calendar Slot Booking:</strong> Checks merchant calendar availability, proposes free slots, and prevents double-booking.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-amber-DEFAULT flex items-center justify-center text-black shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span><strong>Stop-Aware Follow-up Sequences:</strong> Timed sequences (2h, 1d, 3d, 7d) that halt the instant a lead replies or books.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-amber-DEFAULT flex items-center justify-center text-black shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span><strong>Regulated Vertical Guardrails:</strong> Strict forbidden-claim checks ensure agents never promise unauthorized financial returns.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ARCHITECTURE & GOLDEN GUARDRAILS */}
      <section id="architecture" className="py-20 bg-forest text-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-light bg-forest-card px-3 py-1 rounded-full border border-emerald/30">
              System Architecture & Golden Guardrails
            </span>
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-white">
              AI understands intent. Deterministic code handles money.
            </h2>
            <p className="text-sm sm:text-base text-white/80">
              Instead of one monolithic LLM that hallucinates prices or stock, a Central Orchestrator routes tasks to specialized agents backed by strict transactional APIs.
            </p>
          </div>

          {/* Tier Diagram */}
          <div className="space-y-4 mb-12">
            <div className="bg-forest-card border border-emerald-light/20 rounded-xl p-5">
              <span className="font-mono text-xs text-emerald-light uppercase tracking-wider block mb-3 font-bold">
                01 · Channel & Understanding Layer
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center font-medium">
                <div className="bg-white/10 p-2.5 rounded-lg border border-white/10">WhatsApp Cloud API & Webhooks</div>
                <div className="bg-white/10 p-2.5 rounded-lg border border-white/10">Multilingual Speech-to-Text</div>
                <div className="bg-white/10 p-2.5 rounded-lg border border-white/10">Vision OCR & Visual Matcher</div>
                <div className="bg-white/10 p-2.5 rounded-lg border border-white/10">24-Hr Window & Template Guard</div>
              </div>
            </div>

            <div className="text-center font-mono text-xs text-emerald-light">
              ↓ Verified Tenant Context + Deduplicated WhatsApp Message ID
            </div>

            <div className="bg-emerald-light/10 border-2 border-emerald rounded-xl p-5">
              <span className="font-mono text-xs text-emerald font-bold uppercase tracking-wider block mb-3">
                02 · Central AI Orchestrator (LangGraph / Controlled Tool-Calling)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center font-bold text-forest">
                <div className="bg-emerald p-2 rounded-lg">Shopping Agent</div>
                <div className="bg-emerald p-2 rounded-lg">Catalog Agent</div>
                <div className="bg-emerald p-2 rounded-lg">Inventory Agent</div>
                <div className="bg-emerald p-2 rounded-lg">Order Agent</div>
                <div className="bg-emerald p-2 rounded-lg">Payment Agent</div>
                <div className="bg-emerald p-2 rounded-lg">Lead Qualifier</div>
                <div className="bg-emerald p-2 rounded-lg">Recovery Agent</div>
                <div className="bg-emerald p-2 rounded-lg">RTO Risk Agent</div>
              </div>
            </div>

            <div className="text-center font-mono text-xs text-emerald-light">
              ↓ Registered Deterministic Tools Only (Zero Direct DB Access from AI)
            </div>

            <div className="bg-forest-card border border-emerald-light/20 rounded-xl p-5">
              <span className="font-mono text-xs text-emerald-light uppercase tracking-wider block mb-3 font-bold">
                03 · Multi-Tenant Backend & Async Automation
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center font-medium">
                <div className="bg-forest-deep p-2.5 rounded-lg border border-emerald-light/30">PostgreSQL + Supabase RLS</div>
                <div className="bg-forest-deep p-2.5 rounded-lg border border-emerald-light/30">Transactional Cart & Stock Lock</div>
                <div className="bg-forest-deep p-2.5 rounded-lg border border-emerald-light/30">Razorpay / UPI Webhook Verifier</div>
                <div className="bg-forest-deep p-2.5 rounded-lg border border-emerald-light/30">n8n Async Workflows (Alerts)</div>
              </div>
            </div>
          </div>

          {/* Golden Rules Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h4 className="font-bold text-base text-white mb-3">What AI Agents Do</h4>
              <ul className="space-y-2 text-xs text-emerald-light/90">
                <li>— Interpret informal Hinglish voice notes and natural text</li>
                <li>— Extract line items from messy handwritten shopping notes</li>
                <li>— Recommend in-stock substitutes when preferred brands run out</li>
                <li>— Qualify leads step-by-step without aggressive pushiness</li>
                <li>— Summarize complex customer inquiries for merchant handover</li>
              </ul>
            </div>

            <div className="bg-amber-DEFAULT/10 border border-amber-DEFAULT/40 rounded-xl p-6">
              <h4 className="font-bold text-base text-amber-soft mb-3">What Deterministic Code Enforces (Golden Rules)</h4>
              <ul className="space-y-2 text-xs text-amber-soft/90">
                <li>— Fetch exact SKU prices stored in whole integer paise (Rule 1 & 6)</li>
                <li>— Lock stock inventory to prevent double-selling the last units (Rule 1)</li>
                <li>— Require explicit customer confirmation before creating an order (Rule 2)</li>
                <li>— Mark order paid ONLY when verified payment webhook arrives (Rule 3)</li>
                <li>— Enforce Row-Level Security across all tenant stores (Rule 4)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SAAS PRICING */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-dark bg-mint px-3 py-1 rounded-full border border-mint-border">
              SaaS Plans for Growing Businesses
            </span>
            <h2 className="font-display font-normal text-3xl sm:text-4xl text-ink-primary">
              Simple monthly plans with transparent usage
            </h2>
            <p className="text-sm sm:text-base text-ink-secondary">
              Start with a CSV catalog upload and Meta Embedded Signup in minutes. Meta Cloud API conversation fees billed transparently at actuals above plan allowances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Starter */}
            <div className="border border-border-light rounded-2xl p-8 bg-white flex flex-col justify-between shadow-soft">
              <div>
                <span className="font-bold text-lg text-forest block mb-1">Starter</span>
                <div className="font-display text-4xl text-ink-primary mb-2">
                  ₹999<span className="font-sans text-xs text-ink-muted">/month</span>
                </div>
                <p className="text-xs text-ink-secondary pb-4 mb-6 border-b border-border-light">
                  For single-store retailers & kirana merchants starting WhatsApp commerce.
                </p>

                <ul className="space-y-3 text-xs text-ink-secondary mb-8">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> Natural-language AI Assistant</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> CSV / Excel Product Catalog Sync</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> Conversational Cart & UPI Links</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> Basic Merchant Order Dashboard</li>
                </ul>
              </div>

              <button onClick={onOpenDashboard} className="btn-sketch w-full bg-white py-2.5 rounded-full text-xs font-bold text-forest">
                Start with Starter
              </button>
            </div>

            {/* Growth */}
            <div className="card-mint-sketch p-8 bg-[#FCFDFB] relative flex flex-col justify-between">
              <span className="absolute -top-3.5 right-6 bg-amber-DEFAULT text-black font-mono text-[10px] font-bold px-3 py-1 rounded-full border-[1.5px] border-sketch shadow-sketchSm">
                MOST POPULAR
              </span>
              <div>
                <span className="font-bold text-lg text-forest block mb-1">Growth</span>
                <div className="font-display text-4xl text-forest mb-2">
                  ₹2,999<span className="font-sans text-xs text-ink-muted">/month</span>
                </div>
                <p className="text-xs text-ink-secondary pb-4 mb-6 border-b border-border-light">
                  Full multimodal voice & photo ordering with retention memory and lead automation.
                </p>

                <ul className="space-y-3 text-xs text-ink-secondary mb-8">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> <strong>Audio-to-Order:</strong> Hinglish Voice Notes</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> <strong>Photo-to-Order:</strong> List OCR & Camera Search</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> &quot;My Usual&quot; &amp; &quot;My Wishlist&quot; Memory</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> Smart Cart Abandonment Recovery</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> Lead Qualification & Google Calendar</li>
                </ul>
              </div>

              <button onClick={onOpenDashboard} className="btn-forest w-full py-3 rounded-full text-xs font-bold shadow-md">
                Launch Growth Plan
              </button>
            </div>

            {/* Business */}
            <div className="border border-border-light rounded-2xl p-8 bg-white flex flex-col justify-between shadow-soft">
              <div>
                <span className="font-bold text-lg text-forest block mb-1">Business</span>
                <div className="font-display text-4xl text-ink-primary mb-2">
                  ₹6,999+<span className="font-sans text-xs text-ink-muted">/month</span>
                </div>
                <p className="text-xs text-ink-secondary pb-4 mb-6 border-b border-border-light">
                  For multi-branch brands, distributors, and high-volume sales teams.
                </p>

                <ul className="space-y-3 text-xs text-ink-secondary mb-8">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> RTO Shield COD Risk Scoring Engine</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> Multi-Agent Human CRM & Seat Roles</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> Custom POS, ERP, Zoho & HubSpot Sync</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-dark" /> Dedicated Meta Tech Provider Onboarding</li>
                </ul>
              </div>

              <button onClick={onOpenDashboard} className="btn-sketch w-full bg-white py-2.5 rounded-full text-xs font-bold text-forest">
                Talk to Solutions Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#072417] text-[#D1FAE5] py-14 border-t border-emerald-950">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between gap-8 pb-10 border-b border-white/10">
            <div className="max-w-sm space-y-3">
              <span className="font-bold text-2xl text-white block">VartaCart</span>
              <p className="text-xs text-emerald-light/80 leading-relaxed">
                AI-Powered Conversational Commerce & Lead Automation Infrastructure built on the official WhatsApp Business Platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-12 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-white uppercase font-mono block">Platform</span>
                <a href="#multimodal" className="block text-emerald-light/80 hover:text-white">Multimodal AI</a>
                <a href="#platform-modes" className="block text-emerald-light/80 hover:text-white">Commerce & Lead Modes</a>
                <a href="#architecture" className="block text-emerald-light/80 hover:text-white">Agent Architecture</a>
              </div>
              <div className="space-y-2">
                <span className="font-bold text-white uppercase font-mono block">Compliance</span>
                <span className="block text-emerald-light/80">Meta Cloud API Policy</span>
                <span className="block text-emerald-light/80">DPDP Data Isolation</span>
                <span className="block text-emerald-light/80">Human-in-the-Loop CRM</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between text-[11px] text-emerald-light/60 gap-4">
            <span>© 2026 VartaCart Technologies. Built for accessible conversational commerce.</span>
            <span>WhatsApp Cloud API · Gemini Multimodal · Fastify · Supabase Postgres</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

