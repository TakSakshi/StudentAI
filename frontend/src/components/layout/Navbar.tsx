import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ShieldCheck, Cpu } from 'lucide-react';
import { HealthStatus } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  health: HealthStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, health }) => {
  const location = useLocation();

  // Route-to-title mapping with editorial styling
  const pageTitles: Record<string, { title: string; category: string }> = {
    '/': { title: 'Understanding Student Progress', category: 'Executive Overview' },
    '/students': { title: 'Student Directory', category: 'Cohort Monitoring' },
    '/risk-analysis': { title: 'Students Who May Need Support', category: 'Early Warning Intelligence' },
    '/analytics': { title: 'Academic Progress & Trends', category: 'Longitudinal Analysis' },
    '/predict': { title: 'Prediction Studio', category: 'Decision Support Workspace' },
    '/model': { title: 'Model Insights & Empirical Audit', category: 'ML Governance' },
    '/data': { title: 'Dataset Explorer', category: 'Data Governance' },
    '/about': { title: 'About & Ethical Guidelines', category: 'Responsible AI' },
  };

  const current = pageTitles[location.pathname] || {
    title: 'Student Profile',
    category: 'Student Analysis',
  };

  return (
    <header className="h-18 bg-white/80 backdrop-blur-md border-b border-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-secondary hover:bg-sage-light hover:text-forest lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest font-sans">
            {current.category}
          </span>
          <h1 className="font-editorial text-lg sm:text-xl font-bold text-main leading-tight">
            {current.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Model status tag */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-ivory rounded-xl border border-border text-xs text-secondary">
          <Cpu className="w-3.5 h-3.5 text-forest" />
          <span className="font-medium text-main font-sans">{health?.model_name || 'Random Forest'}</span>
          <span className="text-[10px] text-secondary">(&tau; = {health?.decision_threshold ?? 0.60})</span>
        </div>

        {/* Human review mandate pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-light text-amber-text border border-amber/40 rounded-xl text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-warning shrink-0" />
          <span className="hidden md:inline">Advisory Support &bull; Human Review Mandated</span>
          <span className="md:hidden">Advisory Only</span>
        </div>
      </div>
    </header>
  );
};
