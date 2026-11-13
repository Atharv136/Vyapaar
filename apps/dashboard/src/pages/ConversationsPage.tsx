import React, { useState } from 'react';
import { Send, UserCheck, Bot, AlertTriangle, ShieldCheck, Phone, CheckCircle, Volume2, Camera, Sparkles, ArrowRight } from 'lucide-react';
import { Conversation, ChatMessage } from '../types';

interface ConversationsPageProps {
  conversations: Conversation[];
  onUpdateConversation: (updated: Conversation) => void;
}

export const ConversationsPage: React.FC<ConversationsPageProps> = ({
  conversations,
  onUpdateConversation
}) => {
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id || '');
  const [filter, setFilter] = useState<'all' | 'escalated' | 'ai' | 'human'>('all');
  const [replyText, setReplyText] = useState<string>('');

  const activeConv = conversations.find(c => c.id === selectedId) || conversations[0];

  const filteredConversations = conversations.filter(c => {
    if (filter === 'escalated') return c.status === 'escalated';
    if (filter === 'ai') return c.mode === 'ai';
    if (filter === 'human') return c.mode === 'human';
    return true;
  });

  const handleToggleTakeover = () => {
    if (!activeConv) return;
    const newMode = activeConv.mode === 'ai' ? 'human' : 'ai';
    const newStatus = newMode === 'human' ? 'active' : activeConv.status;
    
    const updated: Conversation = {
      ...activeConv,
      mode: newMode,
      status: newStatus
    };
    onUpdateConversation(updated);
  };

  const handleSendMerchantReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;

    const newMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      conversationId: activeConv.id,
      sender: 'merchant',
      type: 'text',
      content: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated: Conversation = {
      ...activeConv,
      messages: [...activeConv.messages, newMsg],
      lastMessageSnippet: replyText,
      // If escalated, merchant reply resolves it
      status: activeConv.status === 'escalated' ? 'active' : activeConv.status
    };

    onUpdateConversation(updated);
    setReplyText('');
  };

  const handleInsertSuggestedReply = () => {
    if (activeConv?.suggestedReply) {
      setReplyText(activeConv.suggestedReply);
    }
  };

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8">
      {/* Title */}
      <div className="pb-4 mb-4 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-2xl text-ink-primary">Live Conversations &amp; CRM</h1>
          <p className="text-xs text-ink-secondary">
            Shared WhatsApp inbox with automated AI handling and Human-in-the-Loop takeover (V-ESC-01).
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-border-light text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${filter === 'all' ? 'bg-forest text-white' : 'text-ink-secondary hover:text-forest'}`}
          >
            All ({conversations.length})
          </button>
          <button
            onClick={() => setFilter('escalated')}
            className={`px-3 py-1 rounded-lg transition-colors ${filter === 'escalated' ? 'bg-coral-dark text-white' : 'text-ink-secondary hover:text-coral-dark'}`}
          >
            Escalations
          </button>
          <button
            onClick={() => setFilter('ai')}
            className={`px-3 py-1 rounded-lg transition-colors ${filter === 'ai' ? 'bg-mint text-forest' : 'text-ink-secondary hover:text-forest'}`}
          >
            AI Active
          </button>
          <button
            onClick={() => setFilter('human')}
            className={`px-3 py-1 rounded-lg transition-colors ${filter === 'human' ? 'bg-amber-soft text-amber-dark' : 'text-ink-secondary hover:text-amber-dark'}`}
          >
            Human Active
          </button>
        </div>
      </div>

      {/* Main Master-Detail Box */}
      <div className="card-sketch bg-white grid grid-cols-1 md:grid-cols-12 min-h-[640px] overflow-hidden shadow-sketchLg">
        
        {/* Left: Conversations List (4 cols) */}
        <div className="md:col-span-4 border-r border-border-light flex flex-col bg-[#FAFBF9]">
          <div className="p-3 border-b border-border-light font-mono text-[11px] uppercase tracking-wider text-ink-muted">
            Incoming WhatsApp Threads
          </div>

          <div className="divide-y divide-border-light overflow-y-auto flex-1">
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`p-4 cursor-pointer transition-colors text-left ${
                  conv.id === activeConv?.id ? 'bg-mint-dark/50 ring-1 ring-inset ring-forest/20' : 'hover:bg-tinted'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-ink-primary truncate max-w-[150px]">
                    {conv.customerName}
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted">
                    {conv.lastCustomerMessageAt}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[10px] text-ink-secondary">
                    {conv.customerPhone}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold uppercase ${
                    conv.mode === 'human'
                      ? 'bg-amber-soft text-amber-dark border border-amber-300'
                      : 'bg-mint-dark text-emerald-dark'
                  }`}>
                    {conv.mode === 'human' ? '🧑 Human' : '🤖 AI Mode'}
                  </span>
                  {conv.status === 'escalated' && (
                    <span className="bg-coral-soft text-coral-dark text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      Urgent
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-ink-secondary line-clamp-1">
                  {conv.lastMessageSnippet}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Chat Area (8 cols) */}
        {activeConv ? (
          <div className="md:col-span-8 flex flex-col bg-white">
            
            {/* Conversation Header & Takeover Action Strip */}
            <div className="p-4 border-b border-border-light flex flex-wrap items-center justify-between gap-3 bg-canvas">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mint border border-forest flex items-center justify-center font-bold text-forest">
                  {activeConv.customerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm text-ink-primary">{activeConv.customerName}</h2>
                    <span className="text-xs text-ink-muted font-mono">{activeConv.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-ink-secondary font-medium">Vertical: {activeConv.vertical}</span>
                    <span>•</span>
                    <span className="text-emerald-dark font-mono">Meta Verified WABA</span>
                  </div>
                </div>
              </div>

              {/* Mode Switcher: "Take Over" vs "Hand Back to AI" */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleTakeover}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                    activeConv.mode === 'ai'
                      ? 'bg-amber-DEFAULT hover:bg-amber-500 text-black border border-sketch'
                      : 'bg-forest hover:bg-forest-hover text-white'
                  }`}
                >
                  {activeConv.mode === 'ai' ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Take Over (Silence AI)</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5" />
                      <span>Hand Back to AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Takeover Mode Warning Banner (Rule 8 & V-ESC-01) */}
            {activeConv.mode === 'human' && (
              <div className="bg-amber-soft border-b border-amber-300 p-2.5 px-4 text-xs text-amber-dark font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-DEFAULT animate-ping"></span>
                  <span><strong>Human Mode Active (Rule 8):</strong> AI replies are silenced for this chat. Customer sees your manual replies.</span>
                </div>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-amber-300">
                  V-ESC-01 ACTIVE
                </span>
              </div>
            )}

            {/* Escalation Context Card (Step 10.5) */}
            {activeConv.status === 'escalated' && activeConv.aiSummary && (
              <div className="m-4 p-4 rounded-xl bg-coral-soft border border-coral-dark/30 text-xs">
                <div className="flex items-center justify-between mb-1.5 font-bold text-coral-dark">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>AI Escalation Dossier</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase">Low Confidence Handover</span>
                </div>
                <p className="text-ink-primary mb-2.5 leading-relaxed">
                  <strong>Trigger:</strong> {activeConv.escalationReason}
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-coral-200 text-ink-secondary mb-2.5 leading-relaxed">
                  <strong className="text-forest block mb-1">AI Context Summary:</strong>
                  {activeConv.aiSummary}
                </div>

                {activeConv.suggestedReply && (
                  <div className="flex items-center justify-between bg-mint p-2.5 rounded-lg border border-mint-border">
                    <div className="truncate mr-2">
                      <strong className="text-forest text-[11px] block">Suggested Merchant Response:</strong>
                      <span className="text-[11px] text-ink-secondary italic">{activeConv.suggestedReply}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleInsertSuggestedReply}
                      className="btn-forest px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap"
                    >
                      Use Response
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Chat Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 wa-canvas-dots">
              {activeConv.messages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'customer'
                      ? 'items-start'
                      : m.sender === 'system'
                      ? 'items-center'
                      : 'items-end'
                  }`}
                >
                  {m.sender === 'system' ? (
                    <div className="bg-tinted border border-border-light text-[10px] font-mono text-ink-muted px-3 py-1 rounded-full">
                      {m.content}
                    </div>
                  ) : (
                    <div className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-xs ${
                      m.sender === 'customer'
                        ? 'bg-[#DCF8C6] border border-[#B7E49C] text-ink-primary'
                        : m.sender === 'merchant'
                        ? 'bg-amber-soft border border-amber-300 text-ink-primary'
                        : 'bg-white border border-border-light text-ink-primary'
                    }`}>
                      {/* Sender label */}
                      <div className="flex items-center justify-between gap-3 text-[10px] mb-1 font-mono text-ink-muted">
                        <span className="font-bold uppercase">
                          {m.sender === 'customer' ? activeConv.customerName : m.sender === 'merchant' ? '🧑 You (Merchant)' : '🤖 VartaCart AI'}
                        </span>
                        <span>{m.timestamp}</span>
                      </div>

                      {/* Content by Type */}
                      {m.type === 'audio' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 p-1.5 bg-white/70 rounded-lg">
                            <Volume2 className="w-4 h-4 text-forest" />
                            <span className="font-mono text-[11px]">Audio Note ({m.audioDurationSec}s)</span>
                          </div>
                          {m.transcript && (
                            <p className="italic text-ink-secondary bg-white/40 p-1.5 rounded">
                              &quot;{m.transcript}&quot;
                            </p>
                          )}
                        </div>
                      )}

                      {m.type === 'image' && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-forest font-semibold">
                            <Camera className="w-4 h-4" />
                            <span>Customer Photo Attached</span>
                          </div>
                          {m.ocrLines && (
                            <div className="bg-[#FFFDF7] p-2 rounded border border-dashed border-gray-400 font-mono text-[11px] space-y-0.5">
                              {m.ocrLines.map((l, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{l.text}</span>
                                  <span className="text-emerald-dark font-bold">{(l.confidence * 100).toFixed(0)}%</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {m.type === 'text' && (
                        <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                      )}

                      {m.type === 'interactive_cart' && m.cartData && (
                        <div className="bg-[#F8FAF9] p-2.5 rounded-xl border border-border-light mt-1">
                          <span className="font-bold text-xs text-forest block mb-1">
                            WhatsApp Verified Cart ({m.cartData.items.length} items)
                          </span>
                          <ul className="divide-y divide-gray-100 text-[11px] mb-2">
                            {m.cartData.items.map((it, idx) => (
                              <li key={idx} className="py-1 flex justify-between">
                                <span>{it.name} × {it.quantity}</span>
                                <strong className="font-mono">₹{(it.pricePaise / 100).toFixed(0)}</strong>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-1.5 border-t border-border-light flex justify-between font-bold text-forest">
                            <span>Total</span>
                            <span className="font-mono">₹{(m.cartData.totalPaise / 100).toFixed(0)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Merchant Reply Field */}
            <form onSubmit={handleSendMerchantReply} className="p-3 border-t border-border-light bg-canvas flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={activeConv.mode === 'ai' ? "Type a message (will switch chat to Human mode)..." : "Reply directly to customer on WhatsApp..."}
                className="flex-1 bg-white border border-border-light rounded-xl px-4 py-2.5 text-xs text-ink-primary focus:outline-forest"
              />
              <button
                type="submit"
                className="btn-forest px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <span>Send WhatsApp</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center p-12 text-ink-muted text-xs">
            Select a conversation from the left inbox to view transcript and manage human takeover.
          </div>
        )}
      </div>
    </div>
  );
};
