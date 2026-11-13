import React, { useState } from 'react';
import { Lock, Mail, Building, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Tenant } from '../types';

interface LoginPageProps {
  tenants: Tenant[];
  onLoginSuccess: (tenant: Tenant) => void;
  onCancel: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ tenants, onLoginSuccess, onCancel }) => {
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenants[0]?.id || '');
  const [email, setEmail] = useState<string>('merchant@freshbasket.in');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [error, setError] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundTenant = tenants.find(t => t.id === selectedTenantId);
    if (!foundTenant) {
      setError('Please select a valid merchant tenant.');
      return;
    }
    onLoginSuccess(foundTenant);
  };

  const handleQuickDemoLogin = (tenant: Tenant) => {
    onLoginSuccess(tenant);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-canvas">
      <div className="card-sketch w-full max-w-md p-8 bg-white shadow-sketchLg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-mint border-[1.5px] border-forest mx-auto mb-3 flex items-center justify-center text-forest shadow-sketchSm">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-2xl text-ink-primary">Merchant Back-Office Login</h2>
          <p className="text-xs text-ink-secondary mt-1">
            Supabase Tenant Auth · Row-Level Security Protected
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-coral-soft text-coral-dark text-xs rounded-xl border border-coral-dark font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Tenant Selector */}
          <div>
            <label className="block text-xs font-bold text-ink-primary mb-1">
              Store Tenant Organization
            </label>
            <div className="relative">
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full bg-tinted border border-border-light rounded-xl px-3.5 py-2.5 text-xs text-ink-primary focus:outline-forest focus:bg-white"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.businessName} ({t.displayPhoneNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-ink-primary mb-1">
              Merchant Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-tinted border border-border-light rounded-xl px-3.5 py-2.5 text-xs text-ink-primary focus:outline-forest focus:bg-white"
                placeholder="owner@yourstore.in"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-ink-primary mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-tinted border border-border-light rounded-xl px-3.5 py-2.5 text-xs text-ink-primary focus:outline-forest focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-forest" />
              <span>Remember this session</span>
            </label>
            <span className="text-forest hover:underline cursor-pointer">Forgot password?</span>
          </div>

          <button
            type="submit"
            className="btn-forest w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 mt-4"
          >
            <span>Sign in to Store Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="mt-8 pt-6 border-t border-dashed border-border-light">
          <span className="font-mono text-[10px] uppercase text-ink-muted block text-center mb-3 font-semibold">
            ⚡ Quick 1-Click Demo Credentials
          </span>

          <div className="space-y-2">
            {tenants.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleQuickDemoLogin(t)}
                className="w-full text-left p-2.5 rounded-xl border border-border-light hover:border-forest bg-canvas flex items-center justify-between text-xs transition-colors group"
              >
                <div>
                  <strong className="block text-forest group-hover:underline">{t.businessName}</strong>
                  <span className="text-[10px] text-ink-muted font-mono">{t.modes.join(' + ')} · {t.plan} plan</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-dark bg-mint px-2 py-0.5 rounded-full border border-mint-border">
                  1-Click Launch →
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={onCancel}
            className="w-full text-center text-xs text-ink-muted hover:text-forest mt-4"
          >
            ← Return to Public Showcase
          </button>
        </div>
      </div>
    </div>
  );
};

