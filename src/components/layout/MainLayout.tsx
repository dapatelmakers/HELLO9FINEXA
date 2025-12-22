import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';

export const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { settings } = useData();

  useEffect(() => {
    // Apply theme classes
    const root = document.documentElement;
    root.classList.toggle('dark', settings.darkMode);
    
    // Remove all theme classes first
    root.classList.remove('theme-purple', 'theme-green', 'theme-solar', 'theme-high-contrast');
    
    // Add the current theme class if not default
    if (settings.theme !== 'light' && settings.theme !== 'dark') {
      root.classList.add(`theme-${settings.theme}`);
    }
  }, [settings.theme, settings.darkMode]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Header sidebarCollapsed={sidebarCollapsed} onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'pl-16' : 'pl-64'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
