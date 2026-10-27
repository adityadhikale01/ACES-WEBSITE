import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  User,
  ShieldCheck,
  LogOut,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

const mainLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Events', path: '/events' },
  { label: 'Team', path: '/team' },
];

const exploreLinks = [
  { label: 'Activities', path: '/activities', desc: 'Departmental workshops & sessions' },
  { label: 'Achievements', path: '/achievements', desc: 'Student awards & recognitions' },
  { label: 'Gallery', path: '/gallery', desc: 'Campus moments & event captures' },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = () => {
    setIsMobileOpen(false);
    setIsExploreOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-3' : 'py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between px-4 sm:px-6 h-16 rounded-2xl transition-all duration-300 border ${
              isScrolled
                ? 'bg-navy-900/90 backdrop-blur-xl border-slate-700/40 shadow-2xl shadow-black/50'
                : 'bg-navy-850/60 backdrop-blur-md border-white/10'
            }`}
          >
            {/* Brand Logo & Title */}
            <Link to="/" onClick={closeMobile} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-0.5 group-hover:border-electric-cyan/50 transition-colors">
                <img
                  src="/assets/aces-logo.jpeg"
                  alt="ACES KBTCOE Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback if image not ready
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-extrabold text-lg text-white tracking-tight">
                    ACES
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-electric-blue/20 text-electric-cyan border border-electric-blue/30">
                    KBTCOE
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium hidden sm:block">
                  Computer Engineering
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {mainLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'text-white bg-white/10 shadow-inner'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Explore Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsExploreOpen(true)}
                onMouseLeave={() => setIsExploreOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  onClick={() => setIsExploreOpen(!isExploreOpen)}
                >
                  <span>Explore</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      isExploreOpen ? 'rotate-180 text-electric-cyan' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isExploreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 p-2 rounded-xl bg-navy-850/95 backdrop-blur-2xl border border-slate-700/50 shadow-2xl z-50"
                    >
                      <div className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 mb-1">
                        <Sparkles size={12} className="text-electric-cyan" />
                        <span>Discover Initiatives</span>
                      </div>
                      {exploreLinks.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsExploreOpen(false)}
                          className={({ isActive }) =>
                            `flex items-start justify-between p-2.5 rounded-lg transition-colors group ${
                              isActive
                                ? 'bg-electric-blue/15 text-white'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`
                          }
                        >
                          <div>
                            <div className="text-xs font-semibold text-white group-hover:text-electric-cyan transition-colors">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-400">{item.desc}</div>
                          </div>
                          <ArrowUpRight
                            size={14}
                            className="text-slate-500 group-hover:text-electric-cyan transition-colors mt-0.5"
                          />
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                Contact
              </NavLink>
            </nav>

            {/* Desktop Auth & CTAs */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-slate-500 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-electric-blue to-electric-indigo text-white flex items-center justify-center text-xs font-bold shadow">
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                      {user?.fullName?.split(' ')[0]}
                    </span>
                    {isAdmin && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        ADMIN
                      </span>
                    )}
                    <ChevronDown size={13} className="text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 p-2 rounded-xl bg-navy-850/95 backdrop-blur-2xl border border-slate-700/60 shadow-2xl z-50"
                      >
                        <div className="px-3 py-2 border-b border-white/5 mb-1">
                          <div className="text-xs font-bold text-white truncate">{user?.fullName}</div>
                          <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                        </div>

                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <User size={14} className="text-electric-cyan" />
                          <span>Member Dashboard</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition-colors"
                          >
                            <ShieldCheck size={14} className="text-amber-400" />
                            <span>Admin Portal</span>
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/join"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white text-xs font-bold hover:shadow-lg hover:shadow-electric-blue/25 hover:-translate-y-0.5 transition-all"
                  >
                    <span>Join ACES</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
                aria-label="Toggle navigation"
              >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-navy-950/95 backdrop-blur-2xl pt-24 px-6 pb-8 flex flex-col justify-between overflow-y-auto md:hidden"
          >
            <div className="space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
                Main Navigation
              </div>
              <div className="space-y-1">
                {mainLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold ${
                        isActive
                          ? 'bg-electric-blue/20 text-electric-cyan border border-electric-blue/30'
                          : 'text-slate-200 hover:bg-white/5'
                      }`
                    }
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight size={16} className="text-slate-500" />
                  </NavLink>
                ))}
              </div>

              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pt-3">
                Explore Club
              </div>
              <div className="space-y-1">
                {exploreLinks.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobile}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5"
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-slate-500">{item.desc}</span>
                  </NavLink>
                ))}
                <NavLink
                  to="/contact"
                  onClick={closeMobile}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5"
                >
                  <span>Contact ACES</span>
                </NavLink>
              </div>
            </div>

            {/* Mobile Auth Bottom CTAs */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={closeMobile}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/15"
                  >
                    <User size={16} />
                    <span>Member Dashboard ({user?.fullName?.split(' ')[0]})</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={closeMobile}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500/20 text-amber-300 font-semibold text-sm border border-amber-500/30"
                    >
                      <ShieldCheck size={16} />
                      <span>Admin Management Portal</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobile();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-rose-400 font-semibold text-xs hover:bg-rose-500/10"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="flex items-center justify-center py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/join"
                    onClick={closeMobile}
                    className="flex items-center justify-center gap-1 py-3 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-semibold text-sm"
                  >
                    <span>Join ACES</span>
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
