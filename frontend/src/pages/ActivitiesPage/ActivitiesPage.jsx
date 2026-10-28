import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { Award, Calendar, ExternalLink } from 'lucide-react';

export function ActivitiesPage() {
  const { items = [] } = useLoaderData();
  const [activeTab, setActiveTab] = useState('ALL');

  const filteredItems = items.filter((item) => {
    if (activeTab === 'ALL') return true;
    return item.type === activeTab;
  });

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-electric-cyan">
            <span>DEPARTMENTAL INITIATIVES & EXCELLENCE</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Activities & <br />
            <span className="text-gradient">Student Achievements.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Showcasing social outreach, guest lectures, competitive hackathon wins, and technical milestones achieved under ACES.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 pb-4 border-b border-slate-800">
          {['ALL', 'ACTIVITY', 'ACHIEVEMENT'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-electric-blue text-white shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab === 'ALL' ? 'All Records' : tab === 'ACTIVITY' ? 'Department Activities' : 'Student Achievements'}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-navy-850/50 rounded-2xl border border-slate-800 text-slate-400 text-sm">
            No records found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl overflow-hidden bg-navy-850/80 border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="relative aspect-video bg-navy-900 overflow-hidden">
                    <img
                      src={item.imageUrl || '/assets/aces-team.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-navy-950/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-electric-cyan">
                      {item.type}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Calendar size={13} className="text-electric-cyan" />
                      <span>{new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-electric-cyan transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.impactSummary && (
                  <div className="p-6 pt-0">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300">
                      <strong className="text-electric-cyan">Impact: </strong>
                      {item.impactSummary}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivitiesPage;
