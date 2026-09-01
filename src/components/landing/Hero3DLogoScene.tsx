import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Hero3DLogoScene: React.FC = () => {
  const { responses, setActiveView } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const totalResponses = responses.length;

  // Smooth Mouse Parallax Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Subtle rotation angle calculation (-12 to +12 degrees)
    const rotateY = ((mouseX - width / 2) / (width / 2)) * 12;
    const rotateX = -((mouseY - height / 2) / (height / 2)) * 12;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-xl mx-auto h-[480px] lg:h-[520px] flex items-center justify-center select-none perspective-1000"
    >
      {/* Volumetric Radial Light Aura Behind Logo */}
      <div
        className={`absolute inset-0 bg-gradient-to-tr from-[#FF2A7A]/25 via-[#9333EA]/30 to-[#2563EB]/30 rounded-full blur-[120px] pointer-events-none transition-opacity duration-500 ${
          isHovered ? 'opacity-100 scale-110' : 'opacity-80 scale-100'
        }`}
      />

      {/* 3D PARALLAX LOGO CONTAINER */}
      <motion.div
        animate={{
          rotateX: rotate.x,
          rotateY: rotate.y,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative flex flex-col items-center justify-center z-20 cursor-pointer"
      >
        {/* Floating Idle Motion wrapper */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex items-center justify-center"
        >
          {/* Dimensional Rim Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF455B] via-[#A855F7] to-[#3B82F6] opacity-35 blur-3xl pointer-events-none" />

          {/* Substantially Enlarged High-Res Transparent Logo Mark */}
          <img
            src="/logo-transparent.png"
            alt="Gradient Forms 3D Brand Logo Visual Anchor"
            className={`w-80 sm:w-96 md:w-[440px] h-auto object-contain relative z-20 transition-all duration-300 filter ${
              isHovered
                ? 'drop-shadow-[0_25px_60px_rgba(168,85,247,0.75)] brightness-110'
                : 'drop-shadow-[0_18px_40px_rgba(147,51,234,0.5)]'
            }`}
          />
        </motion.div>
      </motion.div>

      {/* 1. TOP RIGHT: ANALYTICS OS CONTROL CARD (BALANCED TOP-RIGHT PLACEMENT) */}
      <motion.div
        initial={{ y: -15, opacity: 0, x: 20 }}
        animate={{ y: [0, -10, 0], opacity: 1, x: 0 }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 },
          opacity: { duration: 0.8 }
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveView('analytics');
        }}
        title="Click to view full analytics OS control center"
        className="absolute top-4 right-0 sm:-right-6 z-30 px-4 py-3 rounded-2xl bg-[#121820]/95 border border-[#38BDF8]/50 hover:border-[#38BDF8] hover:scale-105 shadow-glow-cyan backdrop-blur-md space-y-1.5 cursor-pointer transition-all duration-200 group"
      >
        <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-[#38BDF8] font-bold">
          <div className="flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-[#38BDF8] group-hover:rotate-12 transition-transform" />
            <span>ANALYTICS OS</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <span className="text-xs font-semibold text-slate-200">Live Control Center</span>
          <span className="text-[11px] font-mono font-bold text-[#38BDF8] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            View Metrics <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </motion.div>

      {/* 2. BOTTOM LEFT: RESPONSES DASHBOARD CARD (BALANCED BOTTOM-LEFT PLACEMENT) */}
      <motion.div
        initial={{ y: 10, opacity: 0, x: -20 }}
        animate={{ y: [0, 8, 0], opacity: 1, x: 0 }}
        transition={{
          y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
          opacity: { duration: 0.8 }
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveView('responses');
        }}
        title="Click to view all form responses"
        className="absolute bottom-6 left-0 sm:-left-6 z-30 px-4 py-3 rounded-2xl bg-[#1A2332]/95 border border-[#8B5CF6]/50 hover:border-[#8B5CF6] hover:scale-105 shadow-glow-violet backdrop-blur-md space-y-1.5 cursor-pointer transition-all duration-200 group"
      >
        <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-[#8B5CF6] font-bold">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#8B5CF6] group-hover:scale-110 transition-transform" />
            <span>RESPONSES DASHBOARD</span>
          </div>
          <span className="text-[9px] text-[#10B981] bg-[#10B981]/15 px-1.5 py-0.2 rounded border border-[#10B981]/30 font-bold">
            Live
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold font-mono text-white">{totalResponses}</span>
            <span className="text-[11px] text-slate-400 font-medium">Submissions</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#8B5CF6] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            Inspect <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </motion.div>

      {/* Ambient Sparkle Orbit Points */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute top-1/4 left-8 w-1.5 h-1.5 rounded-full bg-[#38BDF8] opacity-60 animate-pulse" />
        <div className="absolute bottom-1/3 right-12 w-2 h-2 rounded-full bg-[#8B5CF6] opacity-70 animate-pulse" />
        <div className="absolute top-12 right-1/4 w-1.5 h-1.5 rounded-full bg-[#10B981] opacity-50 animate-pulse" />
      </div>
    </div>
  );
};
