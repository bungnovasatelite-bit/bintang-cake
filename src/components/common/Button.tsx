import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none select-none';

  const variantStyles = {
    primary: 'bg-[#4A2810] text-[#FFFDF9] hover:bg-[#341A08] shadow-sm hover:shadow-md focus-visible:ring-[#8B6244]/50',
    secondary: 'bg-[#F2ECE4] text-[#4A2810] hover:bg-[#E7DCD0] focus-visible:ring-[#D4A373]',
    outline: 'border border-[#4A2810] text-[#4A2810] hover:bg-[#4A2810]/5 focus-visible:ring-[#4A2810]',
    ghost: 'text-[#4A2810] hover:bg-[#F3E8DA]/60 focus-visible:ring-[#4A2810]',
    icon: 'p-2 rounded-full hover:bg-[#F3E8DA]/80 text-[#4A2810]',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3.5 gap-2 font-semibold',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${variant !== 'icon' ? sizeStyles[size] : ''} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
