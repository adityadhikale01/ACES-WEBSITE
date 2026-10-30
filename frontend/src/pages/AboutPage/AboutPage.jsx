import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  Target
} from "lucide-react";
export const AboutPage = () => {
  return <div className="pt-28 pb-20 min-h-screen">
      {
    /* Top Header */
  }
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-electric-cyan font-semibold">
            <span>ABOUT ACES KBTCOE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            More Than <br />
            <span className="text-gradient">A Committee.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            ACES — the <strong className="text-white">Computer Engineering Students' Association</strong> — is a student-driven initiative focused on creating a stronger academic, technical, and professional environment within the Department of Computer Engineering at MVPS's KBTCOE, Nashik.
          </p>
        </div>
      </section>

      {
    /* Institutional Affiliation Card */
  }
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-8 rounded-3xl bg-navy-850/80 border border-slate-700/60 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-electric-blue/15 border border-electric-blue/30 flex items-center justify-center text-electric-cyan flex-shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Institution</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Maratha Vidya Prasarak Samaj's Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering (MVPS's KBTCOE), Nashik.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-electric-cyan/15 border border-electric-cyan/30 flex items-center justify-center text-electric-cyan flex-shrink-0">
              <GraduationCap size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Department</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Department of Computer Engineering, dedicated to producing future-ready software engineers and innovators.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Official Term</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                ACES Academic Committee Term 2026 - 27 under faculty supervision and student leadership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {
    /* Vision & Mission */
  }
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="inline-flex items-center gap-2 text-electric-cyan text-xs font-bold uppercase tracking-widest">
              <Target size={14} />
              <span>OUR VISION</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Technically Strong, Creatively Curious</h3>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "Build a community of computer engineering students who are technically strong, creatively curious, and equipped to lead modern technology domains."
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              We envision a departmental culture where learning is continuous, peer collaboration is the standard, and every student feels confident to build impactful projects.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="inline-flex items-center gap-2 text-electric-cyan text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} />
              <span>OUR MISSION</span>
            </div>
            <h3 className="text-2xl font-bold text-white">From Ideas to Concrete Impact</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              To organize hands-on technical workshops, competitive hackathons, industry sessions, and peer learning circles that bridge classroom curriculum with industry reality.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our goal is simple: create an environment where curiosity becomes knowledge, knowledge becomes experience, and experience becomes impact.
            </p>
          </div>
        </div>
      </section>

      {
    /* The Four Pillars */
  }
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4 mb-12">
          <span className="text-electric-cyan text-xs font-bold uppercase tracking-widest">
            THE FOUR PILLARS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            What Drives <span className="text-gradient">ACES KBTCOE</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-xl">
            Everything the club organizes revolves around four fundamental principles guiding every event, initiative, and workshop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-navy-850 border border-white/10 space-y-3">
            <div className="text-2xl font-black text-electric-cyan">01 • LEARN</div>
            <h4 className="text-lg font-bold text-white">Knowledge & Deep Foundations</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We create opportunities for students to continuously learn, explore, and strengthen their technical foundation in DSA, Web Architecture, Systems, AI, and Cloud.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-850 border border-white/10 space-y-3">
            <div className="text-2xl font-black text-electric-cyan">02 • BUILD</div>
            <h4 className="text-lg font-bold text-white">Practical Project Execution</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Learning becomes meaningful when it is applied. ACES encourages students to turn ideas into software projects, hackathon prototypes, and real-world tools.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-850 border border-white/10 space-y-3">
            <div className="text-2xl font-black text-electric-cyan">03 • CONNECT</div>
            <h4 className="text-lg font-bold text-white">Collaboration & Mentorship</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ACES brings students together through shared hackathons, senior-junior peer mentoring circles, and open dialogue with industry professionals and alumni.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-850 border border-white/10 space-y-3">
            <div className="text-2xl font-black text-electric-cyan">04 • LEAD</div>
            <h4 className="text-lg font-bold text-white">Ownership & Lasting Impact</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We develop students who take responsibility, lead cross-functional teams, communicate technical concepts, and create positive change beyond examinations.
            </p>
          </div>
        </div>
      </section>

      {
    /* CTA to Team */
  }
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="p-10 rounded-3xl bg-navy-850/80 border border-white/10 space-y-4 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white">Meet the Team Behind ACES</h3>
          <p className="text-xs text-slate-400">
            Learn more about the faculty coordinators, office bearers, and committee members driving ACES 2026-27.
          </p>
          <div className="pt-2">
            <Link
    to="/team"
    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold text-xs"
  >
              <span>View Committee Members</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>;
};

export default AboutPage;
