import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  LineChart,
  Binary,
  BrainCircuit,
  Database,
  Info,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Overview', to: '/', icon: LayoutDashboard },
    { label: 'Student Risk', to: '/students', icon: Users },
    { label: 'Performance Analytics', to: '/analytics', icon: LineChart },
    { label: 'Predict Risk', to: '/predict', icon: Binary },
    { label: 'Model Performance', to: '/model', icon: BrainCircuit },
    { label: 'Data Explorer', to: '/data', icon: Database },
    { label: 'About & Ethics', to: '/about', icon: Info },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-border flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Branding */}
        <div className="h-16 flex items-center px-6 border-b border-border gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-main leading-none">StudentInsight</div>
            <div className="text-[11px] text-secondary mt-1">ALGIONS AI LABS</div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-secondary uppercase tracking-wider">
            Navigation
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-secondary hover:text-main hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </NavLink>
          ))}
        </nav>

        {/* Assessment footer */}
        <div className="p-4 border-t border-border bg-slate-50/50 m-3 rounded-xl border">
          <div className="text-xs font-semibold text-main">Internship Assessment</div>
          <div className="text-[11px] text-secondary mt-0.5">Machine Learning Track</div>
          <div className="mt-2 text-[10px] text-secondary bg-white px-2 py-1 rounded border border-border inline-block">
            Binary Classification (<span className="text-danger font-medium">&lt; 40%</span>)
          </div>
        </div>
      </aside>
    </>
  );
};
