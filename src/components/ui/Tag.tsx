import React from 'react';

interface TagProps {
  children: React.ReactNode;
  variant?: 'primary' | 'highlight';
}

export default function Tag({ children, variant = 'primary' }: TagProps) {
  const baseClasses = "inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider";
  
  const variantClasses = {
    primary: 'bg-primary/10 text-primary',
    highlight: 'bg-highlight/20 text-primary',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
