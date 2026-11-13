import React, { useState } from 'react';
import { CalendarCheck, Clock, CheckCircle2, AlertCircle, Phone, Plus, ArrowRight, UserCheck } from 'lucide-react';
import { Lead } from '../types';
import { mockLeads } from '../data/mockData';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = leads.filter(l => {
    if (statusFilter === 'all') return true;
    return l.status === statusFilter;
  });

  return (
    <div className="max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-light">
        <div>
          <h1 className="font-bold text-2xl text-ink-primary">Lead Pipeline &amp; Consultations</h1>
          <p className="text-xs text-ink-secondary">
            High-ticket lead qualification mode with 24/7 conversational slot booking on Google Calendar (Module I / Phase 14).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs bg-amber-soft text-amber-dark font-bold px-3 py-1.5 rounded-xl border border-amber-300">
            Google Calendar API: Synced
          </span>
        </div>
      </div>

      {/* Stage Filters */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold bg-white p-2 rounded-2xl border border-border-light">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${statusFilter === 'all' ? 'bg-forest text-white' : 'text-ink-secondary hover:bg-tinted'}`}
        >
          All Leads ({leads.length})
        </button>
        <button
          onClick={() => setStatusFilter('appointment_booked')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${statusFilter === 'appointment_booked' ? 'bg-mint text-forest' : 'text-ink-secondary hover:bg-tinted'}`}
        >
          Booked Consultations
        </button>
        <button
          onClick={() => setStatusFilter('qualifying')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap ${statusFilter === 'qualifying' ? 'bg-amber-soft text-amber-dark' : 'text-ink-secondary hover:bg-tinted'}`}
        >
          Qualifying Active
        </button>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredLeads.map(lead => (
          <div key={lead.id} className="card-sketch bg-white p-5 flex flex-col justify-between hover:shadow-sketchLg transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                  lead.status === 'appointment_booked' ? 'bg-mint text-emerald-dark' :
                  lead.status === 'qualifying' ? 'bg-amber-soft text-amber-dark' :
                  'bg-tinted text-ink-primary'
                }`}>
                  {lead.status.replace(/_/g, ' ')}
                </span>
                <span className="text-[11px] text-ink-muted">{lead.createdAt}</span>
              </div>

              <h3 className="font-bold text-base text-ink-primary mb-1">{lead.name}</h3>
              <span className="font-mono text-xs text-ink-muted block mb-3">{lead.phone}</span>

              <div className="space-y-2 bg-canvas p-3 rounded-xl border border-border-light text-xs mb-4">
                <div>
                  <span className="text-[10px] uppercase font-mono text-ink-muted block">Requirement</span>
                  <strong className="text-forest">{lead.requirement}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-border-light text-[11px]">
                  <span>Budget: <strong>{lead.budgetRange}</strong></span>
                  <span>Timeline: <strong>{lead.timeline}</strong></span>
                </div>
              </div>

              {lead.bookedSlot && (
                <div className="bg-mint-dark p-2.5 rounded-xl border border-mint-border text-xs mb-3">
                  <div className="flex items-center gap-1.5 font-bold text-forest mb-0.5">
                    <CalendarCheck className="w-4 h-4 text-emerald-dark" />
                    <span>Google Calendar Confirmed</span>
                  </div>
                  <span className="text-[11px] font-mono text-ink-secondary block">
                    {lead.bookedSlot.date} at {lead.bookedSlot.time}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-dashed border-border-light">
              <span className="text-[10px] font-mono text-ink-muted block mb-1 font-semibold">
                Stop-Aware Sequence:
              </span>
              <p className="text-[11px] text-ink-secondary mb-3 leading-snug">
                {lead.followUpStep}
              </p>
              {lead.stopFollowUp && (
                <span className="inline-block text-[10px] font-mono font-bold bg-mint text-emerald-dark px-2 py-0.5 rounded">
                  ✓ Follow-ups stopped (Lead converted)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

