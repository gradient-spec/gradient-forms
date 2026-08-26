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
    
    // Subtle rotation angle calculation (-10 to +10 degrees)
    const rotateY = ((mouseX - width / 2) / (width / 2)) * 10;
    const rotateX = -((mouseY - height / 2) / (height / 2)) * 10;

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
        className={`absolute inset-0 bg-gradient-to-tr from-[#FF2A7A]/20 via-[#9333EA]/25 to-[#2563EB]/25 rounded-full blur-[120px] pointer-events-none transition-opacity duration-500 ${
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
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF455B] via-[#A855F7] to-[#3B82F6] opacity-30 blur-3xl pointer-events-none" />

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

      {/* 1. TOP-RIGHT: ELEGANT ANALYTICS PILL CARD */}
      <motion.div
        initial={{ y: -15, opacity: 0, x: 20 }}
        animate={{ y: [0, -8, 0], opacity: 1, x: 0 }}
        transition={{
          y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 },
          opacity: { duration: 0.8 }
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveView('analytics');
        }}
        title="Click to view Analytics OS Control Center"
        className="absolute top-8 right-2 sm:-right-4 z-30 px-4 py-2.5 rounded-xl bg-[#1A2332]/90 border border-[#38BDF8]/40 hover:border-[#38BDF8] hover:scale-105 shadow-neo backdrop-blur-xl flex items-center gap-3 cursor-pointer transition-all duration-200 group"
      >
        <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition-transform">
          <PieChart className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-bold font-heading text-white">
            <span>Analytics OS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
          </div>
          <span className="text-[11px] font-sans text-slate-400 font-medium flex items-center gap-0.5 group-hover:text-[#38BDF8] transition-colors">
            Real-Time Metrics <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </motion.div>

      {/* 2. BOTTOM-LEFT: ELEGANT RESPONSES PILL CARD */}
      <motion.div
        initial={{ y: 10, opacity: 0, x: -20 }}
        animate={{ y: [0, 8, 0], opacity: 1, x: 0 }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
          opacity: { duration: 0.8 }
        }}
        onClick={(e) => {
          e.stopPropagation();
          setActiveView('responses');
        }}
        title="Click to view Responses Dashboard"
        className="absolute bottom-12 left-2 sm:-left-4 z-30 px-4 py-2.5 rounded-xl bg-[#1A2332]/90 border border-[#A855F7]/40 hover:border-[#A855F7] hover:scale-105 shadow-neo backdrop-blur-xl flex items-center gap-3 cursor-pointer transition-all duration-200 group"
      >
        <div className="w-8 h-8 rounded-lg bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] group-hover:scale-110 transition-transform">
          <BarChart3 className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-bold font-heading text-white">
            <span>{totalResponses} Submissions</span>
            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 rounded">
              Live
            </span>
          </div>
          <span className="text-[11px] font-sans text-slate-400 font-medium flex items-center gap-0.5 group-hover:text-[#A855F7] transition-colors">
            Inspect Data <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </motion.div>

      {/* Ambient Sparkle Orbit Points */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="absolute top-1/4 left-8 w-1.5 h-1.5 rounded-full bg-[#38BDF8] opacity-60 animate-pulse" />
        <div className="absolute bottom-1/3 right-12 w-2 h-2 rounded-full bg-[#A855F7] opacity-70 animate-pulse" />
        <div className="absolute top-12 right-1/4 w-1.5 h-1.5 rounded-full bg-[#10B981] opacity-50 animate-pulse" />
      </div>
    </div>
  );
};
