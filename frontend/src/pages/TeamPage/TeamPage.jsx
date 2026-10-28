import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { Mail, Users, Award } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

export function TeamPage() {
  const { members = [], branding } = useLoaderData();
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const groupPhotoUrl = branding?.groupPhotoUrl || '/assets/aces-team.jpg';

  const categories = ['ALL', 'LEADERSHIP', 'TECHNICAL', 'CREATIVE', 'OPERATIONS', 'DOCUMENTATION', 'FACULTY'];

  const filteredMembers = members.filter((m) => {
    if (selectedCategory === 'ALL') return true;
    return m.category === selectedCategory;
  });

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-electric-cyan">
            <span>COMMITTEE 2026-27</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            The Minds Behind <br />
            <span className="text-gradient">ACES KBTCOE.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Meet the student office bearers, team leads, and faculty coordinators organizing activities for the Department of Computer Engineering.
          </p>
        </div>

        {/* Group Photo Section */}
        <div className="rounded-3xl overflow-hidden bg-navy-850 border border-slate-800 p-4 sm:p-6 shadow-2xl">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-navy-950">
            <img
              src={groupPhotoUrl}
              alt="ACES Committee Team 2026-27"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
              <span className="font-bold bg-navy-950/80 px-3 py-1.5 rounded-lg border border-white/10">
                Official Committee Team 2026-27
              </span>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-electric-blue text-white shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Member Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member._id || member.name}
              className="rounded-2xl overflow-hidden bg-navy-850/80 border border-slate-800 hover:border-slate-700 p-5 flex flex-col items-center text-center space-y-4 group transition-all"
            >
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-navy-900 border border-white/10 group-hover:border-electric-blue/50 transition-colors">
                <img
                  src={member.photoUrl || '/assets/team/uday-dhikale.jpg'}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-1 w-full">
                <h3 className="text-base font-bold text-white group-hover:text-electric-cyan transition-colors">
                  {member.name}
                </h3>
                <p className="text-xs font-semibold text-electric-blue uppercase tracking-wider">
                  {member.designation}
                </p>
                {member.bio && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 pt-1 leading-relaxed">
                    {member.bio}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2 text-slate-400">
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    <FaLinkedin size={15} />
                  </a>
                )}
                {member.github && (
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    <FaGithub size={15} />
                  </a>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="hover:text-white transition-colors"
                  >
                    <Mail size={15} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamPage;
