import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import {
  BarChart3, PieChart, TrendingUp, FileText, Download,
  Calendar, ArrowRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/storage';

export const Reports: React.FC = () => {
  const { getStats, ledgerEntries, invoices, customers, products } = useData();
  const stats = getStats();
  const [dateRange, setDateRange] = useState('month');

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: TrendingUp, color: 'bg-success/10 text-success' },
    { id: 'purchase', name: 'Purchase Report', icon: BarChart3, color: 'bg-primary/10 text-primary' },
    { id: 'expense', name: 'Expense Report', icon: PieChart, color: 'bg-destructive/10 text-destructive' },
    { id: 'profit', name: 'Profit & Loss', icon: FileText, color: 'bg-warning/10 text-warning' },
  ];

  // Calculate financial ratios
  const grossMargin = stats.totalIncome > 0 
    ? ((stats.totalIncome - stats.totalExpense) / stats.totalIncome * 100).toFixed(1)
    : '0.0';

  const netProfitMargin = stats.totalIncome > 0 
    ? (stats.profit / stats.totalIncome * 100).toFixed(1)
    : '0.0';

  // Group expenses by category
  const expensesByCategory = ledgerEntries
    .filter(e => e.type === 'expense')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const topExpenses = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Analyze your business performance</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            className="glass-card rounded-xl p-5 text-left hover:shadow-lg transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl ${report.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <report.icon size={24} />
            </div>
            <h3 className="font-medium mb-1">{report.name}</h3>
            <div className="flex items-center text-sm text-primary">
              Generate <ArrowRight size={14} className="ml-1" />
            </div>
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Overview */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-lg bg-success/5">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="text-xl font-bold text-success">{formatCurrency(stats.totalIncome)}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg bg-destructive/5">
              <span className="text-muted-foreground">Total Expenses</span>
              <span className="text-xl font-bold text-destructive">{formatCurrency(stats.totalExpense)}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg bg-primary/5 border-t-2 border-primary">
              <span className="font-medium">Net Profit</span>
              <span className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(stats.profit)}
              </span>
            </div>
          </div>
        </div>

        {/* Key Ratios */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Financial Ratios</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Gross Margin</p>
              <p className="text-2xl font-bold">{grossMargin}%</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Net Profit Margin</p>
              <p className="text-2xl font-bold">{netProfitMargin}%</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Total Invoices</p>
              <p className="text-2xl font-bold">{invoices.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Active Customers</p>
              <p className="text-2xl font-bold">{customers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Expenses */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Top Expense Categories</h2>
          <button className="btn-secondary text-sm py-2 flex items-center gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
        
        {topExpenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No expense data available. Add expenses in the Ledger to see analytics.
          </div>
        ) : (
          <div className="space-y-3">
            {topExpenses.map(([category, amount], index) => {
              const percentage = stats.totalExpense > 0 ? (amount / stats.totalExpense * 100) : 0;
              return (
                <div key={category} className="flex items-center gap-4">
                  <span className="w-6 text-muted-foreground">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{category}</span>
                      <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-bg rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inventory Summary */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Inventory Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-3xl font-bold text-primary">{products.length}</p>
            <p className="text-sm text-muted-foreground">Products</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-3xl font-bold">{products.reduce((sum, p) => sum + p.quantity, 0)}</p>
            <p className="text-sm text-muted-foreground">Total Units</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-3xl font-bold text-success">{formatCurrency(stats.stockValue)}</p>
            <p className="text-sm text-muted-foreground">Stock Value</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-3xl font-bold text-warning">{products.filter(p => p.quantity <= 10).length}</p>
            <p className="text-sm text-muted-foreground">Low Stock</p>
          </div>
        </div>
      </div>
    </div>
  );
};
