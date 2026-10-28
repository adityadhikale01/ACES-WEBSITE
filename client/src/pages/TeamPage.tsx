import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Award, Linkedin, Github, Sparkles } from 'lucide-react';
import { TeamMember } from '../types/index.js';
import { api } from '../services/api.js';

export const TeamPage: React.FC = () => {
  const [team, setTeam] = useState<{
    president: TeamMember | null;
    vicePresident: TeamMember | null;
    executives: TeamMember[];
    committee: TeamMember[];
    all: TeamMember[];
  }>({
    president: null,
    vicePresident: null,
    executives: [],
    committee: [],
    all: [],
  });

  const [groupPhotoUrl, setGroupPhotoUrl] = useState<string>('/assets/aces-team.jpg');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const [res, brandRes] = await Promise.all([
          api.team.getAll(),
          api.content.get('branding').catch(() => ({ success: false })),
        ]);

        if (res.success && res.team) {
          setTeam(res.team);
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

  return (
    <div className="pt-28 pb-20 min-h-screen">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-electric-cyan font-semibold">
            <Sparkles size={13} />
            <span>ACES COMMITTEE 2026 - 27</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Meet the <span className="text-gradient">Team Behind ACES</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            The dedicated student committee, office bearers, and domain coordinators driving departmental activities, technical workshops, and collaboration at KBTCOE.
          </p>
        </div>
      </section>

      {/* Prominent Full Committee Photograph */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-12">
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

      {/* President & Vice President Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-2 mb-8">
          <span className="text-electric-cyan text-xs font-bold uppercase tracking-widest">
            01 • LEADERSHIP
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Office Bearers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* President */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-navy-800 border-2 border-electric-cyan/40 flex-shrink-0 shadow-lg shadow-electric-cyan/10">
              <img
                src={team.president?.photoUrl || '/assets/members/President.jpeg'}
                alt="Aditya Dhikale - President"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-electric-blue/20 text-electric-cyan border border-electric-blue/30 inline-block">
                PRESIDENT
              </span>
              <h3 className="text-2xl font-bold text-white">
                {team.president?.name || 'Aditya Dhikale'}
              </h3>
              <p className="text-xs text-slate-400">BE Computer Engineering</p>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {team.president?.bio ||
                  'Leading ACES 2026-27 to build a culture of learning, building, and leading across the department.'}
              </p>
            </div>
          </div>

          {/* Vice President */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-navy-800 border-2 border-electric-indigo/40 flex-shrink-0 shadow-lg shadow-electric-indigo/10">
              <img
                src={team.vicePresident?.photoUrl || '/assets/members/VicePresident.png'}
                alt="Sammpana Kasar - Vice President"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-block">
                VICE PRESIDENT
              </span>
              <h3 className="text-2xl font-bold text-white">
                {team.vicePresident?.name || 'Sammpana Kasar'}
              </h3>
              <p className="text-xs text-slate-400">BE Computer Engineering</p>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {team.vicePresident?.bio ||
                  'Spearheading departmental initiatives, student mentorship, and community outreach.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Executives & Domain Leads */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-2 mb-8">
          <span className="text-electric-cyan text-xs font-bold uppercase tracking-widest">
            02 • EXECUTIVE COUNCIL
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Executive Team & Heads</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.executives.length > 0 ? (
            team.executives.map((member) => (
              <div
                key={member._id}
                className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4 group"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-navy-800 border border-white/10 flex-shrink-0">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-electric-cyan uppercase tracking-wider">
                    {member.role}
                  </span>
                  <h4 className="text-base font-bold text-white truncate">{member.name}</h4>
                  <p className="text-xs text-slate-400">{member.department}</p>
                </div>
              </div>
            ))
          ) : (
            // Fallback executive team cards
            <>
              <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-navy-800 flex-shrink-0">
                  <img
                    src="/assets/members/AyushTalekar(Treasurer).jpg"
                    alt="Ayush Talekar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-electric-cyan uppercase">TREASURER</span>
                  <h4 className="text-base font-bold text-white">Ayush Talekar</h4>
                  <p className="text-xs text-slate-400">TE Computer Engineering</p>
                </div>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-navy-800 flex-shrink-0">
                  <img
                    src="/assets/members/KhushiMansuri(Event Coordinator).png"
                    alt="Khushi Mansuri"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-electric-cyan uppercase">EVENT COORDINATOR</span>
                  <h4 className="text-base font-bold text-white">Khushi Mansuri</h4>
                  <p className="text-xs text-slate-400">TE Computer Engineering</p>
                </div>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-navy-800 flex-shrink-0">
                  <img
                    src="/assets/members/yash_Patil(Event Coordinator).jpg"
                    alt="Yash Patil"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-electric-cyan uppercase">EVENT COORDINATOR</span>
                  <h4 className="text-base font-bold text-white">Yash Patil</h4>
                  <p className="text-xs text-slate-400">TE Computer Engineering</p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Committee Members Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-2 mb-8">
          <span className="text-electric-cyan text-xs font-bold uppercase tracking-widest">
            03 • COMMITTEE MEMBERS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Committee Members</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(team.committee.length > 0 ? team.committee : defaultCommitteeMembers).map((member, i) => (
            <div
              key={i}
              className="glass-card p-3 rounded-2xl border border-white/10 text-center space-y-2 group"
            >
              <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden bg-navy-800 border border-white/10">
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-white truncate">{member.name}</h5>
                <span className="text-[10px] text-slate-400 block truncate">Committee Member</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const defaultCommitteeMembers = [
  { name: 'Arjun Patil', photoUrl: '/assets/members/arjun_patil.jpg' },
  { name: 'Atharva Vispute', photoUrl: '/assets/members/Atharva_vispute.png' },
  { name: 'Apurva Rahane', photoUrl: '/assets/members/Apurva_Rahane.png' },
  { name: 'Ronit Raheja', photoUrl: '/assets/members/ronitraheja.jpeg' },
  { name: 'Purva Sonawane', photoUrl: '/assets/members/purva sonawane.png' },
  { name: 'Sarthak Patil', photoUrl: '/assets/members/Sarthak Patil.jpg' },
  { name: 'Sanyukti Gangurde', photoUrl: '/assets/members/sanyukti gangurde.png' },
  { name: 'Mrunal Amrutkar', photoUrl: '/assets/members/Mrunal Amrutkar.jpg' },
  { name: 'Mrunal Thete', photoUrl: '/assets/members/Mrunal Thete.jpg' },
  { name: 'Nirali Shah', photoUrl: '/assets/members/Nirali Shah.jpeg' },
  { name: 'Shraddha Sonar', photoUrl: '/assets/members/sharadhha sonar_Drive.jpg' },
  { name: 'Jiya Shah', photoUrl: '/assets/members/JIYA SHAH.jpg' },
];
