import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  Users,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Binary,
  BrainCircuit,
  Database,
  Info,
  ChevronRight,
  CheckCircle2,
  X
} from 'lucide-react';
import { HealthStatus } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  health: HealthStatus | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, health }) => {
  const navItems = [
    { label: 'Overview', to: '/', icon: Compass },
    { label: 'Student Directory', to: '/students', icon: Users },
    { label: 'Student Risk Analysis', to: '/risk-analysis', icon: ShieldAlert },
    { label: 'Academic Progress', to: '/analytics', icon: GraduationCap },
    { label: 'Prediction Studio', to: '/predict', icon: Binary },
    { label: 'Model Insights', to: '/model', icon: BrainCircuit },
    { label: 'Data Explorer', to: '/data', icon: Database },
    { label: 'About & Ethics', to: '/about', icon: Info },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-forest-dark/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-forest text-white flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-forest-dark/40 shadow-warm-lg`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sage-light text-forest flex items-center justify-center font-bold shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-editorial text-lg tracking-tight leading-none block font-semibold text-white">
                  StudentInsight
                </span>
                <span className="text-[10px] text-sage font-sans uppercase tracking-widest block mt-0.5">
                  Academic Support AI
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-white/60 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="py-5 px-3 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold text-white/40 uppercase tracking-widest font-sans">
              Intelligence Suite
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold shadow-inner'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 shrink-0 opacity-80" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-30" />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Model Status Card at Bottom of Sidebar */}
        <div className="p-4 m-3 rounded-xl bg-white/5 border border-white/10 text-white/90">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sage">
              Decision Support Model
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active
            </span>
          </div>
          <div className="mt-2 text-xs font-semibold text-white">
            {health?.model_name || 'Random Forest'} v{health?.model_version || '1.0.0'}
          </div>
          <div className="text-[10px] text-white/60 mt-0.5">
            Decision Threshold: &tau; = {health?.decision_threshold ?? 0.60}
          </div>
        </div>
      </aside>
    </>
  );
};
