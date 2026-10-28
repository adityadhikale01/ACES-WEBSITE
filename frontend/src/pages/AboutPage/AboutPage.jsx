import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, GraduationCap, ShieldCheck, Target, Sparkles, ArrowUpRight } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-electric-cyan">
            <span>ABOUT ACES KBTCOE</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            More Than <br />
            <span className="text-gradient">A Committee.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            ACES — the <strong className="text-white">Association of Computer Engineering Students</strong> — is a student-driven initiative focused on creating a stronger academic, technical, and professional environment within the Department of Computer Engineering at MVPS's KBTCOE, Nashik.
          </p>
        </div>

        {/* Institutional Affiliation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-navy-850/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-electric-blue/10 flex items-center justify-center text-electric-cyan">
              <Building2 size={20} />
            </div>
            <h3 className="text-sm font-bold text-white">Institution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maratha Vidya Prasarak Samaj's Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering (MVPS's KBTCOE), Nashik.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-850/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-electric-cyan/10 flex items-center justify-center text-electric-cyan">
              <GraduationCap size={20} />
            </div>
            <h3 className="text-sm font-bold text-white">Department</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Department of Computer Engineering, dedicated to producing future-ready software engineers and innovators.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-850/80 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-white">Official Term</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ACES Academic Committee Term 2026 - 27 under faculty supervision and student leadership.
            </p>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-navy-850/80 border border-slate-800 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-electric-cyan uppercase tracking-wider">
              <Target size={15} />
              <span>OUR VISION</span>
            </div>
            <h3 className="text-xl font-bold text-white">Technically Strong, Creatively Curious</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "Build a community of computer engineering students who are technically strong, creatively curious, and equipped to lead modern technology domains."
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-navy-850/80 border border-slate-800 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-electric-cyan uppercase tracking-wider">
              <Sparkles size={15} />
              <span>OUR MISSION</span>
            </div>
            <h3 className="text-xl font-bold text-white">From Classroom to Concrete Impact</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              To organize hands-on technical workshops, competitive hackathons, industry sessions, and peer learning circles that bridge classroom curriculum with industry reality.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-10 rounded-3xl bg-navy-850 border border-slate-800 text-center space-y-4 max-w-xl mx-auto">
          <h3 className="text-xl font-bold text-white">Meet the Committee</h3>
          <p className="text-xs text-slate-400">
            Learn more about the office bearers and student coordinators driving ACES 2026-27.
          </p>
          <div className="pt-2">
            <Link
              to="/team"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-electric-blue hover:bg-blue-600 text-white font-bold text-xs transition-colors"
            >
              <span>View Committee Members</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
