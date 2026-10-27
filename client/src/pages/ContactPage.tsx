import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { api } from '../services/api.js';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const res = await api.contact.submit({ name, email, subject, message });
      if (res.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit contact message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-electric-cyan font-semibold">
            <MessageSquare size={13} />
            <span>GET IN TOUCH WITH ACES</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Connect & <span className="text-gradient">Collaborate</span>
          </h1>
          <p className="text-base text-slate-300 leading-relaxed font-normal">
            Have questions about upcoming workshops, event partnerships, club sponsorship, or departmental activities? Send us a message and our team will get back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Verified Contact Details & Campus Map Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
              <h3 className="text-base font-bold text-white border-b border-white/5 pb-3">
                Official Club Coordinates
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-electric-cyan/15 text-electric-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block mb-0.5">Department Office</span>
                    <p className="text-slate-400 leading-relaxed">
                      ACES Cabin, Department of Computer Engineering, MVPS's KBT College of Engineering,
                      Udoji Maratha Boarding Campus, Gangapur Road, Nashik - 422013, Maharashtra.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-electric-blue/15 text-electric-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block mb-0.5">Official Email</span>
                    <a
                      href="mailto:aces.kbtcoe@gmail.com"
                      className="text-slate-300 hover:text-electric-cyan transition-colors"
                    >
                      aces.kbtcoe@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-white block mb-0.5">College Helpline</span>
                    <span className="text-slate-400">+91 253 2571439 / +91 253 2582891</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-navy-850 border border-white/10 space-y-3">
              <h4 className="text-white font-bold text-sm">Working Hours</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monday to Friday: 9:30 AM to 5:00 PM <br />
                Saturday: 9:30 AM to 1:30 PM (Except official holidays)
              </p>
            </div>
          </div>

          {/* Right Column: Working Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-card p-8 rounded-3xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-2">Send Us a Direct Message</h3>
              <p className="text-xs text-slate-400 mb-6">
                Your message will be sent directly to the club executive committee.
              </p>

              {success && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs mb-6 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Thank you! Your inquiry has been sent to ACES KBTCOE. We will respond soon.</span>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs mb-6 flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Atharva Patil"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1.5">Your Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Query regarding CodeRush 2026 / Hackathon"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Message Content *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your query or message here (min 10 characters)..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-electric-cyan"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold text-xs shadow-lg shadow-electric-blue/25 hover:shadow-electric-blue/40 transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    <span>{submitting ? 'Sending Message...' : 'Send Message to ACES'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
