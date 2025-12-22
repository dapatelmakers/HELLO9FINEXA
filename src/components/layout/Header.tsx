import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, onMenuClick }) => {
  const { user } = useAuth();
  const { settings, updateSettings } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode;
    updateSettings({ darkMode: newDarkMode });
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-40 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div>
            <h2 className="font-semibold text-foreground">{user?.companyName || 'Hello9 FINEXA™'}</h2>
            <p className="text-xs text-muted-foreground">{currentDate}</p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search invoices, customers, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-lg hover:bg-muted transition-colors"
            title={settings.darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="p-2.5 rounded-lg hover:bg-muted transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
          </button>

          <div className="hidden sm:flex items-center gap-3 ml-3 pl-3 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.username}</p>
              <span className={cn(
                'badge text-xs',
                user?.role === 'admin' ? 'badge-info' : 
                user?.role === 'accountant' ? 'badge-success' : 'badge-warning'
              )}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
