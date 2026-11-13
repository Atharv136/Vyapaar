import React from 'react';
import { ArrowUpRight, TrendingUp, Users, ShoppingCart, AlertCircle, ShieldAlert, CheckCircle2, MessageSquare, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { Tenant, Order, Conversation } from '../types';
import { mockKPIs } from '../data/mockData';

interface OverviewPageProps {
  tenant: Tenant;
  orders: Order[];
  conversations: Conversation[];
  onNavigate: (view: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  tenant,
  orders,
  conversations,
  onNavigate
}) => {
  // Format paise to INR
  const formatRupees = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const escalatedChat = conversations.find(c => c.status === 'escalated');
  const riskyOrder = orders.find(o => o.riskAssessment.band === 'Medium' || o.riskAssessment.band === 'High');

  return (
    <div className="space-y-8 max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Welcome Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-light">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-2xl text-ink-primary">Store Overview</h1>
            <span className="font-mono text-xs bg-mint text-forest font-bold px-2.5 py-0.5 rounded-full border border-mint-border">
              {tenant.businessName}
            </span>
          </div>
          <p className="text-xs text-ink-secondary mt-1">
            Real-time WhatsApp Commerce metrics &amp; automated agent operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-border-light text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse"></span>
            <span>Meta Webhook: 200 OK</span>
          </div>
          <button
            onClick={() => onNavigate('dashboard-conversations')}
            className="btn-forest px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Active Chats (3)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Step 9.2 & D-02) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Revenue */}
        <div className="card-sketch p-5 bg-white">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-ink-muted">Today&apos;s Revenue</span>
            <span className="p-1.5 rounded-lg bg-mint text-forest">
              <TrendingUp className="w-4 h-4 text-emerald-dark" />
            </span>
          </div>
          <div className="font-display text-3xl font-normal text-forest mb-1">
            {formatRupees(mockKPIs.todayRevenuePaise)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-dark font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{mockKPIs.revenueDeltaPercent}% vs yesterday</span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="card-sketch p-5 bg-white">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-ink-muted">Total Orders Today</span>
            <span className="p-1.5 rounded-lg bg-mint text-forest">
              <ShoppingCart className="w-4 h-4 text-emerald-dark" />
            </span>
          </div>
          <div className="font-display text-3xl font-normal text-forest mb-1">
            {mockKPIs.todayOrdersCount}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-dark font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{mockKPIs.ordersDeltaCount} new orders this hour</span>
          </div>
        </div>

        {/* Card 3: Chat-to-Order Conversion Rate */}
        <div className="card-sketch p-5 bg-white">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-ink-muted">Chat-to-Order Conversion</span>
            <span className="p-1.5 rounded-lg bg-amber-soft text-amber-dark">
              <Zap className="w-4 h-4 text-amber-DEFAULT" />
            </span>
          </div>
          <div className="font-display text-3xl font-normal text-forest mb-1">
            {mockKPIs.chatToOrderConversionRate}%
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-dark font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{mockKPIs.conversionDeltaPercent}% vs manual kirana chat</span>
          </div>
        </div>

        {/* Card 4: Cart Abandonment Recovered */}
        <div className="card-sketch p-5 bg-white">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-ink-muted">Carts Recovered (n8n)</span>
            <span className="p-1.5 rounded-lg bg-mint text-forest">
              <RefreshCw className="w-4 h-4 text-emerald-dark" />
            </span>
          </div>
          <div className="font-display text-3xl font-normal text-forest mb-1">
            {formatRupees(mockKPIs.abandonedCartsRecoveredPaise)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-dark font-semibold">
            <span>{mockKPIs.abandonedCartsRecoveredCount} orders saved this week</span>
          </div>
        </div>
      </div>

      {/* Urgent Operational Alerts Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Escalation Alert */}
        {escalatedChat && (
          <div className="card-sketch p-5 bg-white border-coral-dark/50 shadow-sketchSm">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-coral-soft text-coral-dark font-mono text-[11px] font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Human Escalation · Action Required</span>
              </span>
              <span className="text-[11px] text-ink-muted">{escalatedChat.lastCustomerMessageAt}</span>
            </div>

            <h3 className="font-bold text-sm text-ink-primary mb-1">
              {escalatedChat.customerName} ({escalatedChat.customerPhone})
            </h3>
            <p className="text-xs text-ink-secondary mb-3 bg-canvas p-2.5 rounded-xl border border-border-light leading-relaxed">
              <strong>AI Summary:</strong> {escalatedChat.aiSummary}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('dashboard-conversations')}
                className="btn-sketch bg-white px-3.5 py-1.5 rounded-xl text-xs font-bold text-coral-dark hover:bg-coral-soft flex items-center gap-1"
              >
                <span>Take Over Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('dashboard-conversations')}
                className="text-xs text-ink-muted hover:text-forest underline"
              >
                View Full Transcript
              </button>
            </div>
          </div>
        )}

        {/* RTO COD Risk Alert */}
        {riskyOrder && (
          <div className="card-sketch p-5 bg-white border-amber-500/50 shadow-sketchSm">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-soft text-amber-dark font-mono text-[11px] font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>RTO Shield · Medium Risk (Score: {riskyOrder.riskAssessment.score}/100)</span>
              </span>
              <span className="font-mono text-xs font-bold text-forest">{riskyOrder.orderNumber}</span>
            </div>

            <h3 className="font-bold text-sm text-ink-primary mb-1">
              COD Order: {formatRupees(riskyOrder.totalPaise)} · {riskyOrder.customerName}
            </h3>
            <p className="text-xs text-ink-secondary mb-3 bg-canvas p-2.5 rounded-xl border border-border-light leading-relaxed">
              <strong>Signals:</strong> First-time COD buyer + incomplete landmark in address (&quot;{riskyOrder.deliveryAddress.landmark}&quot;). Automated address confirmation dispatched.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('dashboard-orders')}
                className="btn-sketch bg-white px-3.5 py-1.5 rounded-xl text-xs font-bold text-forest hover:bg-tinted flex items-center gap-1"
              >
                <span>Inspect in Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] text-ink-muted">
                {riskyOrder.riskAssessment.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Middle Row: Recent Orders & Quick Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders List */}
        <div className="lg:col-span-8 card-sketch p-6 bg-white">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-light">
            <div>
              <h2 className="font-bold text-base text-ink-primary">Recent Orders Flow</h2>
              <span className="text-xs text-ink-muted">Validated against live catalog and payment webhooks</span>
            </div>
            <button
              onClick={() => onNavigate('dashboard-orders')}
              className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-border-light text-xs">
            {orders.slice(0, 4).map(o => (
              <div key={o.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-mono text-forest">{o.orderNumber}</strong>
                    <span className="font-semibold text-ink-primary">{o.customerName}</span>
                    <span className="text-[10px] text-ink-muted">({o.customerPhone})</span>
                  </div>
                  <div className="text-[11px] text-ink-secondary mt-0.5">
                    {o.items.map(it => `${it.name} × ${it.quantity}`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="font-mono font-bold text-sm text-ink-primary">
                    {formatRupees(o.totalPaise)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                    o.status === 'paid' ? 'bg-mint text-emerald-dark' :
                    o.status === 'dispatched' ? 'bg-[#E0F2FE] text-[#075985]' :
                    o.status === 'delivered' ? 'bg-mint text-forest' :
                    'bg-amber-soft text-amber-dark'
                  }`}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Operations Status */}
        <div className="lg:col-span-4 card-sketch p-6 bg-white space-y-4">
          <h2 className="font-bold text-base text-ink-primary pb-3 border-b border-border-light">
            AI Operational Guardrails
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-canvas border border-border-light">
              <span className="font-bold text-forest block mb-0.5">Rule 1 &amp; 6 · Integer Paise Pricing</span>
              <p className="text-ink-secondary text-[11px]">
                Deterministic prices and totals computed in whole paise. LLM never generates numbers.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-canvas border border-border-light">
              <span className="font-bold text-forest block mb-0.5">Rule 2 · Explicit Confirmation</span>
              <p className="text-ink-secondary text-[11px]">
                Order created only upon customer tapping &quot;Confirm&quot; token on WhatsApp.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-canvas border border-border-light">
              <span className="font-bold text-forest block mb-0.5">Rule 3 · Verified Webhook Only</span>
              <p className="text-ink-secondary text-[11px]">
                Payment status updated to paid only upon receiving signed Razorpay/Meta webhook.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-canvas border border-border-light">
              <span className="font-bold text-forest block mb-0.5">Rule 8 · Human Takeover Silence</span>
              <p className="text-ink-secondary text-[11px]">
                When mode = human, AI completely halts automatic messaging for that thread.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

