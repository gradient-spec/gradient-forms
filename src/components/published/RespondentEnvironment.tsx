import React, { useEffect, useRef } from 'react';

interface RespondentEnvironmentProps {
  className?: string;
}

interface AmbientStar {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  maxAlpha: number;
  active: boolean;
  delay: number;
  color: 'cyan' | 'purple' | 'blue';
}

export const RespondentEnvironment: React.FC<RespondentEnvironmentProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Celestial Starfield & Shooting Stars Canvas System
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 1. Ambient Background Stars (subtle, non-distracting twinkling cosmos)
    const starCount = Math.min(Math.floor((width * height) / 18000), 75);
    const ambientStars: AmbientStar[] = [];
    for (let i = 0; i < starCount; i++) {
      const baseAlpha = Math.random() * 0.45 + 0.15;
      ambientStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2 + 0.4,
        baseAlpha,
        alpha: baseAlpha,
        twinkleSpeed: Math.random() * 0.03 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // 2. Dedicated Shooting Stars System (more frequent, elegant diagonal meteors)
    const shootingStarPoolSize = 5;
    const shootingStars: ShootingStar[] = [];

    const colors: ('cyan' | 'purple' | 'blue')[] = ['cyan', 'cyan', 'purple', 'blue', 'cyan'];

    const resetShootingStar = (s: ShootingStar, immediate = false) => {
      s.x = Math.random() * (width * 1.1) - width * 0.05;
      s.y = Math.random() * (height * 0.45) - 40;
      s.length = Math.random() * 60 + 50; // 50px - 110px tail length
      s.speed = Math.random() * 4 + 4.5; // 4.5 - 8.5 px/frame
      s.angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.25; // ~40-50 degree downward angle
      s.maxAlpha = Math.random() * 0.45 + 0.35;
      s.alpha = 0;
      s.active = immediate;
      s.delay = immediate ? 0 : Math.floor(Math.random() * 180) + 30; // 0.5s - 3.5s delay
    };

    for (let i = 0; i < shootingStarPoolSize; i++) {
      const s: ShootingStar = {
        x: 0,
        y: 0,
        length: 80,
        speed: 5,
        angle: Math.PI / 4,
        alpha: 0,
        maxAlpha: 0.6,
        active: false,
        delay: i * 45, // Stagger initial spawn
        color: colors[i % colors.length]
      };
      resetShootingStar(s, i === 0); // Start 1 immediately, stagger rest
      shootingStars.push(s);
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Ambient Stars
      ambientStars.forEach((star) => {
        if (!prefersReducedMotion) {
          star.twinklePhase += star.twinkleSpeed;
          star.alpha = star.baseAlpha + Math.sin(star.twinklePhase) * 0.18;
          if (star.alpha < 0.08) star.alpha = 0.08;
        }

        ctx.fillStyle = `rgba(224, 242, 254, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Shooting Stars
      if (!prefersReducedMotion) {
        shootingStars.forEach((star) => {
          if (!star.active) {
            star.delay--;
            if (star.delay <= 0) {
              star.active = true;
              star.alpha = 0;
            }
            return;
          }

          // Fade in then travel
          if (star.alpha < star.maxAlpha) {
            star.alpha = Math.min(star.alpha + 0.08, star.maxAlpha);
          }

          // Direction components
          const vx = Math.cos(star.angle) * star.speed;
          const vy = Math.sin(star.angle) * star.speed;

          const tailX = star.x - Math.cos(star.angle) * star.length;
          const tailY = star.y - Math.sin(star.angle) * star.length;

          // Draw Glowing Meteor Trail
          const trailGradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
          if (star.color === 'purple') {
            trailGradient.addColorStop(0, 'rgba(147, 51, 234, 0)');
            trailGradient.addColorStop(0.65, `rgba(168, 85, 247, ${star.alpha * 0.6})`);
            trailGradient.addColorStop(1, `rgba(240, 246, 255, ${star.alpha})`);
          } else {
            trailGradient.addColorStop(0, 'rgba(56, 189, 248, 0)');
            trailGradient.addColorStop(0.65, `rgba(56, 189, 248, ${star.alpha * 0.6})`);
            trailGradient.addColorStop(1, `rgba(255, 255, 255, ${star.alpha})`);
          }

          ctx.beginPath();
          ctx.strokeStyle = trailGradient;
          ctx.lineWidth = 1.6;
          ctx.lineCap = 'round';
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(star.x, star.y);
          ctx.stroke();

          // Bright Head Point
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, 1.2, 0, Math.PI * 2);
          ctx.fill();

          // Advance Position
          star.x += vx;
          star.y += vy;

          // Out of screen bounds check
          if (star.x > width + 100 || star.y > height + 100) {
            resetShootingStar(star, false);
          }
        });
      }

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

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden select-none ${className}`}>
      {/* 1. Deep Space Base Background */}
      <div className="absolute inset-0 bg-[#060A13]" />

      {/* 2. Ambient Focal Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[650px] bg-gradient-to-b from-[#1E3A8A]/20 via-[#0F224A]/15 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#38BDF8]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[550px] h-[550px] bg-[#2563EB]/8 rounded-full blur-[160px] pointer-events-none" />

      {/* 3. Faint Barely-Visible Topographic Texture Layer (Static) */}
      <div
        className="absolute inset-0 opacity-[0.035] bg-repeat mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: 'url("/bg-topography.png")',
          backgroundSize: '480px 480px'
        }}
      />

      {/* 4. STATIC Official Gradient Forms Logo Watermark in Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] md:w-[620px] aspect-square pointer-events-none flex items-center justify-center">
        {/* Soft radial purple/cyan/blue ambient aura behind the logo */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#FF2A7A]/15 via-[#9333EA]/20 to-[#2563EB]/20 blur-[140px] opacity-70" />

        {/* Static High-Res Transparent Official Logo Image */}
        <img
          src="/logo-transparent.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain filter drop-shadow-[0_20px_60px_rgba(147,51,234,0.35)] opacity-[0.18] sm:opacity-[0.24] select-none"
        />
      </div>

      {/* 5. Celestial Stars & Enhanced Shooting Stars Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.95 }}
      />

      {/* 6. Subtle Vignette Depth Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060A13]/25 to-[#060A13] pointer-events-none" />
    </div>
  );
};
