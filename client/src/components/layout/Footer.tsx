import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight, Github, Linkedin, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-navy-950/80 backdrop-blur-md pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 p-0.5">
                <img
                  src="/assets/aces-logo.jpeg"
                  alt="ACES KBTCOE Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-heading font-extrabold text-lg text-white tracking-tight">
                  ACES KBTCOE
                </span>
                <p className="text-[10px] uppercase tracking-wider text-electric-cyan font-semibold">
                  Computer Engineering Students' Association
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The official departmental student club of Computer Engineering at MVPS's KBT College of Engineering,
              Nashik. Empowering students through technical workshops, competitive hackathons, and leadership.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                Term 2026 - 27
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Learn. Build. Connect. Lead.</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-electric-cyan transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-electric-cyan transition-colors">
                  About ACES
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-electric-cyan transition-colors">
                  Departmental Events
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-electric-cyan transition-colors">
                  Committee Team 2026-27
                </Link>
              </li>
              <li>
                <Link to="/join" className="hover:text-electric-cyan transition-colors">
                  Membership Application
                </Link>
              </li>
            </ul>
          </div>

          {/* Initiatives */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Initiatives
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/activities" className="hover:text-electric-cyan transition-colors">
                  Workshops & Sessions
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="hover:text-electric-cyan transition-colors">
                  Student Achievements
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-electric-cyan transition-colors">
                  Media & Event Gallery
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-electric-cyan transition-colors">
                  Member Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Institution */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Campus Contact
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-electric-cyan flex-shrink-0 mt-0.5" />
                <span>Dept. of Computer Engineering, MVPS's KBTCOE, Gangapur Road, Nashik - 422013</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-electric-cyan flex-shrink-0" />
                <a href="mailto:aces.kbtcoe@gmail.com" className="hover:text-white transition-colors">
                  aces.kbtcoe@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-electric-cyan flex-shrink-0" />
                <span>+91 253 2571439</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026-2027 <span className="text-slate-300 font-semibold">ACES KBTCOE</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-500">Where Ideas Meet Innovation.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
