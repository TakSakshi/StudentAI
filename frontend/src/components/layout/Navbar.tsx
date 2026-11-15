import React, { useEffect, useState } from 'react';
import { ShieldAlert, Cpu, CheckCircle2, AlertTriangle, Menu } from 'lucide-react';
import { getHealth } from '../../services/api';
import { HealthStatus } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <header className="h-16 bg-white border-b border-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-secondary hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-main tracking-tight flex items-center gap-2">
            StudentInsight <span className="text-primary text-xs font-semibold px-2 py-0.5 bg-primary-light rounded-md">AI</span>
          </h1>
          <p className="text-[11px] text-secondary hidden sm:block">Student Performance & At-Risk Prediction</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Model Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-border rounded-full text-xs">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium text-main">{health?.model_name || 'Random Forest'}</span>
          <span className="text-secondary">v{health?.model_version || '1.0.0'}</span>
          {health?.model_loaded ? (
            <span className="flex items-center gap-1 text-success font-medium">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <AlertTriangle className="w-3 h-3" /> Initializing
            </span>
          )}
        </div>

        {/* Responsible AI Disclaimer Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="hidden md:inline">Decision Support Only — Human Review Required</span>
          <span className="md:hidden">Advisory Only</span>
        </div>
      </div>
    </header>
  );
};
