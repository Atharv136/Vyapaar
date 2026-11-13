import React, { useState } from 'react';
import { Save, ShieldCheck, CheckCircle2, MessageSquare, AlertCircle, RefreshCw, Key, HelpCircle } from 'lucide-react';
import { Tenant } from '../types';

interface SettingsPageProps {
  tenant: Tenant;
  onUpdateTenant: (updated: Tenant) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ tenant, onUpdateTenant }) => {
  const [formData, setFormData] = useState<Tenant>({ ...tenant });
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Pincode Fairness Report Data (Step 11.3)
  const pincodeFairnessData = [
    { pincode: '400058', area: 'Andheri West', totalOrders: 142, lowBandPct: 78, medBandPct: 18, highBandPct: 4, fairnessFlag: 'Normal' },
    { pincode: '400049', area: 'Juhu / JVPD', totalOrders: 98, lowBandPct: 89, medBandPct: 9, highBandPct: 2, fairnessFlag: 'Normal' },
    { pincode: '400050', area: 'Bandra West', totalOrders: 114, lowBandPct: 82, medBandPct: 15, highBandPct: 3, fairnessFlag: 'Normal' },
    { pincode: '400070', area: 'Kurla West', totalOrders: 64, lowBandPct: 62, medBandPct: 26, highBandPct: 12, fairnessFlag: 'Audited (No Proxy Bias)' }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTenant(formData);
    setSaveNotice('Settings updated successfully! Changes applied to live WhatsApp agents and cart totals.');
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const handleToggleMode = (mode: 'commerce' | 'lead') => {
    const exists = formData.modes.includes(mode);
    let newModes: ('commerce' | 'lead')[];
    if (exists) {
      if (formData.modes.length === 1) return; // Keep at least one mode
      newModes = formData.modes.filter(m => m !== mode);
    } else {
      newModes = [...formData.modes, mode];
    }
    setFormData({ ...formData, modes: newModes });
  };

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-light">
        <div>
          <h1 className="font-bold text-2xl text-ink-primary">Settings &amp; Integrations</h1>
          <p className="text-xs text-ink-secondary">
            Configure delivery charges, AI sales persona, WhatsApp Cloud API webhooks, and RTO fairness compliance.
          </p>
        </div>

        {saveNotice && (
          <div className="bg-mint text-forest px-4 py-2 rounded-xl border border-emerald font-semibold text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-dark" />
            <span>{saveNotice}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Business Profile & Modes */}
        <div className="card-sketch bg-white p-6 space-y-4">
          <h2 className="font-bold text-base text-ink-primary pb-3 border-b border-border-light">
            Business Profile &amp; Engine Modes (Phase 14)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-primary mb-1">Business Store Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full bg-tinted border border-border-light rounded-xl p-2.5 text-xs text-ink-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-primary mb-1">WhatsApp Display Phone Number</label>
              <input
                type="text"
                value={formData.displayPhoneNumber}
                onChange={(e) => setFormData({ ...formData, displayPhoneNumber: e.target.value })}
                className="w-full bg-tinted border border-border-light rounded-xl p-2.5 text-xs font-mono text-ink-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-primary mb-2">Active Platform Modes (Toggle)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => handleToggleMode('commerce')}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between ${
                  formData.modes.includes('commerce') ? 'bg-mint/40 border-forest' : 'bg-canvas border-border-light text-ink-muted'
                }`}
              >
                <div>
                  <strong className="block text-xs text-forest">Commerce Mode</strong>
                  <span className="text-[11px] text-ink-secondary">Multimodal Kirana ordering, carts, and UPI payments</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.modes.includes('commerce')}
                  onChange={() => {}}
                  className="rounded text-forest"
                />
              </div>

              <div 
                onClick={() => handleToggleMode('lead')}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between ${
                  formData.modes.includes('lead') ? 'bg-amber-soft/50 border-amber-500' : 'bg-canvas border-border-light text-ink-muted'
                }`}
              >
                <div>
                  <strong className="block text-xs text-amber-dark">Lead Automation Mode</strong>
                  <span className="text-[11px] text-ink-secondary">Conversational lead qualification &amp; Google Calendar booking</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.modes.includes('lead')}
                  onChange={() => {}}
                  className="rounded text-amber-DEFAULT"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Delivery & Pricing Policies */}
        <div className="card-sketch bg-white p-6 space-y-4">
          <h2 className="font-bold text-base text-ink-primary pb-3 border-b border-border-light">
            Delivery Fees &amp; Order Policies (Step 9.6 &amp; D-04)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-primary mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={(formData.deliveryChargePaise / 100).toFixed(0)}
                onChange={(e) => setFormData({ ...formData, deliveryChargePaise: Math.round(parseFloat(e.target.value || '0') * 100) })}
                className="w-full bg-tinted border border-border-light rounded-xl p-2.5 text-xs font-mono"
              />
              <span className="text-[10px] text-ink-muted font-mono">{formData.deliveryChargePaise} paise (integer storage)</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-primary mb-1">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                value={(formData.freeDeliveryThresholdPaise / 100).toFixed(0)}
                onChange={(e) => setFormData({ ...formData, freeDeliveryThresholdPaise: Math.round(parseFloat(e.target.value || '0') * 100) })}
                className="w-full bg-tinted border border-border-light rounded-xl p-2.5 text-xs font-mono"
              />
              <span className="text-[10px] text-ink-muted font-mono">Orders above ₹{(formData.freeDeliveryThresholdPaise / 100).toFixed(0)} get free delivery</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-primary mb-1">AI Conversational Persona &amp; Tone</label>
            <select
              value={formData.aiTone}
              onChange={(e: any) => setFormData({ ...formData, aiTone: e.target.value })}
              className="w-full bg-tinted border border-border-light rounded-xl p-2.5 text-xs"
            >
              <option value="friendly_kirana">Friendly Indian Kirana (Warm, uses &quot;Bhaiya / Namaste&quot;, code-switches naturally)</option>
              <option value="formal_business">Formal &amp; Professional (Retail, Healthcare &amp; Enterprise)</option>
              <option value="direct_concise">Direct &amp; Fast (Quick order confirmation, minimal chatter)</option>
            </select>
          </div>
        </div>

        {/* Section 3: WhatsApp Cloud API & Razorpay Webhooks */}
        <div className="card-sketch bg-white p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border-light">
            <h2 className="font-bold text-base text-ink-primary">
              Meta Cloud API &amp; Payment Gateway Integrations
            </h2>
            <span className="font-mono text-xs text-emerald-dark font-bold bg-mint px-2.5 py-0.5 rounded-full border border-mint-border">
              X-Hub-Signature-256 Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-ink-muted block text-[11px] mb-1 font-sans font-bold">Meta WABA ID</span>
              <input
                type="text"
                readOnly
                value={formData.wabaId}
                className="w-full bg-canvas border border-border-light rounded-xl p-2 text-ink-muted"
              />
            </div>

            <div>
              <span className="text-ink-muted block text-[11px] mb-1 font-sans font-bold">Phone Number ID</span>
              <input
                type="text"
                readOnly
                value={formData.phoneNumberId}
                className="w-full bg-canvas border border-border-light rounded-xl p-2 text-ink-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-ink-muted block text-[11px] mb-1 font-bold">Razorpay Test Key ID</span>
              <input
                type="text"
                value={formData.razorpayKeyId}
                onChange={(e) => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                className="w-full bg-tinted border border-border-light rounded-xl p-2 font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => alert("Simulation: Webhook payload sent to /webhooks/whatsapp. Signature verified 200 OK.")}
                className="btn-sketch bg-white w-full py-2 rounded-xl text-xs font-bold text-forest hover:bg-tinted flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Test Webhook Handshake</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Fairness Review & Pincode RTO Report (Step 11.3) */}
        <div className="card-sketch bg-white p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border-light">
            <div>
              <h2 className="font-bold text-base text-ink-primary">
                Pincode Fairness Audit &amp; Anti-Bias Report (Step 11.3)
              </h2>
              <span className="text-xs text-ink-secondary">
                Verifies risk models evaluate individual behavior, preventing demographic or area-based blacklisting.
              </span>
            </div>
            <span className="font-mono text-xs bg-mint text-forest font-bold px-2.5 py-0.5 rounded-full">
              Audit Status: COMPLIANT
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-canvas border-b border-border-light font-mono text-[10px] uppercase text-ink-muted">
                  <th className="p-2.5">Pincode</th>
                  <th className="p-2.5">Area</th>
                  <th className="p-2.5">Orders</th>
                  <th className="p-2.5">Low Band (&lt;40)</th>
                  <th className="p-2.5">Medium Band</th>
                  <th className="p-2.5">High Band (≥70)</th>
                  <th className="p-2.5">Fairness Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light font-mono text-[11px]">
                {pincodeFairnessData.map(row => (
                  <tr key={row.pincode}>
                    <td className="p-2.5 font-bold text-forest">{row.pincode}</td>
                    <td className="p-2.5 font-sans">{row.area}</td>
                    <td className="p-2.5">{row.totalOrders}</td>
                    <td className="p-2.5 text-emerald-dark font-semibold">{row.lowBandPct}%</td>
                    <td className="p-2.5 text-amber-dark font-semibold">{row.medBandPct}%</td>
                    <td className="p-2.5 text-coral-dark font-semibold">{row.highBandPct}%</td>
                    <td className="p-2.5 font-sans font-medium text-forest">{row.fairnessFlag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            className="btn-forest px-8 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings &amp; Deploy to Agents</span>
          </button>
        </div>
      </form>
    </div>
  );
};

