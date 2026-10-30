import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { api } from "../../services/api.js";
const categories = [
  { label: "All Events", value: "ALL" },
  { label: "Flagship", value: "FLAGSHIP" },
  { label: "Workshops", value: "WORKSHOP" },
  { label: "Coding / DSA", value: "CODING" },
  { label: "Development", value: "DEVELOPMENT" },
  { label: "Challenges", value: "CHALLENGE" },
  { label: "Community", value: "COMMUNITY" }
];
export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("UPCOMING");
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.events.getAll({
          category: selectedCategory !== "ALL" ? selectedCategory : void 0,
          search: searchQuery || void 0
        });
        if (res.success && res.events) {
          setEvents(res.events);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchEvents, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);
  const now = /* @__PURE__ */ new Date();
  const filteredEvents = events.filter((e) => {
    const eventDate = new Date(e.startDate);
    if (timeFilter === "UPCOMING") return eventDate >= now || isNaN(eventDate.getTime());
    if (timeFilter === "PAST") return eventDate < now;
    return true;
  });
  return <div className="pt-28 pb-20 min-h-screen">
      {
    /* Header */
  }
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric-blue/15 border border-electric-blue/30 text-xs text-electric-cyan font-semibold">
              <Sparkles size={13} />
              <span>DEPARTMENTAL ACTIVITY CALENDAR</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              ACES <span className="text-gradient">Events & Sessions</span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Explore hands-on workshops, flagship competitions, hackathons, and learning sessions organized by ACES KBTCOE for the academic term.
            </p>
          </div>

          {
    /* Time filter toggle */
  }
          <div className="flex items-center p-1 rounded-xl bg-navy-850 border border-white/10 text-xs font-semibold">
            <button
    onClick={() => setTimeFilter("UPCOMING")}
    className={`px-4 py-2 rounded-lg transition-all ${timeFilter === "UPCOMING" ? "bg-electric-blue text-white shadow" : "text-slate-400 hover:text-white"}`}
  >
              Upcoming
            </button>
            <button
    onClick={() => setTimeFilter("PAST")}
    className={`px-4 py-2 rounded-lg transition-all ${timeFilter === "PAST" ? "bg-electric-blue text-white shadow" : "text-slate-400 hover:text-white"}`}
  >
              Past Sessions
            </button>
            <button
    onClick={() => setTimeFilter("ALL")}
    className={`px-4 py-2 rounded-lg transition-all ${timeFilter === "ALL" ? "bg-electric-blue text-white shadow" : "text-slate-400 hover:text-white"}`}
  >
              All
            </button>
          </div>
        </div>

        {
    /* Filter & Search Bar */
  }
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {
    /* Category Tabs */
  }
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => <button
    key={cat.value}
    onClick={() => setSelectedCategory(cat.value)}
    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all border ${selectedCategory === cat.value ? "bg-white/15 text-white border-electric-cyan/40 shadow-sm" : "bg-navy-850/60 text-slate-400 border-white/5 hover:bg-white/5 hover:text-slate-200"}`}
  >
                {cat.label}
              </button>)}
          </div>

          {
    /* Search Input */
  }
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
    type="text"
    placeholder="Search event title or topic..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-850 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-electric-cyan transition-colors"
  />
          </div>
        </div>
      </section>

      {
    /* Events Grid */
  }
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
            {[1, 2, 3].map((n) => <div key={n} className="glass-card rounded-2xl h-80 animate-pulse bg-white/5 border border-white/5" />)}
          </div> : filteredEvents.length === 0 ? <div className="text-center py-20 bg-navy-850/40 rounded-3xl border border-white/5 p-8 max-w-xl mx-auto">
            <Calendar size={36} className="mx-auto text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No events found</h3>
            <p className="text-xs text-slate-400 mb-4">
              There are no events matching your selected category or search keyword.
            </p>
            <button
    onClick={() => {
      setSelectedCategory("ALL");
      setSearchQuery("");
      setTimeFilter("ALL");
    }}
    className="px-4 py-2 rounded-lg bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
  >
              Reset Filters
            </button>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
    const dateObj = new Date(event.startDate);
    const dateFormatted = isNaN(dateObj.getTime()) ? "TBA" : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return <article
      key={event._id}
      className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between group"
    >
                  <div>
                    {
      /* Event Banner */
    }
                    <div className="relative aspect-[16/9] overflow-hidden bg-navy-900">
                      <img
      src={event.posterUrl || "/assets/aces-team.jpg"}
      alt={event.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />

                      {
      /* Tag */
    }
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 text-[10px] font-extrabold tracking-wider rounded-md bg-electric-blue/80 backdrop-blur-md text-white uppercase border border-electric-cyan/30">
                          {event.category}
                        </span>
                      </div>

                      {event.eligibility === "MEMBERS_ONLY" && <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-500/80 backdrop-blur-md text-white uppercase">
                            Members Only
                          </span>
                        </div>}
                    </div>

                    {
      /* Content */
    }
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                        <div className="flex items-center gap-1.5 text-electric-cyan font-medium">
                          <Calendar size={13} />
                          <span>{dateFormatted}</span>
                        </div>
                        {event.timeString && <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock size={13} />
                            <span>{event.timeString}</span>
                          </div>}
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

                  {
      /* Action */
    }
                  <div className="p-6 pt-0">
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                      <div className="text-[11px] text-slate-400">
                        {event.capacity ? <span>
                            <strong className="text-white font-semibold">{event.registeredCount || 0}</strong> / {event.capacity} seats
                          </span> : <span>Open Capacity</span>}
                      </div>
                      <Link
      to={`/events/${event.slug}`}
      className="inline-flex items-center gap-1 font-semibold text-electric-cyan group-hover:text-white transition-colors"
    >
                        <span>View Details</span>
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>;
  })}
          </div>}
      </section>
    </div>;
};

export default EventsPage;
