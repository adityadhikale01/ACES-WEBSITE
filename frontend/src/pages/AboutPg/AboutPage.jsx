import { ArrowUpRight } from "lucide-react";
import "./AboutPage.css";

const pillars = [
  {
    number: "01",
    title: "LEARN",
    short: "Knowledge",
    description:
      "We create opportunities for students to continuously learn, explore and strengthen their technical foundation.",
    details: [
      "DSA & problem solving",
      "Web & software development",
      "AI, cloud & emerging technologies",
      "Technical workshops",
    ],
  },
  {
    number: "02",
    title: "BUILD",
    short: "Experience",
    description:
      "Learning becomes meaningful when it is applied. ACES encourages students to turn ideas into projects and real experiences.",
    details: [
      "Student projects",
      "Hackathons & competitions",
      "Technical challenges",
      "Innovation & experimentation",
    ],
  },
  {
    number: "03",
    title: "CONNECT",
    short: "Community",
    description:
      "ACES brings students together through events, collaboration and a shared passion for technology.",
    details: [
      "Technical events",
      "Peer learning",
      "Industry interactions",
      "Community activities",
    ],
  },
  {
    number: "04",
    title: "LEAD",
    short: "Impact",
    description:
      "We develop students who can take responsibility, work with teams and create a positive impact beyond the classroom.",
    details: [
      "Leadership opportunities",
      "Team management",
      "Communication skills",
      "Department initiatives",
    ],
  },
];

const AboutPage = () => {
  return (
    <main className="about-page">

      {/* HERO */}

      <section className="about-page__hero">
        <div className="about-page__hero-top">
          <span>01 — ABOUT ACES</span>
          <span>ACES 2026 — 27</span>
        </div>

        <div className="about-page__hero-content">
          <p className="about-page__eyebrow">
            COMPUTER ENGINEERING STUDENTS' ASSOCIATION
          </p>

          <h1>
            MORE THAN
            <br />
            <span>A COMMITTEE.</span>
          </h1>

          <div className="about-page__hero-description">
            <div className="about-page__line" />

            <p>
              ACES is a student-driven community built to help
              computer engineering students learn, create,
              connect and lead.
            </p>
          </div>
        </div>
      </section>


      {/* INTRODUCTION */}

      <section className="about-page__intro">
        <div className="about-page__section-label">
          <span>02</span>
          <span>WHO WE ARE</span>
        </div>

        <div className="about-page__intro-content">
          <h2>
            Creating a culture where
            <span> students grow together.</span>
          </h2>

          <div className="about-page__intro-text">
            <p>
              ACES — the Computer Engineering Students' Association —
              is a student-led initiative focused on creating a
              stronger academic, technical and professional
              environment within the department.
            </p>

            <p>
              Through workshops, competitions, projects, events and
              collaborative initiatives, ACES provides students with
              opportunities to explore technology beyond the
              classroom.
            </p>

            <p>
              Our goal is simple: create an environment where
              curiosity becomes knowledge, knowledge becomes
              experience, and experience becomes impact.
            </p>
          </div>
        </div>
      </section>


      {/* VISION */}

      <section className="about-page__vision">
        <div className="about-page__section-label">
          <span>03</span>
          <span>OUR VISION</span>
        </div>

        <div className="about-page__vision-content">
          <p className="about-page__quote">
            "Build a community of students who are
            <span> technically strong, creatively curious
            and ready to lead.</span>"
          </p>

          <div className="about-page__vision-meta">
            <span>ACES VISION 2026 — 27</span>
          </div>
        </div>
      </section>


      {/* FOUR PILLARS */}

      <section className="about-page__pillars">
        <div className="about-page__section-label">
          <span>04</span>
          <span>THE FOUR PILLARS</span>
        </div>

        <div className="about-page__pillars-intro">
          <h2>
            WHAT
            <br />
            <span>DRIVES US.</span>
          </h2>

          <p>
            Everything ACES does is built around four simple
            principles that guide our community and initiatives.
          </p>
        </div>

        <div className="about-page__pillar-list">
          {pillars.map((pillar) => (
            <article
              className="about-page__pillar"
              key={pillar.number}
            >
              <div className="about-page__pillar-number">
                {pillar.number}
              </div>

              <div className="about-page__pillar-main">
                <div className="about-page__pillar-heading">
                  <h3>{pillar.title}</h3>

                  <span>{pillar.short}</span>
                </div>

                <p className="about-page__pillar-description">
                  {pillar.description}
                </p>

                <div className="about-page__pillar-details">
                  {pillar.details.map((detail) => (
                    <span key={detail}>
                      {detail}
                    </span>
                  ))}
                </div>
              </div>

              <ArrowUpRight
                className="about-page__pillar-arrow"
                size={22}
              />
            </article>
          ))}
        </div>
      </section>


      {/* WHAT WE DO */}

      <section className="about-page__work">
        <div className="about-page__section-label">
          <span>05</span>
          <span>WHAT WE DO</span>
        </div>

        <div className="about-page__work-grid">
          <div>
            <h2>
              FROM
              <br />
              <span>IDEAS</span>
              <br />
              TO IMPACT.
            </h2>
          </div>

          <div className="about-page__work-list">
            <div>
              <span>01</span>
              <p>Technical Workshops</p>
            </div>

            <div>
              <span>02</span>
              <p>Flagship Events</p>
            </div>

            <div>
              <span>03</span>
              <p>DSA & Problem Solving</p>
            </div>

            <div>
              <span>04</span>
              <p>Projects & Competitions</p>
            </div>

            <div>
              <span>05</span>
              <p>Community Initiatives</p>
            </div>

            <div>
              <span>06</span>
              <p>Student Development</p>
            </div>
          </div>
        </div>
      </section>


      {/* CLOSING */}

      <section className="about-page__closing">
        <p>LEARN. BUILD. CONNECT. LEAD.</p>

        <h2>
          THIS IS
          <br />
          <span>ACES.</span>
        </h2>

        <a href="/committee" className="about-page__closing-button">
          MEET THE TEAM
          <ArrowUpRight size={18} />
        </a>
      </section>

    </main>
  );
};

export default AboutPage;