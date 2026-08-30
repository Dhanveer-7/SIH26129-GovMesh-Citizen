import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Send, HeartHandshake } from 'lucide-react';

export const Help: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const [ticket, setTicket] = useState({
    subject: '',
    message: '',
    category: 'general'
  });
  const [ticketStatus, setTicketStatus] = useState<string | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketStatus("submitting");
    setTimeout(() => {
      setTicketStatus("success");
      setTicket({ subject: '', message: '', category: 'general' });
    }, 1500);
  };

  const faqs = [
    {
      q: "What is GovMesh?",
      a: "GovMesh is an interoperability and service-orchestration platform. It connects separate government registries (like land records, ration systems, and local bodies) so that a citizen request updating core details (like address change) is automatically coordinated without the citizen visiting multiple department portals."
    },
    {
      q: "How does consent work?",
      a: "Data is never shared silently. When a service is requested, GovMesh displays precisely which data fields are needed by each department. The citizen must authorize access by granting consent. You can also revoke consents at any time in the History tab, which instantly disconnects department access."
    },
    {
      q: "Which departments can participate?",
      a: "Currently, the prototype Sandbox has active registries configured for the Revenue Department, the Food & Civil Supplies Department, and the Rural Development Department. Future additions will support urban local bodies and transportation portals."
    },
    {
      q: "How is my data protected?",
      a: "GovMesh does not create a centralized storage warehouse of citizen documents. It maps schemas and transfers validated proof metadata dynamically. All transactions are logged in an append-only transparency ledger to maintain audit control."
    },
    {
      q: "What happens if a department system is unavailable?",
      a: "If a department server crashes or experiences a maintenance downtime, GovMesh does not lose your application. The request is quarantined and queued in our recovery system, which retries the connection automatically. Citizens see retry statuses on the tracking page without stack traces."
    },
    {
      q: "Can I track multiple applications?",
      a: "Yes. Every request initiates a unified workflow with a unique tracking number (e.g. GM-2026-000124). You can search and track multiple previous and active timelines from the tracking tab."
    }
  ];

  return (
    <div className="space-y-6 py-2">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Help & Support Desk</h1>
        <p className="text-xs text-slate-550 font-semibold mt-1">
          Find answers to frequently asked questions about the GovMesh interoperability core, or submit support tickets to the mock help desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FAQs list */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-450">
            Frequently Asked Questions
          </h3>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-gov-sm">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-4.5 flex justify-between items-center hover:bg-slate-50 transition"
                  >
                    <span className="font-extrabold text-xs text-slate-800 leading-snug">
                      {faq.q}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4.5 pb-4.5 pt-0 border-t border-slate-100/50">
                      <p className="text-xs text-slate-550 mt-3.5 leading-relaxed font-semibold">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact form */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-450">
            Submit Support Ticket
          </h3>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-gov-sm space-y-4">
            
            {ticketStatus === 'success' && (
              <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-lg text-xs font-bold text-emerald-800 text-center animate-pulse">
                ✓ Ticket submitted successfully to GovMesh Support.
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-650">Help Category</label>
                <select
                  value={ticket.category}
                  onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gov-secondary bg-slate-50 font-semibold"
                >
                  <option value="general">General Query</option>
                  <option value="consent">Consent & Privacy</option>
                  <option value="ocr">OCR / Document Scan Mismatch</option>
                  <option value="retry">Retry / Offline Department issue</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-650">Subject</label>
                <input
                  type="text"
                  value={ticket.subject}
                  onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                  placeholder="e.g. Blurry scan uploaded by mistake"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gov-secondary bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-650">Message Details</label>
                <textarea
                  rows={4}
                  value={ticket.message}
                  onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                  placeholder="Provide detailed description..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-gov-secondary bg-slate-50 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={ticketStatus === 'submitting'}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-gov-primary hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-gov-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{ticketStatus === 'submitting' ? 'Submitting...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
