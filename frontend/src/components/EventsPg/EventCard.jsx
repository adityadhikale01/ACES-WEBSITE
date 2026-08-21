import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import "./EventCard.css";

const EventCard = ({ event }) => {
  const {
    title,
    description,
    date,
    time,
    location,
    category,
    image,
    status,
  } = event;

  return (
    <motion.article
      className="event-card"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
    >
      {/* Image */}
      <div className="event-card-image">
        <img src={image} alt={title} />

        <span className="event-card-category">
          {category}
        </span>

        {status && (
          <span className={`event-card-status ${status.toLowerCase()}`}>
            {status}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="event-card-content">
        <h3>{title}</h3>

        <p className="event-card-description">
          {description}
        </p>

        <div className="event-card-meta">
          <div>
            <CalendarDays size={16} />
            <span>{date}</span>
            {time && <span>• {time}</span>}
          </div>

          <div>
            <MapPin size={16} />
            <span>{location}</span>
          </div>
        </div>

        <button className="event-card-button">
          <span>View Event</span>
          <ArrowUpRight size={18} />
        </button>
      </div>
    </motion.article>
  );
};

export default EventCard;