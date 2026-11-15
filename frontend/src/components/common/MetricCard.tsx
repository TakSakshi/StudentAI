import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'sage' | 'amber' | 'softred' | 'lavender';
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeType = 'sage',
  trend
}) => {
  const badgeClasses = {
    sage: 'bg-sage-light text-forest border-sage',
    amber: 'bg-amber-light text-amber-text border-amber/40',
    softred: 'bg-softred-light text-softred-text border-softred/60',
    lavender: 'bg-lavender-light text-lavender-text border-lavender',
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-border shadow-warm-sm hover:shadow-warm transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-secondary uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-sage-light text-forest flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold text-main font-sans tracking-tight">{value}</span>
        {badge && (
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${badgeClasses[badgeType]}`}>
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-secondary">
          {subtitle && <span>{subtitle}</span>}
          {trend && <span className="font-medium text-forest">{trend}</span>}
        </div>
      )}
    </div>
  );
};
