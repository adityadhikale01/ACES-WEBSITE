import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, LogOut, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../../auth/useAuth.js';
import { api } from '../../services/api.js';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/assets/aces-logo.jpeg');
  const location = useLocation();
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await api.content.get('branding');
        if (res.success && res.data?.logoUrl) {
          setLogoUrl(res.data.logoUrl);
        }
      } catch {
        // Fallback to /assets/aces-logo.jpeg
      }
    };
    fetchLogo();
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Team', path: '/team' },
    { name: 'About', path: '/about' },
    { name: 'Activities', path: '/activities' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Join Us', path: '/apply' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-navy-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/40'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/10 group-hover:border-electric-blue/50 transition-colors shadow-md">
              <img
                src={logoUrl}
                alt="ACES KBTCOE"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-electric-cyan transition-colors">
                ACES <span className="text-electric-blue">KBTCOE</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider font-medium uppercase">
                Dept. of Computer Engg.
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'text-white bg-white/10 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-electric-indigo/20 border border-electric-indigo/40 text-electric-cyan text-xs font-bold hover:bg-electric-indigo/30 transition-colors"
                  >
                    <Shield size={14} />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
                  <User size={13} className="text-electric-cyan" />
                  <span className="max-w-[120px] truncate font-medium">
                    {currentUser?.name || 'Member'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-electric-blue to-electric-indigo hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-electric-blue/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-navy-950/95 backdrop-blur-xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-electric-indigo/20 text-electric-cyan text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Shield size={14} /> Admin Dashboard
                    </span>
                    <ChevronRight size={14} />
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 py-2 text-center rounded-lg bg-white/5 text-xs font-semibold text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 py-2 text-center rounded-lg bg-electric-blue text-xs font-bold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
