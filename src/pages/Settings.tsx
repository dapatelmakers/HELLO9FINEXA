import React, { useState, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import {
  Palette, Download, Upload, Trash2, Info, Shield, Database,
  Moon, Sun, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { ThemeType } from '@/types';

const themes: { id: ThemeType; name: string; colors: string[] }[] = [
  { id: 'light', name: 'Light', colors: ['#0ea5e9', '#14b8a6', '#f8fafc'] },
  { id: 'dark', name: 'Dark', colors: ['#38bdf8', '#2dd4bf', '#0f172a'] },
  { id: 'purple', name: 'Purple', colors: ['#a855f7', '#c084fc', '#faf5ff'] },
  { id: 'green', name: 'Green', colors: ['#22c55e', '#4ade80', '#f0fdf4'] },
  { id: 'solar', name: 'Solar', colors: ['#f59e0b', '#fb923c', '#fffbeb'] },
  { id: 'high-contrast', name: 'High Contrast', colors: ['#000000', '#ffffff', '#ffffff'] },
];

export const Settings: React.FC = () => {
  const { settings, updateSettings, exportData, importData, clearAllData } = useData();
  const { user, users, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('appearance');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (themeId: ThemeType) => {
    const isDark = settings.darkMode;
    updateSettings({ theme: themeId });
    
    const root = document.documentElement;
    root.classList.remove('theme-purple', 'theme-green', 'theme-solar', 'theme-high-contrast');
    if (themeId !== 'light' && themeId !== 'dark') {
      root.classList.add(`theme-${themeId}`);
    }
    root.classList.toggle('dark', isDark);
    
    toast.success(`Theme changed to ${themeId}`);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !settings.darkMode;
    updateSettings({ darkMode: newDarkMode });
    document.documentElement.classList.toggle('dark', newDarkMode);
    toast.success(newDarkMode ? 'Dark mode enabled' : 'Light mode enabled');
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finexa-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      if (importData(data)) {
        toast.success('Data imported successfully');
      } else {
        toast.error('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
      if (window.confirm('This will delete all invoices, customers, products, and settings. Continue?')) {
        clearAllData();
        toast.success('All data cleared');
        logout();
      }
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your Hello9 FINEXA™ experience</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'appearance' && (
            <div className="glass-card rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Theme</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        settings.theme === theme.id
                          ? 'border-primary shadow-lg'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex gap-1 mb-3">
                        {theme.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="font-medium text-sm">{theme.name}</p>
                      {settings.theme === theme.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check size={12} className="text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
                  </div>
                  <button
                    onClick={handleDarkModeToggle}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.darkMode ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-background shadow-md transition-transform flex items-center justify-center ${
                      settings.darkMode ? 'translate-x-7' : 'translate-x-1'
                    }`}>
                      {settings.darkMode ? <Moon size={14} /> : <Sun size={14} />}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Export & Import</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button onClick={handleExport} className="btn-secondary flex items-center justify-center gap-2">
                    <Download size={18} />
                    Export All Data
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    Import Data
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="glass-card rounded-xl p-6 border-destructive/50">
                <h2 className="text-xl font-semibold mb-2 text-destructive">Danger Zone</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete all data. This action cannot be undone.
                </p>
                <button
                  onClick={handleClearData}
                  className="px-6 py-2.5 rounded-lg font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete All Data
                </button>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Users</h2>
                <div className="space-y-3">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-sm text-muted-foreground">{u.companyName}</p>
                      </div>
                      <span className={`badge ${
                        u.role === 'admin' ? 'badge-info' :
                        u.role === 'accountant' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="glass-card rounded-xl p-6 text-center">
              <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 floating-logo">
                <span className="text-3xl font-bold text-primary-foreground">H9</span>
              </div>
              <h2 className="text-2xl font-bold gradient-text mb-2">Hello9 FINEXA™</h2>
              <p className="text-muted-foreground mb-6">Smart Accounting • GST • Offline-First</p>
              
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-lg bg-muted/50">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">100% Offline</p>
                  <p className="text-xs text-muted-foreground">Your data stays local</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <Database className="w-8 h-8 mx-auto mb-2 text-success" />
                  <p className="font-medium">Multi-User</p>
                  <p className="text-xs text-muted-foreground">Role-based access</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <Info className="w-8 h-8 mx-auto mb-2 text-warning" />
                  <p className="font-medium">GST Compliant</p>
                  <p className="text-xs text-muted-foreground">India-ready</p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <p className="text-sm text-muted-foreground">Made with ❤️ in India</p>
                <p className="text-sm text-muted-foreground mt-1">Developed by Dhairya Patel</p>
                <p className="text-xs text-muted-foreground mt-4">Version 1.0.0</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
