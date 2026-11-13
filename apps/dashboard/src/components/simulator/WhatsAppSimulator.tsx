import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { VoiceWaveDoodle, CurvedArrowDoodle } from '../common/DoodleIcons';

interface CartItem {
  id: string;
  name: string;
  pricePaise: number;
  qty: number;
}

export const WhatsAppSimulator: React.FC = () => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showOcrDetails, setShowOcrDetails] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: 'p-102', name: 'Amul Taaza Toned Milk (1L)', pricePaise: 5600, qty: 2 },
    { id: 'p-103', name: 'Whole Wheat Bread (400g)', pricePaise: 4500, qty: 1 },
    { id: 'p-104', name: 'Tata Iodized Salt (1kg)', pricePaise: 2800, qty: 1 },
    { id: 'p-105', name: 'Bru Instant Coffee (100g)', pricePaise: 21500, qty: 1 },
    { id: 'p-106', name: 'Aashirvaad Select Atta (5kg)', pricePaise: 26500, qty: 1 }
  ]);

  // Audio timer simulation
  useEffect(() => {
    let timer: any;
    if (isPlayingAudio) {
      timer = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 14) {
            setIsPlayingAudio(false);
            return 14;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlayingAudio]);

  const toggleAudio = () => {
    if (audioProgress >= 14) setAudioProgress(0);
    setIsPlayingAudio(!isPlayingAudio);
  };

  const updateQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const subtotalPaise = cartItems.reduce((acc, item) => acc + (item.pricePaise * item.qty), 0);
  const deliveryFeePaise = subtotalPaise >= 50000 ? 0 : 4000;
  const totalPaise = subtotalPaise + deliveryFeePaise;

  const handleConfirmOrder = () => {
    setOrderConfirmed(true);
    setShowUpiModal(true);
  };

  const handleSimulatePayment = () => {
    // Simulates Razorpay webhook arrival (V-PAY-01)
    setTimeout(() => {
      setIsPaid(true);
      setShowUpiModal(false);
    }, 800);
  };

  const resetSimulator = () => {
    setIsPaid(false);
    setOrderConfirmed(false);
    setAudioProgress(0);
    setIsPlayingAudio(false);
    setCartItems([
      { id: 'p-102', name: 'Amul Taaza Toned Milk (1L)', pricePaise: 5600, qty: 2 },
      { id: 'p-103', name: 'Whole Wheat Bread (400g)', pricePaise: 4500, qty: 1 },
      { id: 'p-104', name: 'Tata Iodized Salt (1kg)', pricePaise: 2800, qty: 1 },
      { id: 'p-105', name: 'Bru Instant Coffee (100g)', pricePaise: 21500, qty: 1 },
      { id: 'p-106', name: 'Aashirvaad Select Atta (5kg)', pricePaise: 26500, qty: 1 }
    ]);
  };

  return (
    <div className="relative w-full max-w-[430px] mx-auto select-none">
      {/* Hand-drawn Floating Callouts from original design */}
      <div className="hidden lg:flex absolute -top-4 -left-28 flex-col items-center pointer-events-none rotate-[-6deg] z-20">
        <span className="font-mono text-xs font-semibold bg-amber-soft border-[1.5px] border-sketch px-2.5 py-1 rounded-full shadow-sketchSm text-amber-dark">
          Voice note in Hinglish
        </span>
        <CurvedArrowDoodle className="w-16 h-10 text-forest mt-1" />
      </div>

      <div className="hidden lg:flex absolute top-36 -right-28 flex-col items-center pointer-events-none rotate-[4deg] z-20">
        <span className="font-mono text-xs font-semibold bg-amber-soft border-[1.5px] border-sketch px-2.5 py-1 rounded-full shadow-sketchSm text-amber-dark">
          Handwritten list OCR
        </span>
        <CurvedArrowDoodle className="w-16 h-10 text-forest mt-1" flip />
      </div>

      {/* Main WhatsApp Phone Frame */}
      <div className="bg-[#EFEAE2] border-[2.5px] border-sketch rounded-[32px] overflow-hidden shadow-[10px_10px_0px_#0A3622]">
        {/* WhatsApp Header */}
        <div className="bg-forest text-white px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-mint-dark flex items-center justify-center text-forest border border-emerald-light">
              <ShoppingBag className="w-5 h-5 text-forest" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight">
                <span>FreshBasket Kirana</span>
                <span className="inline-block p-0.5 bg-emerald rounded-full text-white" title="Verified Business">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
              <span className="block text-[11px] text-emerald-light font-mono">
                AI Sales Assistant · Live Stock Synced
              </span>
            </div>
          </div>
          <button 
            onClick={resetSimulator}
            title="Reset Simulation"
            className="p-1.5 hover:bg-forest-card rounded-full text-white/80 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Canvas with Wallpaper Dots */}
        <div className="p-3.5 flex flex-col gap-3 min-h-[510px] max-h-[600px] overflow-y-auto wa-canvas-dots">
          
          {/* 1. Customer Voice Note Bubble */}
          <div className="self-end max-w-[88%] bg-[#DCF8C6] border border-[#B7E49C] rounded-2xl rounded-br-xs p-3 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1.5">
              <button
                type="button"
                onClick={toggleAudio}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-forest shadow-xs hover:scale-105 active:scale-95 transition-transform"
                aria-label={isPlayingAudio ? "Pause voice note" : "Play voice note"}
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5 fill-forest" /> : <Play className="w-3.5 h-3.5 fill-forest ml-0.5" />}
              </button>
              <div className={`transition-opacity ${isPlayingAudio ? 'opacity-100 animate-pulse text-emerald-dark' : 'opacity-70 text-forest'}`}>
                <VoiceWaveDoodle className="w-24 h-5" />
              </div>
              <span className="font-mono text-[11px] text-ink-secondary ml-auto">
                0:{audioProgress < 10 ? `0${audioProgress}` : audioProgress} / 0:14
              </span>
            </div>
            <p className="text-xs text-[#1E3A2B] italic bg-white/50 p-1.5 rounded-lg border border-black/5 leading-snug">
              &quot;Bhaiya, send my usual groceries plus two packets of Amul Taaza milk and this item from my list.&quot;
            </p>
          </div>

          {/* 2. Customer Handwritten List Image */}
          <div className="self-end max-w-[88%] bg-[#DCF8C6] border border-[#B7E49C] rounded-2xl rounded-br-xs p-2.5 shadow-sm">
            <div 
              onClick={() => setShowOcrDetails(!showOcrDetails)}
              className="bg-[#FFFDF7] border border-dashed border-gray-400 rounded-xl p-2.5 cursor-pointer hover:border-forest transition-colors"
            >
              <div className="font-mono text-[11px] text-gray-800 space-y-1 pb-1.5 border-b border-gray-200">
                <div className="flex justify-between">
                  <span>1. Tata Salt — 1 kg</span>
                  <span className="text-emerald-dark font-semibold">96%</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Bru Coffee — 100g</span>
                  <span className="text-emerald-dark font-semibold">91%</span>
                </div>
                <div className="flex justify-between">
                  <span>3. Aashirvaad Atta — 5kg</span>
                  <span className="text-emerald-dark font-semibold">95%</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1.5">
                <span className="text-[10px] font-bold text-emerald-dark uppercase tracking-wider font-mono">
                  ✨ Gemini Vision OCR · 3 SKUs Matched
                </span>
                <span className="text-[10px] text-ink-muted underline">
                  {showOcrDetails ? 'Hide' : 'Inspect'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. AI Assistant Response with Verified Interactive Cart */}
          <div className="self-start max-w-[94%] bg-white border border-border-light rounded-2xl rounded-bl-xs p-3 shadow-sm">
            <p className="text-xs text-ink-primary mb-2 font-medium">
              Prepared your <strong className="text-forest">My Usual</strong> basket and matched your handwritten list with live store stock:
            </p>

            {/* Verified Cart Box */}
            <div className="bg-[#F8FAF9] border border-border-light rounded-xl p-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-border-light mb-2">
                <span className="font-bold text-xs text-forest">Verified Store Cart ({cartItems.length} Items)</span>
                <span className="bg-mint-dark text-[#065F46] font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border border-mint-border">
                  Live Stock Synced
                </span>
              </div>

              {/* Editable items list */}
              <div className="space-y-1.5 mb-2.5 text-xs">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-0.5 border-b border-gray-100 last:border-none">
                    <span className="text-ink-secondary truncate max-w-[170px]">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-300 rounded bg-white">
                        <button 
                          onClick={() => updateQty(item.id, -1)} 
                          className="px-1.5 py-0.5 text-xs font-bold text-forest hover:bg-tinted"
                          disabled={isPaid}
                        >
                          -
                        </button>
                        <span className="px-1 font-mono text-[11px] font-semibold">{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item.id, 1)} 
                          className="px-1.5 py-0.5 text-xs font-bold text-forest hover:bg-tinted"
                          disabled={isPaid}
                        >
                          +
                        </button>
                      </div>
                      <strong className="font-mono text-ink-primary w-12 text-right">
                        ₹{((item.pricePaise * item.qty) / 100).toFixed(0)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery & Total */}
              <div className="pt-2 border-t border-dashed border-border-light flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-ink-muted text-[11px]">
                  <span>Delivery Charge</span>
                  <span>{deliveryFeePaise === 0 ? <strong className="text-emerald-dark">FREE (Order &gt; ₹500)</strong> : `₹${deliveryFeePaise / 100}`}</span>
                </div>
                <div className="flex justify-between font-bold text-forest text-sm pt-1 border-t border-border-light">
                  <span>Grand Total</span>
                  <span className="font-mono">₹{(totalPaise / 100).toFixed(0)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3">
                {isPaid ? (
                  <div className="bg-mint-dark border border-emerald text-emerald-dark p-2 rounded-lg text-center font-bold text-xs flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-dark" />
                    <span>Payment Verified · Order #ORD-8892 Created!</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmOrder}
                      className="bg-emerald hover:bg-emerald-dark text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <span>Confirm & Pay UPI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("WhatsApp Flows: Address selector & slot picker modal triggered.")}
                      className="bg-white border border-border-light text-forest font-semibold text-xs py-2 px-3 rounded-lg hover:bg-tinted transition-colors"
                    >
                      Select Address Flow
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Payment confirmation receipt bubble */}
          {isPaid && (
            <div className="self-start max-w-[94%] bg-white border border-border-light rounded-2xl rounded-bl-xs p-3 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-dark font-bold text-xs mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Order Placed & Scheduled!</span>
              </div>
              <p className="text-xs text-ink-secondary leading-snug">
                Thank you Ramesh ji! Your order <strong>#ORD-8892</strong> is confirmed. Fresh delivery arriving today by <strong>07:30 PM</strong>.
              </p>
              <div className="mt-2 pt-2 border-t border-border-light flex justify-between text-[11px] font-mono text-ink-muted">
                <span>UTR: 439019284102</span>
                <span className="text-forest font-semibold">Track in WhatsApp</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulated UPI Payment Modal (Razorpay / WhatsApp Pay simulator) */}
      {showUpiModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-[32px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-[320px] shadow-2xl border-2 border-forest">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald"></span>
                <span className="font-bold text-sm text-forest">Razorpay / UPI Gateway</span>
              </div>
              <button onClick={() => setShowUpiModal(false)} className="text-ink-muted hover:text-ink-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-tinted p-3 rounded-xl mb-3 text-center">
              <span className="text-xs text-ink-muted block">Paying to FreshBasket Kirana</span>
              <strong className="text-2xl font-mono text-forest">₹{(totalPaise / 100).toFixed(0)}</strong>
              <span className="text-[10px] text-ink-secondary block mt-0.5">Order ID: ORD-8892 · Verified Webhook</span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="p-2 border border-emerald rounded-lg bg-mint-light flex items-center justify-between text-xs cursor-pointer">
                <span className="font-semibold text-forest">GPay / PhonePe / Paytm</span>
                <span className="font-mono text-xs text-emerald-dark">Instant</span>
              </div>
              <div className="p-2 border border-border-light rounded-lg flex items-center justify-between text-xs text-ink-muted">
                <span>WhatsApp Pay UPI</span>
                <span className="text-[11px]">In-Chat</span>
              </div>
            </div>

            <button
              onClick={handleSimulatePayment}
              className="w-full bg-forest hover:bg-forest-hover text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Simulate Verified Webhook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

