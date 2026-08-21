import "./AcesNumbers.css";

const numbers = [
  {
    value: "50+",
    label: "ACTIVE MEMBERS",
  },
  {
    value: "09",
    label: "MONTHS COMMITTEE PERIOD",
  },
  {
    value: "03",
    label: "FLAGSHIP EVENTS 2026–27",
  },
  {
    value: "∞",
    label: "POSSIBILITIES",
  },
];

const AcesNumbers = () => {
  return (
    <section className="aces-numbers">
      <div className="aces-numbers__container">

        {/* Section Header */}
        <div className="aces-numbers__header">
          <span>02 — ACES NUMBERS</span>
          <span>2026 — 27</span>
        </div>

        {/* Numbers */}
        <div className="aces-numbers__inner">
          {numbers.map((item) => (
            <article
              className="aces-number"
              key={item.label}
            >
              <div className="aces-number__value">
                {item.value}
              </div>

              <div className="aces-number__label">
                {item.label}
              </div>
            </article>
          ))}
        </div>

        {/* Footer */}
        <div className="aces-numbers__footer">
          <span>COMPUTER ENGINEERING</span>
          <span>KBTCOE · NASHIK</span>
        </div>

      </div>
    </section>
  );
};

export default AcesNumbers;