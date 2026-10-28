import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aces-logo.jpeg"
                alt="ACES Logo"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <span className="font-extrabold text-base text-white tracking-tight">
                  ACES <span className="text-electric-blue">KBTCOE</span>
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Students' Association
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Association of Computer Engineering Students at Maratha Vidya Prasarak Samaj's Karmaveer Adv. Baburao Ganpatrao Thakare College of Engineering, Nashik.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/events" className="hover:text-electric-cyan transition-colors">
                  Workshops & Events
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-electric-cyan transition-colors">
                  Committee Team 2026-27
                </Link>
              </li>
              <li>
                <Link to="/activities" className="hover:text-electric-cyan transition-colors">
                  Department Activities
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-electric-cyan transition-colors">
                  Event Photo Gallery
                </Link>
              </li>
              <li>
                <Link to="/apply" className="hover:text-electric-cyan transition-colors">
                  Join ACES Committee
                </Link>
              </li>
            </ul>
          </div>

          {/* Department Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Department & College
            </h4>
            <div className="text-xs space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-electric-cyan flex-shrink-0 mt-0.5" />
                <span>
                  Department of Computer Engineering, MVPS's KBTCOE, Udoji Maratha Boarding Campus, Gangapur Road, Nashik - 422013, Maharashtra.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-electric-cyan flex-shrink-0" />
                <span>aces.kbtcoe@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Official Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://kbtcoe.org"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>College Website (KBTCOE)</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About the Committee
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Inquiries & Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} ACES KBTCOE. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-500">
            <span>Built for the students of Computer Engineering</span>
            <Heart size={12} className="text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
