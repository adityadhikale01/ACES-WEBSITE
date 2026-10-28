import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDown, Users } from 'lucide-react';
import { api } from '../../services/api.js';

export function Hero() {
  const canvasRef = useRef(null);
  const [groupPhotoUrl, setGroupPhotoUrl] = useState('/assets/aces-team.jpg');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.content.get('branding');
        if (res.success && res.data?.groupPhotoUrl) {
          setGroupPhotoUrl(res.data.groupPhotoUrl);
        }
      } catch {
        // Fallback
      }
    };
    fetchBranding();
  }, []);

  // Subtle constellation particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 650;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const count = Math.min(Math.floor(width / 25), 40);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.4 + 0.15,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.18 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-60"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-electric-cyan">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DEPARTMENT OF COMPUTER ENGINEERING</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Where Ideas <br />
              <span className="text-gradient">Meet Innovation.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              Official student association of MVPS's KBTCOE Nashik. We organize hands-on technical workshops, competitive hackathons, industry sessions, and peer learning initiatives.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/events"
                className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-electric-blue to-electric-indigo hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-electric-blue/25 flex items-center gap-2 transition-all"
              >
                <span>Explore Events</span>
                <ArrowUpRight size={15} />
              </Link>
              <Link
                to="/team"
                className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2"
              >
                <span>Discover Team</span>
                <ArrowDown size={14} />
              </Link>
            </div>
          </div>

          {/* Right Visual Card: Group Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-navy-850/70 p-3 shadow-2xl shadow-black/80">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-navy-900 group">
                <img
                  src={groupPhotoUrl}
                  alt="ACES KBTCOE Executive Team 2026-27"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent" />

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <div className="bg-navy-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white font-medium flex items-center gap-1.5">
                    <Users size={14} className="text-electric-cyan" />
                    <span>ACES Committee 2026-27</span>
                  </div>
                  <Link
                    to="/team"
                    className="bg-electric-blue hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Meet Team</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
