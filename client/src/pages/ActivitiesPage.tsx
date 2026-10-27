import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowUpRight, Sparkles } from 'lucide-react';
import { ActivityItem } from '../types/index.js';
import { api } from '../services/api.js';

export const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.activities.getAll('ACTIVITY');
        if (res.success && res.items) {
          setActivities(res.items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-electric-cyan font-semibold">
            <Sparkles size={13} />
            <span>DEPARTMENTAL INITIATIVES</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Activities & <span className="text-gradient">Sessions</span>
          </h1>
          <p className="text-base text-slate-300 leading-relaxed font-normal">
            A chronological timeline of technical workshops, guest lectures, induction sessions, and departmental hackathons conducted by ACES KBTCOE.
          </p>
        </div>

        {/* Timeline List */}
        <div className="space-y-8">
          {activities.length > 0 ? (
            activities.map((item, index) => {
              const dateFormatted = new Date(item.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={item._id}
                  className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  <div className="md:col-span-4 rounded-2xl overflow-hidden aspect-[16/10] bg-navy-900 border border-white/10">
                    <img
                      src={item.imageUrl || '/assets/aces-team.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-electric-cyan font-semibold">
                      <Calendar size={13} />
                      <span>{dateFormatted}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {item.tags?.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              Loading departmental activities...
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
