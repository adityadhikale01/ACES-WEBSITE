import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Award, Users, Mail, Crown, ChevronDown } from 'lucide-react';
import { FaLinkedin as Linkedin, FaGithub as Github } from 'react-icons/fa';
import { api } from '../../services/api.js';

export const TeamPage = () => {
  const [team, setTeam] = useState({
    president: null,
    presidents: [],
    vicePresident: null,
    vicePresidents: [],
    executives: [],
    committee: [],
    all: [],
  });

  const [groupPhotoUrl, setGroupPhotoUrl] = useState('/assets/aces-team.jpg');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const [res, brandRes] = await Promise.all([
          api.team.getAll(),
          api.content.get('branding').catch(() => ({ success: false })),
        ]);

        if (res.success && res.team) {
          setTeam({
            president: res.team.president || null,
            presidents: res.team.presidents?.length ? res.team.presidents : (res.team.president ? [res.team.president] : []),
            vicePresident: res.team.vicePresident || null,
            vicePresidents: res.team.vicePresidents?.length ? res.team.vicePresidents : (res.team.vicePresident ? [res.team.vicePresident] : []),
            executives: res.team.executives || [],
            committee: res.team.committee || [],
            all: res.team.all || [],
          });
        } else if (res.success && res.members) {
          const presidents = res.members.filter((m) => m.tier === 'PRESIDENT');
          const vps = res.members.filter((m) => m.tier === 'VICE_PRESIDENT');
          const execs = res.members.filter((m) => m.tier === 'EXECUTIVE');
          const comm = res.members.filter((m) => m.tier === 'COMMITTEE');
          setTeam({
            president: presidents[0] || null,
            presidents,
            vicePresident: vps[0] || null,
            vicePresidents: vps,
            executives: execs,
            committee: comm,
            all: res.members,
          });
        }

        if (brandRes.success && brandRes.data?.groupPhotoUrl) {
          setGroupPhotoUrl(brandRes.data.groupPhotoUrl);
        }
      } catch (err) {
        console.error('Failed to load team data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const president = team.president || defaultPresident;
  const vicePresidents = team.vicePresidents.length > 0 ? team.vicePresidents : [defaultVicePresident];
  const executives = team.executives.length > 0 ? team.executives : defaultExecutives;
  const committee = team.committee.length > 0 ? team.committee : defaultCommitteeMembers;

  return (
    <div className="pt-28 pb-24 min-h-screen">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-electric-cyan font-semibold">
            <Sparkles size={13} />
            <span>ACES COMMITTEE 2026 - 27</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Meet the <span className="text-gradient">Team Behind ACES</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Hierarchical committee directory and office bearers leading departmental activities, technical workshops,
            competitions, and collaboration within the Department of Computer Engineering at KBTCOE.
          </p>
        </div>
      </section>

      {/* Prominent Full Committee Photograph */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden border border-white/15 bg-navy-850/80 p-3 shadow-2xl"
        >
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] bg-navy-900 group">
            <img
              src={groupPhotoUrl}
              alt="ACES KBTCOE Official Committee Group Photograph 2026-27"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
              <span className="bg-navy-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/10 text-white font-medium">
                ACES KBTCOE Committee 2026 - 27 Official Group Photo
              </span>
              <span className="text-slate-300 font-semibold hidden sm:inline-block">
                MVPS's KBT College of Engineering, Nashik
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Quick Navigation Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-2xl bg-navy-900/80 border border-white/10 max-w-2xl mx-auto backdrop-blur-md">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'ALL'
                ? 'bg-gradient-to-r from-electric-blue to-electric-indigo text-white shadow-lg shadow-electric-blue/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Hierarchy
          </button>
          <button
            onClick={() => setActiveFilter('PRESIDENT')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'PRESIDENT'
                ? 'bg-gradient-to-r from-electric-blue to-electric-indigo text-white shadow-lg shadow-electric-blue/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            1. President
          </button>
          <button
            onClick={() => setActiveFilter('VICE_PRESIDENT')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'VICE_PRESIDENT'
                ? 'bg-gradient-to-r from-electric-blue to-electric-indigo text-white shadow-lg shadow-electric-blue/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            2. Vice Presidents
          </button>
          <button
            onClick={() => setActiveFilter('EXECUTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'EXECUTIVE'
                ? 'bg-gradient-to-r from-electric-blue to-electric-indigo text-white shadow-lg shadow-electric-blue/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            3. Execution Team
          </button>
          <button
            onClick={() => setActiveFilter('COMMITTEE')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'COMMITTEE'
                ? 'bg-gradient-to-r from-electric-blue to-electric-indigo text-white shadow-lg shadow-electric-blue/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            4. Members
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 1. PRESIDENT (ON TOP)                                                     */}
      {/* ========================================================================= */}
      {(activeFilter === 'ALL' || activeFilter === 'PRESIDENT') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Crown size={14} className="text-amber-400" />
              <span>TIER 1 • CLUB PRESIDENT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Presidential <span className="text-gradient">Leadership</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Head of ACES KBTCOE, guiding club vision, executive operations, and departmental initiatives.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative glass-card p-8 sm:p-10 rounded-3xl border border-electric-cyan/30 shadow-2xl shadow-electric-cyan/10 group hover:border-electric-cyan/50 transition-all">
              {/* Background gradient flare */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-electric-cyan/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                {/* Portrait */}
                <div className="relative flex-shrink-0">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-navy-800 border-2 border-electric-cyan/50 shadow-xl shadow-electric-cyan/20 group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={president.photoUrl || '/assets/members/President.jpeg'}
                      alt={`${president.name} - President`}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-navy-950 font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-md">
                    <Crown size={11} />
                    <span>PRESIDENT</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-center md:text-left flex-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-electric-blue/20 text-electric-cyan border border-electric-blue/30">
                    <Shield size={12} />
                    <span>PRESIDENT • ACES KBTCOE</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-electric-cyan transition-colors">
                    {president.name}
                  </h3>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">{president.academicYear || 'BE'} Computer Engineering</span>
                    <span>•</span>
                    <span>{president.department || 'Department of Computer Engineering'}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1 font-normal">
                    {president.bio ||
                      'Leading ACES 2026-27 to build a vibrant culture of learning, building, and innovation within the Department of Computer Engineering.'}
                  </p>

                  {/* Social Links */}
                  <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
                    {president.linkedinUrl && (
                      <a
                        href={president.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-electric-blue transition-colors"
                        title="LinkedIn Profile"
                      >
                        <Linkedin size={15} />
                      </a>
                    )}
                    {president.githubUrl && (
                      <a
                        href={president.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title="GitHub Profile"
                      >
                        <Github size={15} />
                      </a>
                    )}
                    {president.email && (
                      <a
                        href={`mailto:${president.email}`}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-electric-indigo transition-colors"
                        title="Email"
                      >
                        <Mail size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Visual Hierarchy Downward Flow Arrow */}
          <div className="flex justify-center my-6">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-electric-cyan">
              <ChevronDown size={16} />
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. VICE PRESIDENTS (BELOW PRESIDENT)                                      */}
      {/* ========================================================================= */}
      {(activeFilter === 'ALL' || activeFilter === 'VICE_PRESIDENT') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Award size={14} className="text-indigo-400" />
              <span>TIER 2 • VICE PRESIDENCY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Vice Presidential <span className="text-gradient">Leadership</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Directly supporting the President in operations, student mentorship, and committee execution.
            </p>
          </div>

          <div
            className={`grid gap-8 max-w-4xl mx-auto ${
              vicePresidents.length === 1 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 md:grid-cols-2'
            }`}
          >
            {vicePresidents.map((vp) => (
              <motion.div
                key={vp._id || vp.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-xl shadow-indigo-500/10 flex flex-col sm:flex-row items-center gap-6 group hover:border-indigo-500/50 transition-all"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-navy-800 border-2 border-indigo-500/40 shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={vp.photoUrl || '/assets/members/VicePresident.png'}
                      alt={`${vp.name} - Vice President`}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[9px] tracking-wider uppercase shadow">
                    VICE PRESIDENT
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                  <span className="px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-block">
                    VICE PRESIDENT
                  </span>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {vp.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {vp.academicYear || 'BE'} Computer Engineering • {vp.department || 'Computer Engineering'}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal line-clamp-3">
                    {vp.bio ||
                      'Spearheading departmental initiatives, student mentorship, and strategic community outreach across the department.'}
                  </p>

                  {/* Social Links */}
                  <div className="pt-1 flex items-center justify-center sm:justify-start gap-2.5">
                    {vp.linkedinUrl && (
                      <a
                        href={vp.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600 transition-colors"
                        title="LinkedIn"
                      >
                        <Linkedin size={13} />
                      </a>
                    )}
                    {vp.githubUrl && (
                      <a
                        href={vp.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title="GitHub"
                      >
                        <Github size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Visual Hierarchy Downward Flow Arrow */}
          <div className="flex justify-center my-6">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-electric-cyan">
              <ChevronDown size={16} />
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. EXECUTION TEAM MEMBERS (BELOW VICE PRESIDENTS)                          */}
      {/* ========================================================================= */}
      {(activeFilter === 'ALL' || activeFilter === 'EXECUTIVE') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-2 mb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-blue/10 border border-electric-blue/30 text-electric-cyan text-xs font-bold uppercase tracking-wider">
              <Users size={14} className="text-electric-cyan" />
              <span>TIER 3 • EXECUTION COUNCIL</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Execution Team <span className="text-gradient">& Domain Leads</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Treasurers, event heads, technical leads, and operational coordinators responsible for on-ground club activities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {executives.map((member, idx) => (
              <motion.div
                key={member._id || member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between group hover:border-electric-blue/40 transition-all"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-navy-800 border-2 border-white/10 flex-shrink-0 group-hover:border-electric-cyan/50 transition-colors">
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-electric-blue/15 text-electric-cyan border border-electric-blue/30 inline-block mb-1">
                        {member.role || member.designation || 'EXECUTION LEAD'}
                      </span>
                      <h4 className="text-base font-bold text-white group-hover:text-electric-cyan transition-colors truncate">
                        {member.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {member.academicYear || 'TE'} • {member.department || 'Computer Engineering'}
                      </p>
                    </div>
                  </div>

                  {member.bio && (
                    <p className="text-xs text-slate-300 leading-relaxed font-normal mb-4 line-clamp-2">
                      {member.bio}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] text-slate-500 font-medium">Departmental Execution</span>
                  <div className="flex items-center gap-2">
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-electric-blue/30 transition-colors"
                      >
                        <Linkedin size={12} />
                      </a>
                    )}
                    {member.githubUrl && (
                      <a
                        href={member.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <Github size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Visual Hierarchy Downward Flow Arrow */}
          <div className="flex justify-center my-6">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-electric-cyan">
              <ChevronDown size={16} />
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. COMMITTEE MEMBERS (LAST / BOTTOM)                                      */}
      {/* ========================================================================= */}
      {(activeFilter === 'ALL' || activeFilter === 'COMMITTEE') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-2 mb-8 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider">
              <Users size={14} className="text-slate-400" />
              <span>TIER 4 • GENERAL COMMITTEE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Committee <span className="text-gradient">Members</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Dedicated student members driving logistics, event registrations, stage management, documentation, and volunteer support.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {committee.map((member, i) => (
              <motion.div
                key={member._id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.04 }}
                className="glass-card p-3.5 rounded-2xl border border-white/10 text-center space-y-2.5 group hover:border-slate-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-20 h-20 sm:w-22 sm:h-22 mx-auto rounded-xl overflow-hidden bg-navy-800 border border-white/10 group-hover:border-electric-cyan/40 transition-colors">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="min-w-0 pt-2">
                    <h5 className="text-xs font-bold text-white group-hover:text-electric-cyan transition-colors truncate">
                      {member.name}
                    </h5>
                    <span className="text-[10px] text-slate-400 block truncate">Committee Member</span>
                  </div>
                </div>

                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block border-t border-white/5 pt-1.5">
                  {member.academicYear || 'SE'} • Computer
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// Fallback data if database connection is cold
const defaultPresident = {
  name: 'Aditya Dhikale',
  role: 'PRESIDENT',
  tier: 'PRESIDENT',
  department: 'Computer Engineering',
  academicYear: 'BE',
  bio: 'Leading ACES 2026-27 to build a vibrant culture of learning, building, and innovation within the department.',
  photoUrl: '/assets/members/President.jpeg',
  linkedinUrl: 'https://linkedin.com',
  githubUrl: 'https://github.com',
};

const defaultVicePresident = {
  name: 'Sammpana Kasar',
  role: 'VICE PRESIDENT',
  tier: 'VICE_PRESIDENT',
  department: 'Computer Engineering',
  academicYear: 'BE',
  bio: 'Spearheading departmental initiatives, student mentorship, and strategic community outreach.',
  photoUrl: '/assets/members/VicePresident.png',
  linkedinUrl: 'https://linkedin.com',
};

const defaultExecutives = [
  {
    name: 'Ayush Talekar',
    role: 'TREASURER',
    tier: 'EXECUTIVE',
    department: 'Computer Engineering',
    academicYear: 'TE',
    bio: 'Managing club finances, budgeting for flagship events, and resource management.',
    photoUrl: '/assets/members/AyushTalekar(Treasurer).jpg',
  },
  {
    name: 'Khushi Mansuri',
    role: 'EVENT COORDINATOR',
    tier: 'EXECUTIVE',
    department: 'Computer Engineering',
    academicYear: 'TE',
    bio: 'Coordinating workshops, competitions, and technical logistics across the academic year.',
    photoUrl: '/assets/members/KhushiMansuri(Event Coordinator).png',
  },
  {
    name: 'Yash Patil',
    role: 'EVENT COORDINATOR',
    tier: 'EXECUTIVE',
    department: 'Computer Engineering',
    academicYear: 'TE',
    bio: 'Organizing seamless technical sessions, scheduling, and on-ground execution.',
    photoUrl: '/assets/members/yash_Patil(Event Coordinator).jpg',
  },
];

const defaultCommitteeMembers = [
  { name: 'Arjun Patil', photoUrl: '/assets/members/arjun_patil.jpg', academicYear: 'TE' },
  { name: 'Atharva Vispute', photoUrl: '/assets/members/Atharva_vispute.png', academicYear: 'TE' },
  { name: 'Apurva Rahane', photoUrl: '/assets/members/Apurva_Rahane.png', academicYear: 'TE' },
  { name: 'Ronit Raheja', photoUrl: '/assets/members/ronitraheja.jpeg', academicYear: 'TE' },
  { name: 'Purva Sonawane', photoUrl: '/assets/members/purva sonawane.png', academicYear: 'TE' },
  { name: 'Sarthak Patil', photoUrl: '/assets/members/Sarthak Patil.jpg', academicYear: 'TE' },
  { name: 'Sanyukti Gangurde', photoUrl: '/assets/members/sanyukti gangurde.png', academicYear: 'TE' },
  { name: 'Mrunal Amrutkar', photoUrl: '/assets/members/Mrunal Amrutkar.jpg', academicYear: 'SE' },
  { name: 'Mrunal Thete', photoUrl: '/assets/members/Mrunal Thete.jpg', academicYear: 'SE' },
  { name: 'Nirali Shah', photoUrl: '/assets/members/Nirali Shah.jpeg', academicYear: 'SE' },
  { name: 'Shraddha Sonar', photoUrl: '/assets/members/sharadhha sonar_Drive.jpg', academicYear: 'SE' },
  { name: 'Jiya Shah', photoUrl: '/assets/members/JIYA SHAH.jpg', academicYear: 'SE' },
];

export default TeamPage;
