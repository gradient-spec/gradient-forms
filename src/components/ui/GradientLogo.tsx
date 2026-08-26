import React from 'react';

interface GradientLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  animate?: boolean;
}

export const GradientLogo: React.FC<GradientLogoProps> = ({
  className = '',
  size = 360,
  showText = false,
  animate = false
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      <div className={`relative flex items-center justify-center ${animate ? 'animate-float' : ''}`} style={{ width: size }}>
        {/* Ambient Radial Glow Behind Logo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF2A7A]/20 via-[#9333EA]/25 to-[#2563EB]/25 rounded-full blur-3xl pointer-events-none" />

        {/* High-Res Transparent Official Logo Image */}
        <img
          src="/logo-transparent.png"
          alt="Gradient Forms Logo"
          className="w-full h-auto object-contain relative z-10 filter drop-shadow-[0_15px_35px_rgba(147,51,234,0.4)] transition-transform duration-300 hover:scale-105"
        />
      </div>

      {showText && (
        <div className="mt-3">
          <h2
            className="text-3xl sm:text-4xl font-extrabold tracking-[0.18em] font-heading uppercase"
            style={{
              backgroundImage: 'linear-gradient(to right, #FFA07A, #FF455B, #EC4899, #A855F7, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            GRADIENT
          </h2>
        </div>
      )}
    </div>
  );
};
