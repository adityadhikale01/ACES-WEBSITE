import React from 'react';
import { Form, useActionData, useNavigation } from 'react-router-dom';
import { CheckCircle, AlertCircle, Sparkles, Send } from 'lucide-react';

export function ApplyPage() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-electric-cyan">
            <span>MEMBERSHIP RECRUITMENT 2026-27</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Join the <span className="text-gradient">ACES Committee.</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Become an active student coordinator in the Department of Computer Engineering. Build real technical projects, manage departmental events, and develop leadership experience.
          </p>
        </div>

        {/* Status Alerts */}
        {actionData?.error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{actionData.error}</span>
          </div>
        )}

        {actionData?.success ? (
          <div className="p-8 rounded-3xl bg-navy-850 border border-emerald-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Application Received!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Thank you for applying to the ACES committee. Our leadership team will review your application and contact you via email.
            </p>
          </div>
        ) : (
          <div className="p-8 sm:p-10 rounded-3xl bg-navy-850/80 border border-slate-800">
            <Form method="post" className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Aditya Patil"
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. student@kbtcoe.in"
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">WhatsApp Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="10-digit number"
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Academic Year *</label>
                  <select
                    name="academicYear"
                    required
                    defaultValue="SE"
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric-blue"
                  >
                    <option value="FE">First Year (FE)</option>
                    <option value="SE">Second Year (SE)</option>
                    <option value="TE">Third Year (TE)</option>
                    <option value="BE">Final Year (BE)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">PRN (Optional)</label>
                  <input
                    type="text"
                    name="prn"
                    placeholder="e.g. 7210..."
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">
                  Why do you want to join the ACES committee? *
                </label>
                <textarea
                  name="whyJoin"
                  required
                  rows={4}
                  placeholder="Tell us what motivates you to contribute to departmental events and activities..."
                  className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">
                    Technical or Creative Skills
                  </label>
                  <input
                    type="text"
                    name="technicalSkills"
                    placeholder="e.g. React, Python, UI Design, Video Editing"
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">
                    Past Experience / Contributions
                  </label>
                  <input
                    type="text"
                    name="pastExperience"
                    placeholder="e.g. Volunteering in tech fest, school club"
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold text-xs uppercase tracking-wider hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-electric-blue/20 flex items-center justify-center gap-2"
              >
                <Send size={15} />
                <span>{isSubmitting ? 'Submitting Application...' : 'Submit Membership Application'}</span>
              </button>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplyPage;
