import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import "./Navbar.css";
import acesLogo from "../../assets/aceslogo.jpeg";
const mainLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Events", path: "/events" },
  { label: "Committee", path: "/committee" },
];

const exploreLinks = [
  { label: "Activities", path: "/activities" },
  { label: "Achievements", path: "/achievements" },
  { label: "Gallery", path: "/gallery" },
];

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`aces-navbar ${
          isScrolled ? "aces-navbar--scrolled" : ""
        }`}
      >
        <div className="aces-navbar-container">

          {/* Brand */}
          <NavLink
            to="/"
            className="aces-navbar-brand"
            onClick={closeMobileMenu}
          >
            <div className="aces-navbar-logo">
                <img
                  src={acesLogo}
                  alt="ACES Logo"
                />
              </div>

            <div className="aces-navbar-brand-content">
              <span className="aces-navbar-brand-name">
                ACES
              </span>

              <span className="aces-navbar-brand-sub">
                Computer Engineering
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="aces-navbar-nav">
            {mainLinks.map((link) => (
              <NavItem
                key={link.path}
                to={link.path}
                label={link.label}
              />
            ))}

            {/* Explore */}
            <div
              className="aces-navbar-dropdown"
              onMouseEnter={() => setIsExploreOpen(true)}
              onMouseLeave={() => setIsExploreOpen(false)}
            >
              <button
                className="aces-navbar-dropdown-trigger"
                onClick={() =>
                  setIsExploreOpen((prev) => !prev)
                }
              >
                <span>Explore</span>

                <motion.span
                  animate={{
                    rotate: isExploreOpen ? 180 : 0,
                  }}
                >
                  <ChevronDown size={15} />
                </motion.span>
              </button>

              <AnimatePresence>
                {isExploreOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                      scale: 0.96,
                    }}
                    transition={{ duration: 0.2 }}
                    className="aces-navbar-dropdown-menu"
                  >
                    <div className="aces-navbar-dropdown-header">
                      <Sparkles size={15} />
                      <span>Discover ACES</span>
                    </div>

                    {exploreLinks.map((link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() =>
                          setIsExploreOpen(false)
                        }
                        className={({ isActive }) =>
                          `aces-navbar-dropdown-item ${
                            isActive
                              ? "aces-navbar-dropdown-item--active"
                              : ""
                          }`
                        }
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight size={15} />
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* CTA */}
          <NavLink
            to="/join"
            className="aces-navbar-cta"
          >
            <span>Join ACES</span>
            <ArrowUpRight size={16} />
          </NavLink>

          {/* Mobile Toggle */}
          <button
            className="aces-navbar-mobile-toggle"
            onClick={() =>
              setIsMobileOpen((prev) => !prev)
            }
            aria-label={
              isMobileOpen
                ? "Close navigation"
                : "Open navigation"
            }
            aria-expanded={isMobileOpen}
          >
            <AnimatePresence mode="wait">
              {isMobileOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X size={23} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Menu size={23} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="aces-navbar-mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="aces-navbar-mobile-content"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {mainLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    delay: index * 0.06,
                  }}
                >
                  <MobileNavItem
                    to={link.path}
                    label={link.label}
                    onClick={closeMobileMenu}
                  />
                </motion.div>
              ))}

              <div className="aces-navbar-mobile-section">
                <span>EXPLORE</span>

                {exploreLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className="aces-navbar-mobile-subitem"
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <NavLink
                to="/join"
                onClick={closeMobileMenu}
                className="aces-navbar-mobile-cta"
              >
                Join ACES
                <ArrowUpRight size={18} />
              </NavLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `aces-navbar-link ${
          isActive ? "aces-navbar-link--active" : ""
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span>{label}</span>

          {isActive && (
            <motion.span
              layoutId="aces-navbar-active"
              className="aces-navbar-active-line"
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 35,
              }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function MobileNavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onClick}
      className={({ isActive }) =>
        `aces-navbar-mobile-item ${
          isActive
            ? "aces-navbar-mobile-item--active"
            : ""
        }`
      }
    >
      {label}
      <ArrowUpRight size={19} />
    </NavLink>
  );
}

export default Navbar;