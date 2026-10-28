import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowUpRight, Tag } from 'lucide-react';

export function EventsPreview({ events = [] }) {
  const displayEvents = events.slice(0, 3);

  return (
    <section className="py-20 bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-electric-cyan">
              UPCOMING & FEATURED
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Events & <span className="text-gradient">Workshops</span>
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-electric-cyan hover:text-white transition-colors uppercase tracking-wider"
          >
            <span>View All Events</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {displayEvents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-navy-850/50 border border-slate-800 text-slate-400 text-sm">
            No events scheduled right now. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayEvents.map((event) => (
              <div
                key={event._id || event.slug}
                className="rounded-2xl overflow-hidden bg-navy-850/80 border border-slate-800 hover:border-slate-700 flex flex-col group transition-all"
              >
                <div className="relative aspect-video bg-navy-900 overflow-hidden">
                  <img
                    src={event.posterUrl || '/assets/aces-team.jpg'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-navy-950/80 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-electric-cyan">
                    {event.category}
                  </div>
                  {event.isPaid && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-amber-500/90 text-navy-950 text-[10px] font-black uppercase tracking-wider">
                      ₹{(event.feeAmountInPaise / 100).toFixed(0)}
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-electric-cyan transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {event.shortDescription}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-electric-cyan" />
                      <span>{new Date(event.eventDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
                    <span>Event Details</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default EventsPreview;
