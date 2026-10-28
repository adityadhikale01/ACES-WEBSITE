import React from 'react';
import { Form, useActionData, useNavigation } from 'react-router-dom';
import { Mail, MapPin, CheckCircle, AlertCircle, Send } from 'lucide-react';

export function ContactPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-electric-cyan">
            <span>GET IN TOUCH</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Contact <span className="text-gradient">ACES KBTCOE.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Have questions regarding upcoming workshops, event registration, sponsorship, or general inquiries? Send a message to our committee coordinators.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Info Card */}
          <div className="lg:col-span-5 space-y-6 p-8 rounded-3xl bg-navy-850/80 border border-slate-800">
            <h3 className="text-lg font-bold text-white">Department Information</h3>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-electric-cyan flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-white">Department of Computer Engineering</strong>
                  <br />
                  MVPS's Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering,
                  <br />
                  Udoji Maratha Boarding Campus, Gangapur Road, Nashik - 422013, Maharashtra.
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={18} className="text-electric-cyan flex-shrink-0" />
                <div>
                  <div className="text-slate-400">Official Committee Email</div>
                  <div className="font-semibold text-white">aces.kbtcoe@gmail.com</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
              <div className="font-semibold text-white">Office Hours</div>
              <p className="text-slate-400 leading-relaxed">
                Monday to Friday: 9:00 AM – 5:00 PM
                <br />
                Saturday: 9:00 AM – 1:00 PM
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-navy-850/80 border border-slate-800">
            {actionData?.error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{actionData.error}</span>
              </div>
            )}

            {actionData?.success ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <CheckCircle size={32} className="text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Inquiry Received!</h3>
                <p className="text-xs text-slate-400">
                  {actionData.message || 'Thank you for reaching out. We will get back to you shortly.'}
                </p>
              </div>
            ) : (
              <Form method="post" className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Rahul Patil"
                      className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">Your Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="e.g. Workshop Registration Query"
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Describe your inquiry or feedback..."
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold text-xs uppercase tracking-wider hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-electric-blue/20 flex items-center justify-center gap-2"
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Sending Message...' : 'Send Inquiry'}</span>
                </button>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
