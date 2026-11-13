import React from 'react';
import { ShoppingCart, MessageSquare, ShieldAlert, Package, Users, CalendarCheck, Settings, LayoutDashboard, Globe, ChevronDown, CheckCircle, LogOut } from 'lucide-react';
import { Tenant } from '../../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  activeTenant: Tenant;
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  onLoginClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  activeTenant,
  tenants,
  onSelectTenant,
  isAuthenticated,
  onLogout,
  onLoginClick
}) => {
  const isDashboardRoute = currentView.startsWith('dashboard');

  return (
    <header className="sticky top-0 z-50 bg-[#FBFBF8]/90 backdrop-blur-md border-b border-[#DCE5DF]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('showcase')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-mint border-[1.5px] border-forest flex items-center justify-center shadow-sketchSm group-hover:scale-105 transition-transform">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M14 3C7.925 3 3 7.62 3 13.32C3 15.65 3.82 17.8 5.21 19.53L4 24.5L9.28 23.15C10.72 23.84 12.32 24.22 14 24.22C20.075 24.22 25 19.6 25 13.9C25 8.2 20.075 3 14 3Z" stroke="#0A3622" strokeWidth="2.2" strokeLinejoin="round" fill="#D1FAE5"/>
                <path d="M9.5 13.5C10.8 15.2 12.5 16 14.5 16C16.5 16 18 14.8 18.8 13.2" stroke="#0A3622" strokeWidth="2.2" strokeLinecap="round"/>
                <circle cx="10.5" cy="10.5" r="1.3" fill="#0A3622"/>
                <circle cx="17.5" cy="10.5" r="1.3" fill="#0A3622"/>
              </svg>
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-forest block leading-none">
                VartaCart
              </span>
              <span className="font-mono text-[10px] text-ink-muted">
                AI WhatsApp Commerce
              </span>
            </div>
          </button>

          {/* Mode Pill Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mint-light border border-mint-border text-[11px] font-mono text-forest">
            <span className="w-2 h-2 rounded-full bg-emerald"></span>
            <span>Cloud API v21.0</span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-tinted p-1.5 rounded-full border border-border-light text-xs font-semibold">
          <button
            onClick={() => onNavigate('showcase')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              currentView === 'showcase'
                ? 'bg-forest text-white shadow-xs'
                : 'text-ink-secondary hover:text-forest'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Showcase</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard-overview')}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              isDashboardRoute
                ? 'bg-forest text-white shadow-xs'
                : 'text-ink-secondary hover:text-forest'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Merchant Back-Office</span>
          </button>
        </nav>

        {/* Right Action Strip: Tenant Selector & Auth */}
        <div className="flex items-center gap-3">
          {/* Tenant Switcher dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-border-light text-xs font-medium hover:border-forest transition-colors shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald"></span>
              <span className="font-semibold text-forest truncate max-w-[130px] sm:max-w-[170px]">
                {activeTenant.businessName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-white border border-border-light rounded-xl shadow-lg p-1.5 hidden group-hover:block z-50">
              <span className="text-[10px] font-mono uppercase text-ink-muted px-2 py-1 block">
                Switch Merchant Tenant (RLS)
              </span>
              {tenants.map(t => (
                <button
                  key={t.id}
                  onClick={() => onSelectTenant(t)}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between ${
                    t.id === activeTenant.id ? 'bg-mint font-bold text-forest' : 'hover:bg-tinted text-ink-secondary'
                  }`}
                >
                  <div>
                    <span className="block truncate">{t.businessName}</span>
                    <span className="text-[10px] text-ink-muted font-mono">{t.displayPhoneNumber}</span>
                  </div>
                  {t.id === activeTenant.id && <CheckCircle className="w-3.5 h-3.5 text-emerald-dark" />}
                </button>
              ))}
            </div>
          </div>

          {/* Login / Dashboard CTA */}
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="p-2 text-ink-secondary hover:text-coral-dark rounded-xl border border-transparent hover:border-border-light hover:bg-tinted transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="btn-sketch bg-white px-3.5 py-1.5 rounded-full text-xs font-bold text-forest hover:bg-tinted"
            >
              Merchant Login
            </button>
          )}

          {!isDashboardRoute && (
            <button
              onClick={() => onNavigate('dashboard-overview')}
              className="btn-forest px-4 py-2 rounded-full text-xs font-bold shadow-sm"
            >
              Open Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Secondary Dashboard Navigation Bar (When inside Dashboard) */}
      {isDashboardRoute && (
        <div className="bg-[#FAFBF9] border-t border-[#DCE5DF] overflow-x-auto scrollbar-none">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 flex items-center gap-1 py-1.5 text-xs font-semibold">
            <button
              onClick={() => onNavigate('dashboard-overview')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                currentView === 'dashboard-overview' ? 'bg-forest text-white' : 'text-ink-secondary hover:bg-tinted hover:text-forest'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard-conversations')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                currentView === 'dashboard-conversations' ? 'bg-forest text-white' : 'text-ink-secondary hover:bg-tinted hover:text-forest'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Conversations</span>
              <span className="bg-amber-DEFAULT text-black px-1.5 py-0.2 rounded-full text-[10px] font-bold">1</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard-orders')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                currentView === 'dashboard-orders' ? 'bg-forest text-white' : 'text-ink-secondary hover:bg-tinted hover:text-forest'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Orders & RTO Shield</span>
              <span className="bg-coral-soft text-coral-dark px-1.5 py-0.2 rounded-full text-[10px] font-bold">2 Risk</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard-products')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                currentView === 'dashboard-products' ? 'bg-forest text-white' : 'text-ink-secondary hover:bg-tinted hover:text-forest'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products & Inventory</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard-customers')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                currentView === 'dashboard-customers' ? 'bg-forest text-white' : 'text-ink-secondary hover:bg-tinted hover:text-forest'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customers & My Usual</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard-leads')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                currentView === 'dashboard-leads' ? 'bg-forest text-white' : 'text-ink-secondary hover:bg-tinted hover:text-forest'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Lead Pipeline</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard-settings')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                currentView === 'dashboard-settings' ? 'bg-forest text-white' : 'text-ink-secondary hover:bg-tinted hover:text-forest'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings & Integrations</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

