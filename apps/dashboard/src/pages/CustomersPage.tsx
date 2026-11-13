import React, { useState } from 'react';
import { Search, Users, Heart, ShoppingBag, ShieldCheck, CheckCircle2, XCircle, ArrowRight, X } from 'lucide-react';
import { Customer } from '../types';

interface CustomersPageProps {
  customers: Customer[];
  onUpdateCustomer: (updated: Customer) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ customers, onUpdateCustomer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const formatRupees = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.waId.includes(searchQuery)
  );

  const handleToggleConsent = (c: Customer) => {
    const updated: Customer = {
      ...c,
      consentMarketing: !c.consentMarketing
    };
    onUpdateCustomer(updated);
    setSelectedCustomer(updated);
  };

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-light">
        <div>
          <h1 className="font-bold text-2xl text-ink-primary">Customers &amp; Retention Memory</h1>
          <p className="text-xs text-ink-secondary">
            Customer directory with WhatsApp identity, &quot;My Usual&quot; frequency intelligence, and DPDP marketing consent (V-REC-01).
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or WhatsApp ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-border-light rounded-xl text-xs focus:outline-forest"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="card-sketch bg-white overflow-hidden shadow-sketchLg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border-light font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                <th className="p-3.5">Customer &amp; WhatsApp ID</th>
                <th className="p-3.5">Total Orders</th>
                <th className="p-3.5">Lifetime Spend (LTV)</th>
                <th className="p-3.5">&quot;My Usual&quot; SKUs</th>
                <th className="p-3.5">Wishlist</th>
                <th className="p-3.5">Marketing Consent (DPDP)</th>
                <th className="p-3.5 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-tinted/50 transition-colors">
                  <td className="p-3.5">
                    <strong className="block text-ink-primary">{c.name}</strong>
                    <span className="font-mono text-[10px] text-ink-muted">{c.waId}</span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-forest">{c.totalOrders} orders</td>
                  <td className="p-3.5 font-mono font-bold text-ink-primary">{formatRupees(c.totalSpendPaise)}</td>
                  <td className="p-3.5">
                    {c.usualItems.length > 0 ? (
                      <span className="font-mono text-xs text-forest bg-mint px-2 py-0.5 rounded-full border border-mint-border">
                        {c.usualItems.length} frequent SKUs
                      </span>
                    ) : (
                      <span className="text-ink-muted text-[11px]">No order history</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {c.wishlist.length > 0 ? (
                      <span className="text-xs text-amber-dark font-medium flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-amber-DEFAULT" />
                        <span>{c.wishlist.length} items</span>
                      </span>
                    ) : (
                      <span className="text-ink-muted text-[11px]">—</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {c.consentMarketing ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-mint text-emerald-dark font-mono text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Consent Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-coral-soft text-coral-dark font-mono text-[10px] font-bold">
                        <XCircle className="w-3 h-3" />
                        <span>Opted Out (V-REC-01)</span>
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="btn-sketch bg-white px-3 py-1 rounded-lg text-xs font-bold text-forest hover:bg-tinted"
                    >
                      View Memory
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Memory Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-forest max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-border-light mb-4">
              <div>
                <h3 className="font-bold text-lg text-ink-primary">{selectedCustomer.name}</h3>
                <span className="font-mono text-xs text-ink-muted">{selectedCustomer.waId} · Active {selectedCustomer.lastActiveAt}</span>
              </div>
              <button onClick={() => setSelectedCustomer(null)}><X className="w-5 h-5 text-ink-muted" /></button>
            </div>

            {/* My Usual Basket Intelligence (Step 10.1) */}
            <div className="mb-5 bg-mint/50 p-4 rounded-xl border border-mint-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-forest uppercase font-mono flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-dark" />
                  <span>&quot;My Usual&quot; Frequent Basket (180-Day Cadence)</span>
                </span>
                <span className="font-mono text-[10px] text-ink-muted">Step 10.1 SQL View</span>
              </div>

              {selectedCustomer.usualItems.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {selectedCustomer.usualItems.map((item, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-border-light flex items-center justify-between text-xs">
                      <div>
                        <strong className="block text-ink-primary">{item.productName}</strong>
                        <span className="text-[10px] text-ink-muted font-mono">Ordered {item.orderCount} times in last 6 months</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-forest">{formatRupees(item.unitPricePaise)}</span>
                        <span className="text-[10px] text-ink-muted block">Default Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink-muted italic py-2">
                  No repeat order threshold reached yet. At least 3 orders needed to compute &quot;My Usual&quot;.
                </p>
              )}
            </div>

            {/* Wishlist Items (Step 10.2) */}
            <div className="mb-5 bg-canvas p-4 rounded-xl border border-border-light">
              <span className="font-bold text-xs text-forest uppercase font-mono flex items-center gap-1.5 mb-2">
                <Heart className="w-3.5 h-3.5 text-amber-DEFAULT" />
                <span>My Wishlist Saved Products (Step 10.2)</span>
              </span>

              {selectedCustomer.wishlist.length > 0 ? (
                <div className="space-y-2">
                  {selectedCustomer.wishlist.map((item, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-border-light flex justify-between items-center text-xs">
                      <div>
                        <strong className="block text-ink-primary">{item.productName}</strong>
                        <span className="text-[10px] text-ink-muted">Saved {item.addedAt}</span>
                      </div>
                      <div className="text-right">
                        <strong className="font-mono text-forest">{formatRupees(item.pricePaise)}</strong>
                        <span className="text-[10px] block font-semibold text-emerald-dark">In Stock</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink-muted italic py-1">No wishlist items saved.</p>
              )}
            </div>

            {/* DPDP Consent & Marketing Guardrail (V-REC-01 & V-REC-02) */}
            <div className="p-3.5 rounded-xl border border-border-light bg-white flex items-center justify-between text-xs">
              <div>
                <strong className="block text-ink-primary">WhatsApp Marketing Consent (DPDP)</strong>
                <span className="text-[11px] text-ink-secondary">
                  If disabled, automated cart abandonment and reorder templates are strictly blocked.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggleConsent(selectedCustomer)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs font-mono transition-colors ${
                  selectedCustomer.consentMarketing
                    ? 'bg-mint text-emerald-dark hover:bg-coral-soft hover:text-coral-dark'
                    : 'bg-coral-soft text-coral-dark hover:bg-mint hover:text-emerald-dark'
                }`}
              >
                {selectedCustomer.consentMarketing ? 'Revoke Consent' : 'Grant Consent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

