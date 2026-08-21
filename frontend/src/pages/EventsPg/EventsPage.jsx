import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import "./EventsPage.css";
import EventCard from "../../components/EventsPg/EventCard.jsx";
const events = [
  {
    id: 1,
    title: "TECH TANK — EQUITY WARS",
    description:
      "Pitch your boldest startup idea, defend your vision and compete against the sharpest minds in the department.",
    date: "12 SEPT 2026",
    time: "10:00 AM",
    location: "Seminar Hall",
    category: "FLAGSHIP",
    status: "UPCOMING",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 2,
    title: "CODERUSH",
    description:
      "A high-energy competitive programming challenge focused on DSA, logic, algorithms and real-world problem solving.",
    date: "19 SEPT 2026",
    time: "11:00 AM",
    location: "Computer Lab 01",
    category: "CODING",
    status: "UPCOMING",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 3,
    title: "BUILD WITH AI",
    description:
      "Explore the world of generative AI and learn how modern developers are building intelligent applications.",
    date: "03 OCT 2026",
    time: "2:00 PM",
    location: "Auditorium",
    category: "WORKSHOP",
    status: "UPCOMING",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 4,
    title: "WEBCRAFT",
    description:
      "Design and build a modern web experience from scratch in this hands-on frontend development challenge.",
    date: "17 OCT 2026",
    time: "10:30 AM",
    location: "Innovation Lab",
    category: "DEVELOPMENT",
    status: "UPCOMING",
    image:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 5,
    title: "DEBUG THE CODE",
    description:
      "Find the bug. Fix the logic. Beat the clock. A fast-paced debugging challenge for developers who love solving problems.",
    date: "07 NOV 2026",
    time: "11:00 AM",
    location: "Computer Lab 02",
    category: "CHALLENGE",
    status: "UPCOMING",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 6,
    title: "ACES TALKS",
    description:
      "An open conversation with developers, founders and industry professionals about careers, technology and opportunities.",
    date: "05 DEC 2026",
    time: "3:00 PM",
    location: "Seminar Hall",
    category: "COMMUNITY",
    status: "UPCOMING",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 7,
    title: "CODE & COFFEE",
    description:
      "A relaxed coding meetup where students collaborate, discuss projects and share what they are building.",
    date: "16 JAN 2027",
    time: "4:00 PM",
    location: "ACES Workspace",
    category: "MEETUP",
    status: "UPCOMING",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 8,
    title: "HACK THE FUTURE",
    description:
      "Build. Collaborate. Innovate. A flagship hackathon challenging teams to create technology-driven solutions.",
    date: "20 FEB 2027",
    time: "9:00 AM",
    location: "KBTCOE Campus",
    category: "FLAGSHIP",
    status: "UPCOMING",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 9,
    title: "TECHFEST 2027",
    description:
      "The biggest technology celebration of the year featuring competitions, workshops, projects and innovation.",
    date: "27 MAR 2027",
    time: "9:30 AM",
    location: "KBTCOE Campus",
    category: "TECHFEST",
    status: "UPCOMING",
    image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=80",
  },
];

const EventsPage = () => {
  return (
    <main className="events-page">

      {/* HERO */}
      <section className="events-hero">
        <div className="events-hero-inner">

          <motion.div
            className="events-label"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span />
            ACES EVENTS
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Learn.
            <br />
            Build.
            <br />
            <span>Experience.</span>
          </motion.h1>

          <motion.p
            className="events-hero-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            From technical competitions to hands-on workshops,
            ACES creates experiences that help students learn,
            collaborate and grow.
          </motion.p>

        </div>

        <div className="events-hero-meta">
          <span>2026 — 27</span>
          <span>EVENT CALENDAR</span>
        </div>
      </section>


      {/* EVENTS */}
      <section className="events-section">

        <div className="events-section-header">

          <div>
            <span className="section-eyebrow">
              WHAT'S HAPPENING
            </span>

            <h2>
              Upcoming <span>Events</span>
            </h2>
          </div>

          <p>
            Explore the events, workshops and experiences
            happening throughout the ACES academic year.
          </p>

        </div>


        {/* FEATURED EVENT */}
        <motion.article
          className="featured-event"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >

          <div className="featured-image">
            <img
              src={events[0].image}
              alt={events[0].title}
            />

            <span className="featured-tag">
              FEATURED EVENT
            </span>
          </div>

          <div className="featured-content">

            <div className="featured-date">
              <strong>{events[0].date}</strong>
              <span>
                {events[0].month} {events[0].year}
              </span>
            </div>

            <div className="featured-info">

              <span>{events[0].category}</span>

              <h3>{events[0].title}</h3>

              <p>{events[0].description}</p>

              <div className="featured-details">
                <span>
                  <CalendarDays size={15} />
                  {events[0].date} {events[0].month} {events[0].year}
                </span>

                <span>
                  <MapPin size={15} />
                  {events[0].location}
                </span>
              </div>

              <button className="featured-button">
                EXPLORE EVENT
                <ArrowUpRight size={18} />
              </button>

            </div>

          </div>

        </motion.article>


        {/* GRID */}
        <div className="events-grid">
            {events.map((event) => (
                <EventCard
                key={event.id}
                event={event}
                />
            ))}
            </div>

      </section>


      {/* BOTTOM CTA */}
      <section className="events-cta">

        <div>
          <span>STAY CONNECTED</span>

          <h2>
            More experiences
            <br />
            are coming.
          </h2>
        </div>

        <p>
          Follow ACES and stay updated with upcoming
          events, workshops and opportunities.
        </p>

        <button>
          FOLLOW ACES
          <ArrowUpRight size={18} />
        </button>

      </section>

    </main>
  );
};

export default EventsPage;