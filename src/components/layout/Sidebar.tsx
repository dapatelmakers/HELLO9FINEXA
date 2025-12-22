import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Package,
  Users,
  Building2,
  BookOpen,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'accountant', 'viewer'] },
  { icon: FileText, label: 'Invoices', path: '/invoices', roles: ['admin', 'accountant', 'viewer'] },
  { icon: ShoppingCart, label: 'Purchases', path: '/purchases', roles: ['admin', 'accountant', 'viewer'] },
  { icon: Package, label: 'Inventory', path: '/inventory', roles: ['admin', 'accountant', 'viewer'] },
  { icon: Users, label: 'Customers', path: '/customers', roles: ['admin', 'accountant', 'viewer'] },
  { icon: Building2, label: 'Suppliers', path: '/suppliers', roles: ['admin', 'accountant', 'viewer'] },
  { icon: BookOpen, label: 'Ledger', path: '/ledger', roles: ['admin', 'accountant', 'viewer'] },
  { icon: Wallet, label: 'Bank & Cash', path: '/bank', roles: ['admin', 'accountant'] },
  { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['admin', 'accountant', 'viewer'] },
  { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => hasPermission(role as 'admin' | 'accountant' | 'viewer'))
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 z-50 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className={cn('flex items-center gap-3 overflow-hidden', collapsed && 'justify-center')}>
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 floating-logo">
            <span className="text-lg font-bold text-primary-foreground">H9</span>
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg leading-tight">FINEXA™</h1>
              <p className="text-xs text-sidebar-foreground/60">Smart Accounting</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors',
            collapsed && 'absolute -right-3 top-6 bg-sidebar border border-sidebar-border shadow-lg'
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'sidebar-item',
                    isActive && 'active',
                    collapsed && 'justify-center px-0'
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="animate-fade-in">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium">{user?.username.charAt(0).toUpperCase()}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="font-medium text-sm truncate">{user?.username}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
