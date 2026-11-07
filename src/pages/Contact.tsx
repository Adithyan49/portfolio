import React, { useState } from 'react';
import {
  Mail,
  MessageCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendContactMessage } from '../lib/supabaseClient';
import { directContact } from '../data/socialLinks';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // anti-spam field
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Spam honeypot check
    if (formData.honeypot) {
      return;
    }

    if (!formData.name.trim()) {
      setStatus({ type: 'error', message: 'Please enter your full name.' });
      return;
    }

    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    if (!formData.subject.trim()) {
      setStatus({ type: 'error', message: 'Please provide a message subject.' });
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setStatus({ type: 'error', message: 'Please write a message with at least 10 characters.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      if (result.success) {
        setStatus({
          type: 'success',
          message: 'Thank you! Your message has been securely recorded and dispatched to Adithyan.',
        });
        setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });

        // Trigger confetti celebration
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#7C5CFC', '#00D4FF', '#A78BFA'],
          });
        } catch {
          // ignore confetti error if canvas is restricted
        }
      } else {
        setStatus({
          type: 'error',
          message: 'Unable to deliver message right now. Please use the direct email or WhatsApp links below.',
        });
      }
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: 'A network error occurred. Please reach out via direct email or WhatsApp.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 pb-28 sm:pb-24">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00D4FF] mb-2 uppercase tracking-wider">
          <Mail className="w-4 h-4" />
          <span>Inquiries, Collaborations & Networking</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Let&apos;s <span className="text-gradient">Connect</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
          Interested in discussing an AI/ML project, hackathon collaboration, internship opportunity, or technical discussion? Reach out anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Direct Fast Channels (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick contact channels */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Direct Contact Channels
            </h3>

            {/* Direct Email Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-[#A78BFA] shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Official Email
                </span>
                <a
                  href={directContact.emailMailto}
                  className="text-sm font-semibold text-white hover:text-[#00D4FF] transition-colors truncate block"
                >
                  {directContact.email}
                </a>
                <p className="text-xs text-slate-400 mt-1">
                  Opens your default email client with pre-filled recipient.
                </p>
              </div>
            </div>

            {/* Direct WhatsApp Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Instant WhatsApp Chat
                </span>
                <a
                  href={directContact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-white hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 mt-0.5"
                >
                  <span>Chat Directly on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                </a>
                <p className="text-xs text-slate-400 mt-1">
                  Quick technical questions and real-time correspondence.
                </p>
              </div>
            </div>

            {/* Location & Academic Base */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-[#00D4FF] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Location & Campus
                </span>
                <p className="text-sm font-semibold text-white">
                  Sri Eshwar College of Engineering
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pollachi, Coimbatore, Tamil Nadu, India
                </p>
              </div>
            </div>
          </div>

          {/* Response Expectation Notice */}
          <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
            <Clock className="w-4 h-4 text-[#A78BFA] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">Response Time</span>
              Typically reply within 24 hours on weekdays. Messages submitted through the form are safely stored in the Supabase database.
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Secure Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 relative">
            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
              Send a Direct Message
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              All messages are encrypted in transit and securely stored in Adithyan&apos;s administrative mailbox.
            </p>

            {status.type && (
              <div
                className={`p-4 rounded-xl text-xs mb-6 flex items-start gap-2.5 ${
                  status.type === 'success'
                    ? 'bg-emerald-950/70 border border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/70 border border-rose-800/60 text-rose-300'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Anti-spam honeypot hidden from view */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                  Subject <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Project Collaboration / Internship Inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                  Message <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Type your message, query or collaboration proposal here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#7C5CFC] transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold rounded-xl text-white bg-gradient-to-r from-[#7C5CFC] to-[#00D4FF] hover:opacity-95 shadow-lg shadow-purple-950/40 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Encrypting & Sending...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
