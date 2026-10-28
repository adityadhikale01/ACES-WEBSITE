import React, { useState } from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowUpRight, Search, Filter } from 'lucide-react';

export function EventsPage() {
  const { events = [] } = useLoaderData();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'WORKSHOP', 'COMPETITION', 'SEMINAR', 'HACKATHON', 'EXPERT_TALK'];

  const filteredEvents = events.filter((e) => {
    const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.shortDescription?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-electric-cyan">
            <span>DEPARTMENTAL CALENDAR</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Workshops, Seminars & <br />
            <span className="text-gradient">Competitions.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Explore hands-on technical sessions, intra-departmental hackathons, and seminars organized by ACES KBTCOE.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 pb-6 border-b border-slate-800">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
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

          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-navy-850 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue"
            />
          </div>
        </div>

        {/* Event Cards */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-navy-850/50 rounded-2xl border border-slate-800 text-slate-400 text-sm">
            No events found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event._id || event.slug}
                className="rounded-2xl overflow-hidden bg-navy-850/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="relative aspect-video bg-navy-900 overflow-hidden">
                    <img
                      src={event.posterUrl || '/assets/aces-team.jpg'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-navy-950/80 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-electric-cyan">
                      {event.category}
                    </div>
                    {event.isPaid ? (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-amber-500/90 text-navy-950 text-[10px] font-black uppercase tracking-wider">
                        ₹{(event.feeAmountInPaise / 100).toFixed(0)}
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-500/90 text-navy-950 text-[10px] font-black uppercase tracking-wider">
                        FREE
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-electric-cyan transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {event.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-4">
                  <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-electric-cyan" />
                      <span>
                        {new Date(event.eventDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-electric-cyan" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  <Link
                    to={`/events/${event.slug}`}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-electric-blue text-white text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>View & Register</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;
