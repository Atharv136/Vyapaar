import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle2, Truck, AlertTriangle, ArrowRight, ShieldCheck, X, FileText, Send } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrdersPageProps {
  orders: Order[];
  onUpdateOrder: (updated: Order) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ orders, onUpdateOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const formatRupees = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'risk') return matchesSearch && (o.riskAssessment.band === 'Medium' || o.riskAssessment.band === 'High');
    return matchesSearch && o.status === statusFilter;
  });

  const handleApproveDispatch = (order: Order) => {
    const updated: Order = {
      ...order,
      status: 'dispatched',
      dispatchedAt: 'Just now',
      trackingNumber: 'TRK-MUM-' + Math.floor(1000 + Math.random() * 9000)
    };
    onUpdateOrder(updated);
    setSelectedOrder(updated);
    setActionNotice(`Order ${order.orderNumber} marked as DISPATCHED. Customer tracking template dispatched via WhatsApp Cloud API.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSendAddressConfirmation = (order: Order) => {
    setActionNotice(`Sent neutral WhatsApp address confirmation flow to ${order.customerName} (${order.customerPhone}) (V-RISK-03).`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSendPrepaidNudge = (order: Order) => {
    setActionNotice(`Sent ₹50 UPI instant discount payment link to convert COD order to verified prepaid.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-light">
        <div>
          <h1 className="font-bold text-2xl text-ink-primary">Orders &amp; RTO Shield</h1>
          <p className="text-xs text-ink-secondary">
            Deterministic order fulfillment with Return-to-Origin (RTO) risk intelligence (Phase 11).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs bg-amber-soft text-amber-dark font-bold px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Illustrative Heuristic: Phase 11 Verified</span>
          </span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-mint border border-emerald rounded-xl text-xs font-semibold text-forest flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-forest hover:text-emerald-dark">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-border-light">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, or phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-border-light rounded-xl text-xs focus:outline-forest"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${statusFilter === 'all' ? 'bg-forest text-white' : 'text-ink-secondary hover:bg-tinted'}`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('risk')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${statusFilter === 'risk' ? 'bg-coral-dark text-white' : 'text-ink-secondary hover:text-coral-dark'}`}
          >
            RTO Risk Flags
          </button>
          <button
            onClick={() => setStatusFilter('pending_dispatch_confirmation')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${statusFilter === 'pending_dispatch_confirmation' ? 'bg-amber-soft text-amber-dark' : 'text-ink-secondary hover:bg-tinted'}`}
          >
            Pending Dispatch
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${statusFilter === 'paid' ? 'bg-mint text-forest' : 'text-ink-secondary hover:bg-tinted'}`}
          >
            Paid (Verified)
          </button>
          <button
            onClick={() => setStatusFilter('dispatched')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${statusFilter === 'dispatched' ? 'bg-tinted text-forest' : 'text-ink-secondary hover:bg-tinted'}`}
          >
            Dispatched
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-sketch bg-white overflow-hidden shadow-sketchLg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border-light font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                <th className="p-3.5">Order</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Items Summary</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">RTO Risk (0-100)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-tinted/50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-forest">
                    {order.orderNumber}
                    <span className="block text-[10px] text-ink-muted font-normal">{order.createdAt}</span>
                  </td>
                  <td className="p-3.5">
                    <strong className="block text-ink-primary">{order.customerName}</strong>
                    <span className="text-[10px] font-mono text-ink-muted">{order.customerPhone}</span>
                  </td>
                  <td className="p-3.5 max-w-[200px] truncate text-ink-secondary">
                    {order.items.map(i => `${i.name} (×${i.quantity})`).join(', ')}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-ink-primary">
                    {formatRupees(order.totalPaise)}
                  </td>
                  <td className="p-3.5 font-mono uppercase text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      order.paymentMethod === 'cod' ? 'bg-amber-soft text-amber-dark' : 'bg-mint text-emerald-dark'
                    }`}>
                      {order.paymentMethod.replace(/_/g, ' ')}
                    </span>
                    <span className="block text-[9px] text-ink-muted mt-0.5">{order.paymentStatus}</span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        order.riskAssessment.band === 'Low' ? 'bg-mint text-emerald-dark' :
                        order.riskAssessment.band === 'Medium' ? 'bg-amber-soft text-amber-dark' :
                        'bg-coral-soft text-coral-dark'
                      }`}>
                        {order.riskAssessment.score}/100 · {order.riskAssessment.band}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold ${
                      order.status === 'paid' ? 'bg-mint text-emerald-dark' :
                      order.status === 'dispatched' ? 'bg-[#E0F2FE] text-[#075985]' :
                      order.status === 'delivered' ? 'bg-mint text-forest' :
                      'bg-amber-soft text-amber-dark'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn-sketch bg-white px-3 py-1 rounded-lg text-xs font-bold text-forest hover:bg-tinted"
                    >
                      Inspect Risk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RTO Risk & Dispatch Modal Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border-2 border-forest max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-border-light mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-ink-primary">
                    Order {selectedOrder.orderNumber}
                  </h3>
                  <span className="font-mono text-xs bg-canvas px-2.5 py-0.5 rounded border border-border-light">
                    {formatRupees(selectedOrder.totalPaise)}
                  </span>
                </div>
                <span className="text-xs text-ink-secondary">
                  Customer: {selectedOrder.customerName} ({selectedOrder.customerPhone})
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-tinted rounded-lg">
                <X className="w-5 h-5 text-ink-muted" />
              </button>
            </div>

            {/* RTO Shield Heuristic Assessment (Step 11.1 - 11.3) */}
            <div className={`p-4 rounded-xl mb-4 border ${
              selectedOrder.riskAssessment.band === 'High' ? 'bg-coral-soft border-coral-dark' :
              selectedOrder.riskAssessment.band === 'Medium' ? 'bg-amber-soft border-amber-400' :
              'bg-mint border-emerald'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>RTO Shield Heuristic Score: {selectedOrder.riskAssessment.score}/100 ({selectedOrder.riskAssessment.band} Band)</span>
                </span>
                <span className="text-[10px] font-mono text-ink-muted">
                  {selectedOrder.riskAssessment.label}
                </span>
              </div>

              <div className="space-y-1.5 mb-3 text-xs">
                {selectedOrder.riskAssessment.factors.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white/70 p-2 rounded-lg">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      f.impact === 'danger' ? 'bg-coral-dark' : f.impact === 'warning' ? 'bg-amber-DEFAULT' : 'bg-emerald'
                    }`} />
                    <div>
                      <strong className="block text-ink-primary">{f.factor}</strong>
                      <span className="text-ink-secondary text-[11px]">{f.detail}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs font-semibold text-ink-primary bg-white p-2.5 rounded-lg border border-black/5">
                💡 Recommended Action: {selectedOrder.riskAssessment.recommendation}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-canvas p-3 rounded-xl border border-border-light mb-4 text-xs">
              <strong className="block text-forest mb-1">Delivery Address on WhatsApp Flow:</strong>
              <p className="text-ink-secondary">
                {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.area}, PIN: {selectedOrder.deliveryAddress.pincode}
                {selectedOrder.deliveryAddress.landmark && (
                  <span className="block mt-0.5 text-amber-dark">Landmark: {selectedOrder.deliveryAddress.landmark}</span>
                )}
              </p>
            </div>

            {/* Action Buttons (V-RISK-02 & V-RISK-03: Never auto-reject) */}
            <div className="space-y-2 pt-2 border-t border-border-light">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSendAddressConfirmation(selectedOrder)}
                  className="btn-sketch bg-white py-2 px-3 rounded-xl text-xs font-bold text-forest flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp Address Flow</span>
                </button>

                {selectedOrder.paymentMethod === 'cod' && (
                  <button
                    type="button"
                    onClick={() => handleSendPrepaidNudge(selectedOrder)}
                    className="btn-sketch bg-amber-soft py-2 px-3 rounded-xl text-xs font-bold text-amber-dark flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Nudge ₹50 UPI Prepaid</span>
                  </button>
                )}
              </div>

              {selectedOrder.status !== 'dispatched' && selectedOrder.status !== 'delivered' && (
                <button
                  type="button"
                  onClick={() => handleApproveDispatch(selectedOrder)}
                  className="btn-forest w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Truck className="w-4 h-4" />
                  <span>Approve &amp; Mark Dispatched (Sends Tracking Template)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

