import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Code2, Users2, Sparkles, ArrowUpRight } from 'lucide-react';

const pillars = [
  {
    number: '01',
    title: 'LEARN',
    tag: 'Technical Foundation',
    desc: 'Creating continuous opportunities for students to strengthen their foundations in DSA, web architecture, AI, and systems engineering.',
    icon: BookOpen,
    bullets: ['Data Structures & Algorithms', 'AI & Machine Learning', 'Cloud & Emerging Tech', 'Technical Workshops'],
  },
  {
    number: '02',
    title: 'BUILD',
    tag: 'Practical Experience',
    desc: 'Learning becomes powerful when applied. We encourage turning concepts into working software, student projects, and hackathon prototypes.',
    icon: Code2,
    bullets: ['Departmental Hackathons', 'Open Source Projects', 'Web & Mobile Dev', 'Technical Challenges'],
  },
  {
    number: '03',
    title: 'CONNECT',
    tag: 'Student Community',
    desc: 'Bringing computer engineering students together through peer-to-peer mentoring, senior guidance, and alumni industry talks.',
    icon: Users2,
    bullets: ['Peer Code Reviews', 'Senior-Junior Mentorship', 'Alumni Tech Talks', 'Study Circles'],
  },
  {
    number: '04',
    title: 'LEAD',
    tag: 'Real-World Impact',
    desc: 'Nurturing engineering students who take ownership, manage complex initiatives, and create a lasting legacy for the department.',
    icon: Sparkles,
    bullets: ['Event Organization', 'Public Speaking', 'Team Leadership', 'Community Outreach'],
  },
];

export const AboutSection = () => {
  return (
    <section className="py-24 bg-navy-900/90 relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-electric-cyan text-xs font-bold uppercase tracking-widest">
              <span>01 • ABOUT ACES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              More Than <span className="text-gradient">A Committee.</span>
            </h2>
          </div>
          <p className="text-sm text-slate-300 max-w-md leading-relaxed">
            ACES is a student-driven initiative focused on creating a vibrant technical, academic, and collaborative culture within the Department of Computer Engineering at KBTCOE.
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between border border-white/10 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-slate-600 group-hover:text-electric-cyan transition-colors">
                      {pillar.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-electric-cyan group-hover:bg-electric-blue/20 transition-colors">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-electric-cyan transition-colors">
                    {pillar.title}
                  </h3>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
                    {pillar.tag}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-1.5">
                  {pillar.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-electric-cyan/60" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Vision Banner */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-navy-850 to-navy-800 border border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-electric-cyan">
              ACES VISION 2026 - 27
            </span>
            <p className="text-lg sm:text-xl font-medium text-white italic">
              "Build a community of students who are technically strong, creatively curious, and equipped to lead."
            </p>
          </div>
          <Link
            to="/about"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold tracking-wide border border-white/10 transition-colors flex-shrink-0"
          >
            <span>Learn More About ACES</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};
export default AboutSection;
