import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const JoinCta: React.FC = () => {
  return (
    <section className="py-24 bg-navy-950 relative border-t border-slate-800/80 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-electric-blue/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric-blue/15 border border-electric-blue/30 text-xs text-electric-cyan font-semibold">
          <Sparkles size={13} />
          <span>JOIN THE DEPARTMENTAL COMMUNITY</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Ready to Build, Learn, & Lead <br />
          <span className="text-gradient">with ACES KBTCOE?</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Whether you want to organize flagship events, lead technical workshops, solve competitive programming problems, or develop open-source projects—ACES is your launchpad.
        </p>

        {/* Benefits micro-list */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-300 pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Priority access to technical workshops</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Departmental hackathon mentorship</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Leadership & certificate recognitions</span>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/join"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold text-sm shadow-xl shadow-electric-blue/25 hover:shadow-electric-blue/40 hover:-translate-y-0.5 transition-all"
          >
            <span>Apply For ACES Membership</span>
            <ArrowUpRight size={16} />
          </Link>

          <Link
            to="/contact"
            className="flex items-center gap-2 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
          >
            <span>Have Questions? Contact Us</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
