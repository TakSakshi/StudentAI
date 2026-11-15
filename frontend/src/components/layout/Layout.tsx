import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { getHealth } from '../../services/api';
import { HealthStatus } from '../../types';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <div className="min-h-screen bg-background text-main flex flex-col font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} health={health} />
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} health={health} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
