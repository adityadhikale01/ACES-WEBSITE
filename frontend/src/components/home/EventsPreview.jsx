import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowUpRight, Clock } from 'lucide-react';
import { api } from '../../services/api.js';

export const EventsPreview = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.events.getAll({ status: 'PUBLISHED' });
        if (res.success && res.events?.length > 0) {
          setEvents(res.events.slice(0, 3));
        }
      } catch (err) {
        // Fallback default events
        setEvents([
          {
            _id: '1',
            title: 'TECH TANK - EQUITY WARS',
            slug: 'tech-tank-equity-wars',
            subtitle: 'The Departmental Startup Pitch Arena',
            description: 'Pitch your boldest startup idea, defend your tech stack and valuation, and compete against the sharpest minds.',
            category: 'FLAGSHIP',
            posterUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80',
            venue: 'Seminar Hall, KBTCOE',
            isOnline: false,
            startDate: '2026-09-12T10:00:00Z',
            registrationDeadline: '2026-09-10T23:59:59Z',
            timeString: '10:00 AM - 4:00 PM',
            capacity: 120,
            registeredCount: 42,
            eligibility: 'OPEN_TO_ALL',
            status: 'PUBLISHED',
            isFeatured: true,
            createdAt: '2026-08-01',
          },
          {
            _id: '2',
            title: 'CODERUSH 2026',
            slug: 'coderush-2026',
            subtitle: 'Speed, DSA & Algorithmic Problem Solving',
            description: 'A high-energy competitive programming challenge focused on Data Structures, algorithms, and logic.',
            category: 'CODING',
            posterUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
            venue: 'Computer Lab 01 & 02',
            isOnline: false,
            startDate: '2026-09-19T11:00:00Z',
            registrationDeadline: '2026-09-18T18:00:00Z',
            timeString: '11:00 AM - 2:00 PM',
            capacity: 80,
            registeredCount: 65,
            eligibility: 'OPEN_TO_ALL',
            status: 'PUBLISHED',
            isFeatured: true,
            createdAt: '2026-08-01',
          },
          {
            _id: '3',
            title: 'BUILD WITH AI & AGENTS',
            slug: 'build-with-ai-agents',
            subtitle: 'Hands-on Generative AI and Autonomous Coding',
            description: 'Explore the world of modern LLMs, function-calling agents, and real-time AI toolsets.',
            category: 'WORKSHOP',
            posterUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
            venue: 'Auditorium, KBTCOE',
            isOnline: false,
            startDate: '2026-10-03T14:00:00Z',
            registrationDeadline: '2026-10-02T20:00:00Z',
            timeString: '2:00 PM - 5:30 PM',
            capacity: 150,
            registeredCount: 110,
            eligibility: 'OPEN_TO_ALL',
            status: 'PUBLISHED',
            isFeatured: true,
            createdAt: '2026-08-01',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <section className="py-24 bg-navy-950 relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-electric-cyan text-xs font-bold uppercase tracking-widest">
              <span>02 • CALENDAR 2026-27</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Upcoming <span className="text-gradient">Departmental Events</span>
            </h2>
          </div>
          <Link
            to="/events"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-electric-cyan hover:text-white transition-colors"
          >
            <span>View All Departmental Events</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* Events Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event, index) => {
            const dateVal = event.startDate || event.eventDate;
            const dateObj = new Date(dateVal);
            const dateFormatted = (!dateVal || isNaN(dateObj.getTime()))
              ? 'TBA'
              : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <motion.article
                key={event._id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between group"
              >
                <div>
                  {/* Poster Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-navy-900">
                    <img
                      src={event.posterUrl || '/assets/aces-team.jpg'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[10px] font-extrabold tracking-wider rounded-md bg-electric-blue/80 backdrop-blur-md text-white uppercase border border-electric-cyan/30">
                        {event.category}
                      </span>
                    </div>

                    {/* Eligibility Badge */}
                    {event.eligibility === 'MEMBERS_ONLY' && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-500/80 backdrop-blur-md text-white uppercase">
                          Members Only
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                      <div className="flex items-center gap-1.5 text-electric-cyan font-medium">
                        <Calendar size={13} />
                        <span>{dateFormatted}</span>
                      </div>
                      {event.timeString && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock size={13} />
                          <span>{event.timeString}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-electric-cyan transition-colors mb-2 line-clamp-1">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-white/5">
                      <MapPin size={13} className="text-slate-500 flex-shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                    <div className="text-[11px] text-slate-400">
                      {event.capacity ? (
                        <span>
                          <strong className="text-white font-semibold">{event.registeredCount || event.registrationCount || 0}</strong> / {event.capacity} seats filled
                        </span>
                      ) : (
                        <span>Open Capacity</span>
                      )}
                    </div>
                    <Link
                      to={`/events/${event.slug}`}
                      className="inline-flex items-center gap-1 font-semibold text-electric-cyan group-hover:text-white transition-colors"
                    >
                      <span>Details & Register</span>
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default EventsPreview;
