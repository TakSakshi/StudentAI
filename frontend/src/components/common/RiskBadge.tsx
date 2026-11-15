import React from 'react';

interface RiskBadgeProps {
  band?: string;
  size?: 'sm' | 'md' | 'lg';
  supportive?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  band = 'Low Advisory Risk',
  size = 'md',
  supportive = true
}) => {
  const normalized = (band || '').toUpperCase();

  let style = 'bg-sage-light text-forest border-sage';
  let label = supportive ? 'Steady Progress' : 'Low Advisory Risk';
  let dotColor = 'bg-success';

  if (normalized.includes('HIGH')) {
    style = 'bg-softred-light text-softred-text border-softred';
    label = supportive ? 'Priority Academic Support' : 'High Advisory Risk';
    dotColor = 'bg-danger';
  } else if (normalized.includes('MED')) {
    style = 'bg-amber-light text-amber-text border-amber/50';
    label = supportive ? 'Check-in Recommended' : 'Medium Advisory Risk';
    dotColor = 'bg-warning';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${style} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <span>{label}</span>
    </span>
  );
};
