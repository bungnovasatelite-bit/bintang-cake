import React, { useState, useEffect } from 'react';
import { useCMS } from '../../context/CMSContext';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'w-9 h-9', size = 36 }) => {
  const { storeConfig } = useCMS();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [storeConfig.logoImage]);

  // Jika admin mengupload logo custom dan tidak error, tampilkan foto logo tersebut
  if (storeConfig.logoImage && !imgError) {
    return (
      <img
        src={storeConfig.logoImage}
        alt="Logo Bintang Cake"
        onError={() => setImgError(true)}
        style={{ width: size, height: size }}
        className={`inline-block shrink-0 rounded-full object-cover border border-[#D4A373]/60 shadow-xs ${className}`}
      />
    );
  }

  // Fallback: Ornate SVG seal
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-label="Logo Bintang Cake"
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2A669" />
          <stop offset="50%" stopColor="#C68945" />
          <stop offset="100%" stopColor="#8F5927" />
        </linearGradient>
        <radialGradient id="cakeBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4A2810" />
          <stop offset="100%" stopColor="#2A1405" />
        </radialGradient>
      </defs>

      {/* Outer scalloped / oval seal */}
      <circle cx="50" cy="50" r="48" fill="url(#cakeBg)" stroke="url(#goldGrad)" strokeWidth="3" />
      <circle cx="50" cy="50" r="44" stroke="#D4A373" strokeWidth="1" strokeDasharray="2 3" opacity="0.8" />

      {/* Decorative star at top */}
      <path
        d="M50 16L51.8 21.6L57.7 21.6L53 25L54.8 30.6L50 27.2L45.2 30.6L47 25L42.3 21.6L48.2 21.6Z"
        fill="#EAD1B6"
      />

      {/* Chef Hat & Pastry Cloche Silhouette */}
      <g transform="translate(25, 34) scale(0.5)">
        {/* Cake Tier Base */}
        <path
          d="M10 65 Q50 78 90 65 L90 78 Q50 92 10 78 Z"
          fill="url(#goldGrad)"
        />
        {/* Cake Tier Mid */}
        <path
          d="M18 45 Q50 56 82 45 L82 62 Q50 74 18 62 Z"
          fill="#FAF5EE"
          opacity="0.9"
        />
        {/* Crown / Icing drips */}
        <path
          d="M26 30 Q50 38 74 30 L74 44 Q50 52 26 44 Z"
          fill="url(#goldGrad)"
        />
        {/* Little Star on Cake Top */}
        <circle cx="50" cy="22" r="5" fill="#FAF5EE" />
      </g>

      {/* Wheat / Ribbon filigree bottom */}
      <path
        d="M32 78 C40 82 45 84 50 84 C55 84 60 82 68 78"
        stroke="#EAD1B6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="50" cy="84" r="2.5" fill="#EAD1B6" />
    </svg>
  );
};
