import React from 'react';
import { BookOpen, Code2, Users2, Sparkles } from 'lucide-react';

export function Pillars() {
  const pillars = [
    {
      num: '01',
      title: 'LEARN',
      subtitle: 'Technical Foundation',
      desc: 'Hands-on workshops, seminars, and core skill development in modern software engineering.',
      icon: BookOpen,
    },
    {
      num: '02',
      title: 'BUILD',
      subtitle: 'Hackathons & Projects',
      desc: 'Coding sprints, prototype challenges, and practical execution of real-world solutions.',
      icon: Code2,
    },
    {
      num: '03',
      title: 'CONNECT',
      subtitle: 'Peer Circles & Mentorship',
      desc: 'Collaboration across academic years, faculty guidance, and direct interaction with industry seniors.',
      icon: Users2,
    },
    {
      num: '04',
      title: 'LEAD',
      subtitle: 'Student Leadership',
      desc: 'Organizing departmental initiatives, technical symposiums, and community outreach events.',
      icon: Sparkles,
    },
  ];

  return (
    <section className="py-20 bg-navy-900/60 border-t border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-electric-cyan">
            WHAT WE DO
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Four Pillars of <span className="text-gradient">ACES KBTCOE</span>
          </h2>
          <p className="text-sm text-slate-400">
            Guiding student engineers from foundational knowledge to competitive industry readiness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.num}
                className="p-6 rounded-2xl bg-navy-850/80 border border-slate-800 hover:border-electric-blue/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-electric-cyan">
                    {p.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-electric-blue/10 flex items-center justify-center text-electric-cyan group-hover:bg-electric-blue group-hover:text-white transition-colors">
                    <Icon size={18} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{p.title}</h3>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">{p.subtitle}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Pillars;
