import { ArrowUpRight } from "lucide-react";
import "./AboutAces.css";

const pillars = [
  {
    number: "01",
    title: "LEARN",
    description: "Workshops, DSA, development, AI and emerging technologies.",
  },
  {
    number: "02",
    title: "CREATE",
    description: "Projects, events and experiences that turn ideas into reality.",
  },
  {
    number: "03",
    title: "LEAD",
    description: "Leadership, teamwork and confidence beyond the classroom.",
  },
];

const AboutAces = () => {
  return (
    <section className="about-aces" id="about">
      <div className="about-aces__container">

        {/* Header */}
        <div className="about-aces__header">
          <span>01 — ABOUT ACES</span>
          <span>2026 — 27</span>
        </div>

        {/* Main */}
        <div className="about-aces__main">
          <h2>
            MORE THAN
            <br />
            <span>A COMMITTEE.</span>
          </h2>

          <div className="about-aces__intro">
            <p>
              ACES is a student-driven community where students
              <strong> learn, create and lead.</strong>
            </p>

            <p>
              We bring together technology, collaboration and
              real-world experiences to help students grow.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="about-aces__pillars">
          {pillars.map((pillar) => (
            <article className="about-aces__pillar" key={pillar.number}>
              <div className="about-aces__number">
                {pillar.number}
              </div>

              <h3>{pillar.title}</h3>

              <p>{pillar.description}</p>

              <ArrowUpRight
                className="about-aces__arrow"
                size={18}
              />
            </article>
          ))}
        </div>

        {/* Footer */}
        <div className="about-aces__footer">
          <span>COMPUTER ENGINEERING</span>
          <span>KBTCOE · NASHIK</span>
        </div>

      </div>
    </section>
  );
};

export default AboutAces;