import React, { useState, useEffect } from 'react';

export const AmbientBackground: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY || window.pageYOffset || 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const backgroundY = scrollY * 0.2;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Primary Background Base */}
      <div className="absolute inset-0 bg-[#0B0F14]" />

      {/* Dim Barely-Visible Topographic Contour Line Texture (Opacity 0.03) */}
      <div
        className="absolute inset-0 opacity-[0.03] bg-repeat mix-blend-screen pointer-events-none transition-transform duration-75 ease-out"
        style={{
          backgroundImage: 'url("/bg-topography.png")',
          backgroundSize: '420px 420px',
          transform: `translate3d(0, ${-backgroundY}px, 0)`
        }}
      />

      {/* Structural Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-grid-neo opacity-15 pointer-events-none" />

      {/* Focal Hero Radial Light Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-[#2563EB]/15 via-[#9333EA]/10 to-transparent rounded-full blur-[180px] pointer-events-none" />

      {/* Soft Volumetric Side Depth Glows */}
      <div
        className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-[#2563EB]/10 rounded-full blur-[160px] pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(0, ${backgroundY * 0.15}px, 0)` }}
      />
      <div
        className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-[#1D4ED8]/12 rounded-full blur-[180px] pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(0, ${-backgroundY * 0.2}px, 0)` }}
      />
    </div>
  );
};
