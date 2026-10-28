import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Users, ShieldCheck } from 'lucide-react';

export function TeamPreview({ branding }) {
  const groupPhotoUrl = branding?.groupPhotoUrl || '/assets/aces-team.jpg';

  return (
    <section className="py-20 bg-navy-900/60 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-navy-850/90 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-electric-cyan">
              ACES COMMITTEE 2026-27
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Driven by Students, <br />
              <span className="text-gradient">Guided by Faculty.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              The ACES executive committee brings together students from second to final year, organizing technical activities, coding hackathons, industry visits, and placement assistance.
            </p>
            <div className="pt-2">
              <Link
                to="/team"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric-blue hover:bg-blue-600 text-white text-xs font-bold transition-colors"
              >
                <span>View Full Committee</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-navy-950 border border-white/10 shadow-2xl">
              <img
                src={groupPhotoUrl}
                alt="ACES Team Group"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TeamPreview;
