import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ArrowUpRight, Award, Shield } from 'lucide-react';

export const TeamPreview: React.FC = () => {
  return (
    <section className="py-24 bg-navy-900/90 relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-electric-cyan text-xs font-bold uppercase tracking-widest">
              <span>03 • THE PEOPLE BEHIND ACES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Committee <span className="text-gradient">Team 2026-27</span>
            </h2>
          </div>
          <Link
            to="/team"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-electric-cyan hover:text-white transition-colors"
          >
            <span>View All Committee Members</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* Group Photo Feature Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-8 rounded-3xl overflow-hidden border border-white/10 bg-navy-850/80 p-3 shadow-2xl"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-navy-900 group">
              <img
                src="/assets/aces-team.jpg"
                alt="ACES KBTCOE Full Committee 2026-27"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                <span className="bg-navy-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/10 text-white font-medium">
                  Official ACES 2026-27 Group Photograph
                </span>
                <span className="text-[11px] text-slate-300 font-semibold hidden sm:inline-block">
                  KBTCOE Campus • Department of Computer Engineering
                </span>
              </div>
            </div>
          </motion.div>

          {/* Core Leadership Highlight */}
          <div className="lg:col-span-4 space-y-4">
            {/* President Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-navy-800 border border-white/10 flex-shrink-0">
                <img
                  src="/assets/members/President.jpeg"
                  alt="Aditya Dhikale - President"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-electric-cyan mb-0.5">
                  <Shield size={11} />
                  <span>PRESIDENT</span>
                </div>
                <h4 className="text-base font-bold text-white truncate">Aditya Dhikale</h4>
                <p className="text-xs text-slate-400">BE Computer Engineering</p>
              </div>
            </motion.div>

            {/* Vice President Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-navy-800 border border-white/10 flex-shrink-0">
                <img
                  src="/assets/members/VicePresident.png"
                  alt="Sammpana Kasar - Vice President"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-electric-cyan mb-0.5">
                  <Award size={11} />
                  <span>VICE PRESIDENT</span>
                </div>
                <h4 className="text-base font-bold text-white truncate">Sammpana Kasar</h4>
                <p className="text-xs text-slate-400">BE Computer Engineering</p>
              </div>
            </motion.div>

            {/* Meet Full Committee CTA */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
              <p className="text-xs text-slate-300">
                Treasurers, Event Heads, Technical Coordinators, and Committee Members driving the club forward.
              </p>
              <Link
                to="/team"
                className="inline-flex items-center gap-1 text-xs font-bold text-electric-cyan hover:text-white transition-colors"
              >
                <span>Explore Full Committee Directory</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
