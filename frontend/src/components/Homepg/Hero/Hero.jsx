import { ArrowUpRight, ArrowDown } from "lucide-react";
import "./Hero.css";
import HeroImage from "../../../assets/teamphoto.jpg";
const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__content">
        <p className="hero__eyebrow">
          COMPUTER ENGINEERING STUDENTS' ASSOCIATION
        </p>

        <h1 className="hero__title">
          BUILD.
          <br />
          <span>LEARN.</span>
          <br />
          LEAD.
        </h1>

        <p className="hero__description">
          A student-driven community focused on technology,
          collaboration, innovation, and growth.
        </p>

        <div className="hero__actions">
          <a href="#about" className="hero__button">
            EXPLORE ACES
            <ArrowUpRight size={17} />
          </a>

          <a href="#about" className="hero__scroll">
            SCROLL TO EXPLORE
            <ArrowDown size={16} />
          </a>
        </div>
      </div>

      {/* Team Photo */}
      <div className="hero__image">
        <img
          src={HeroImage}
          alt="ACES Committee Team"
        />
      </div>

      <div className="hero__bottom">
        <span>ACES 2026 — 27</span>
        <span>COMPUTER ENGINEERING</span>
      </div>
    </section>
  );
};

export default Hero;