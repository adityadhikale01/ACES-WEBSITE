import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export const CinematicIntro = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    const DURATION_MS = 5000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / DURATION_MS) * 100), 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Converging particle constellation toward center logo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const centerX = width / 2;
    const centerY = height / 2 - 40;

    // Create particles that converge inward
    const count = Math.min(Math.floor(width / 14), 85);
    const particles = [];
    for (let i = 0; i < count; i++) {
      // Spawn around outer ring or perimeter
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.max(width, height) * 0.45 + Math.random() * 200;
      particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        targetRadius: 75 + Math.random() * 35,
        targetAngle: angle,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        speed: 0.02 + Math.random() * 0.025,
        size: Math.random() * 2 + 1,
        color: i % 3 === 0 ? 'rgba(56, 189, 248, ' : i % 3 === 1 ? 'rgba(99, 102, 241, ' : 'rgba(147, 197, 253, ',
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle radial center pulse
      const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 320);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      grad.addColorStop(0.5, 'rgba(37, 99, 235, 0.05)');
      grad.addColorStop(1, 'rgba(5, 11, 20, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw faint converging orbit lines
      particles.forEach((p) => {
        // Move towards center target orbit
        const currentTargetX = centerX + Math.cos(p.targetAngle) * p.targetRadius;
        const currentTargetY = centerY + Math.sin(p.targetAngle) * p.targetRadius;

        p.x += (currentTargetX - p.x) * p.speed;
        p.y += (currentTargetY - p.y) * p.speed;
        p.targetAngle += 0.012; // swirl in orbit

        // Connect near particles
        for (let j = 0; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 75) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.1 * (1 - dist / 75)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isDismissing ? 0 : 1, scale: isDismissing ? 1.05 : 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050b14] select-none overflow-hidden"
    >
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Atmospheric lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-electric-blue/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-electric-cyan/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Skip Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all backdrop-blur-md"
      >
        <span>Skip Intro</span>
        <ArrowRight size={13} />
      </button>

      {/* Main Center Stage */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg">
        {/* Converging Logo Frame with Pulsing Energy Rings */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative mb-8"
        >
          {/* Animated concentric rings */}
          <div className="absolute -inset-4 rounded-3xl border border-electric-cyan/30 animate-pulse pointer-events-none" />
          <div className="absolute -inset-8 rounded-full border border-electric-indigo/20 pointer-events-none animate-spin" style={{ animationDuration: '18s' }} />

          {/* Official ACES Logo */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-navy-900 border-2 border-electric-cyan/60 shadow-[0_0_40px_rgba(56,189,248,0.35)] flex items-center justify-center relative p-1.5 backdrop-blur-md">
            <img
              src="/assets/aces-logo.jpeg"
              alt="ACES KBTCOE Official Logo"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </motion.div>

        {/* Club Titles & Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="space-y-2 mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-electric-cyan font-semibold">
            <Sparkles size={12} className="text-electric-cyan" />
            <span>ACES KBTCOE</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">ESTD 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Where Ideas Meet <span className="text-gradient">Innovation.</span>
          </h1>

          <p className="text-xs text-slate-400 font-medium">
            Department of Computer Engineering • MVPS's KBTCOE Nashik
          </p>
        </motion.div>

        {/* Cinematic Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="w-64 space-y-2"
        >
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-electric-blue via-electric-cyan to-indigo-400 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono tracking-wider">
            <span>INITIALIZING EXPERIENCE</span>
            <span>{progress}%</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CinematicIntro;
