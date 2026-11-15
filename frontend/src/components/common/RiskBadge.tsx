import React from 'react';

interface RiskBadgeProps {
  band?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ band = 'Low Advisory Risk', size = 'md' }) => {
  const normalized = band.toUpperCase();

  let style = 'bg-green-50 text-green-700 border-green-200';
  let label = 'Low Advisory Risk';
  let dotColor = 'bg-green-500';

  if (normalized.includes('HIGH')) {
    style = 'bg-red-50 text-red-700 border-red-200';
    label = 'High Advisory Risk';
    dotColor = 'bg-red-500';
  } else if (normalized.includes('MED')) {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
    label = 'Medium Advisory Risk';
    dotColor = 'bg-amber-500';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${style} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {label}
    </span>
  );
};
