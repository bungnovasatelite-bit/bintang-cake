import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'bestseller' | 'new' | 'custom' | 'gift' | 'neutral' | 'promo';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    bestseller: 'bg-[#FBE4DD] text-[#A2442C] border border-[#F5C7B9]',
    new: 'bg-[#E3EFE3] text-[#2C6E49] border border-[#C5DEC5]',
    custom: 'bg-[#EDE4F7] text-[#5E3589] border border-[#D5C2EA]',
    gift: 'bg-[#FFF0D4] text-[#A26510] border border-[#F3D79E]',
    promo: 'bg-[#F8E3DE] text-[#A03D2A] border border-[#F1C2B7]',
    neutral: 'bg-[#F2ECE4] text-[#695444] border border-[#E3D7C9]',
  };

  const sizeStyles = {
    sm: 'text-[9.5px] font-bold px-2 py-0.5 tracking-wider uppercase',
    md: 'text-xs font-semibold px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-sans transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
