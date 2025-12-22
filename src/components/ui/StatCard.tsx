import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/storage';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: number;
  format?: 'currency' | 'number';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  format = 'currency',
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'from-primary/10 to-primary/5',
    success: 'from-success/10 to-success/5',
    warning: 'from-warning/10 to-warning/5',
    danger: 'from-destructive/10 to-destructive/5',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className={cn(
      'glass-card rounded-xl p-5 hover:shadow-glow transition-all duration-300 group',
      'bg-gradient-to-br',
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">
            {format === 'currency' ? formatCurrency(value) : value.toLocaleString('en-IN')}
          </p>
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(trend)}% from last month</span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl transition-transform duration-300 group-hover:scale-110',
          iconStyles[variant]
        )}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};
