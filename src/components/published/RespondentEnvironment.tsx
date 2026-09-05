import React, { useEffect, useRef, useState } from 'react';

interface RespondentEnvironmentProps {
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speedY: number;
  speedX: number;
  tailLength: number;
  isShootingStar?: boolean;
}

export const RespondentEnvironment: React.FC<RespondentEnvironmentProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Parallax tracking
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY || window.pageYOffset || 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Falling star / particle canvas system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize particles: sparse, subtle, tiny distant stars
    const particleCount = Math.min(Math.floor((width * height) / 30000), 45);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.15,
        speedY: Math.random() * 0.4 + 0.15,
        speedX: (Math.random() - 0.5) * 0.15,
        tailLength: Math.random() > 0.8 ? Math.random() * 18 + 8 : 0,
        isShootingStar: Math.random() > 0.92
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        ctx.beginPath();
        if (p.tailLength > 0) {
          // Subtle downward/diagonal streak
          const gradient = ctx.createLinearGradient(p.x, p.y - p.tailLength, p.x, p.y);
          gradient.addColorStop(0, 'rgba(56, 189, 248, 0)');
          gradient.addColorStop(1, `rgba(186, 230, 253, ${p.alpha})`);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = p.radius;
          ctx.moveTo(p.x - p.speedX * (p.tailLength / p.speedY), p.y - p.tailLength);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else {
          // Tiny glowing star point
          ctx.fillStyle = `rgba(224, 242, 254, ${p.alpha})`;
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        if (!prefersReducedMotion) {
          p.y += p.speedY;
          p.x += p.speedX;

          // Wrap around top/sides
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
        }
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const parallaxOffset = scrollY * 0.08;

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}>
      {/* 1. Deep Space Base Background */}
      <div className="absolute inset-0 bg-[#060A13]" />

      {/* 2. Ambient Focal Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[650px] bg-gradient-to-b from-[#1E3A8A]/20 via-[#0F224A]/15 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#38BDF8]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[550px] h-[550px] bg-[#2563EB]/8 rounded-full blur-[160px] pointer-events-none" />

      {/* 3. Faint Barely-Visible Topographic Texture Layer */}
      <div
        className="absolute inset-0 opacity-[0.035] bg-repeat mix-blend-screen pointer-events-none transition-transform duration-100 ease-out"
        style={{
          backgroundImage: 'url("/bg-topography.png")',
          backgroundSize: '480px 480px',
          transform: `translate3d(0, ${-parallaxOffset * 0.5}px, 0)`
        }}
      />

      {/* 4. Enormous Barely-Visible 3D Gradient Forms Emblem Watermark */}
      <div
        className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 w-[340px] sm:w-[500px] md:w-[620px] aspect-square pointer-events-none transition-transform duration-300 ease-out flex items-center justify-center"
        style={{
          transform: `translate3d(-50%, ${parallaxOffset}px, 0)`
        }}
      >
        {/* Soft radial cyan/blue back-glow behind the emblem */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#2563EB]/25 via-[#38BDF8]/20 to-[#9333EA]/20 blur-[140px] opacity-75" />

        {/* 3D Official Gradient Forms Watermark Logo */}
        <img
          src="/favicon.svg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain filter drop-shadow-[0_20px_60px_rgba(56,189,248,0.45)] opacity-[0.18] sm:opacity-[0.24] select-none"
        />
      </div>

      {/* 5. Falling Stars & Tiny Atmospheric Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.85 }}
      />

      {/* 6. Subtle Vignette Depth Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060A13]/30 to-[#060A13] pointer-events-none" />
    </div>
  );
};
