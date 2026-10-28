import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDown, Calendar, Sparkles, Users } from 'lucide-react';
import { api } from '../../services/api.js';

export const Hero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [groupPhotoUrl, setGroupPhotoUrl] = useState<string>('/assets/aces-team.jpg');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.content.get('branding');
        if (res.success && res.data?.groupPhotoUrl) {
          setGroupPhotoUrl(res.data.groupPhotoUrl);
        }
      } catch {
        // Fallback to /assets/aces-team.jpg
      }
    };
    fetchBranding();
  }, []);

  // Subtle animated technical particle constellation background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 650;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];

    const particleCount = Math.min(Math.floor(width / 22), 45);
    for (let i = 0; i < particleCount; i++) {
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

      // Draw faint connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
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
        ctx.fillStyle = `rgba(96, 165, 250, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-60 z-0"
      />

      {/* Atmospheric Radial Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-electric-blue/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-electric-cyan/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Header */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-electric-cyan animate-pulse" />
              <span className="font-semibold text-slate-200">Department of Computer Engineering</span>
              <span className="text-slate-500">•</span>
              <span className="text-electric-cyan">KBTCOE Nashik</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
            >
              Where Ideas Meet <br className="hidden sm:inline" />
              <span className="text-gradient">Innovation.</span>
            </motion.h1>

            {/* Supporting Copy */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Discover departmental activities, technical workshops, competitive hackathons,
              and the engineering student community that makes <strong className="text-white font-semibold">ACES KBTCOE</strong> happen.
            </motion.p>

            {/* CTAs & Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <Link
                to="/events"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-electric-indigo text-white font-bold text-sm shadow-lg shadow-electric-blue/30 hover:shadow-electric-blue/50 hover:-translate-y-0.5 transition-all"
              >
                <span>Explore Events</span>
                <ArrowUpRight size={16} />
              </Link>

              <Link
                to="/about"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 hover:border-slate-500 transition-all"
              >
                <span>Discover ACES</span>
                <Sparkles size={15} className="text-electric-cyan" />
              </Link>
            </motion.div>

            {/* Four Pillars Micro-Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-6 flex items-center justify-center lg:justify-start gap-3 sm:gap-6 text-xs text-slate-400 border-t border-white/5"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <span className="text-electric-cyan font-bold">01</span> LEARN
              </span>
              <span className="text-slate-600">/</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="text-electric-cyan font-bold">02</span> BUILD
              </span>
              <span className="text-slate-600">/</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="text-electric-cyan font-bold">03</span> CONNECT
              </span>
              <span className="text-slate-600">/</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="text-electric-cyan font-bold">04</span> LEAD
              </span>
            </motion.div>
          </div>

          {/* Right Visual: Actual Club Team Photo Card & Interactive Accent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-navy-850/70 p-3 shadow-2xl shadow-black/80">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-navy-900 group">
                <img
                  src={groupPhotoUrl}
                  alt="ACES KBTCOE Executive Team 2026-27"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent" />

                {/* Card Overlay Badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <div className="bg-navy-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white font-medium flex items-center gap-1.5">
                    <Users size={14} className="text-electric-cyan" />
                    <span>ACES Committee 2026-27</span>
                  </div>
                  <Link
                    to="/team"
                    className="bg-electric-blue/90 hover:bg-electric-blue text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Meet Team</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Quick stats ribbon */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-white/5 text-center">
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="text-base font-bold text-white">50+</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Members</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="text-base font-bold text-electric-cyan">03</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Flagships</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="text-base font-bold text-amber-400">100%</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Student-Led</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
