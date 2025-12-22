import React from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Package,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/storage';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getStats, invoices, ledgerEntries } = useData();
  const stats = getStats();

  const recentInvoices = invoices
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentTransactions = ledgerEntries
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.username}! Here's your business overview.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw size={18} />
            Refresh
          </button>
          <Link to="/invoices" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={stats.totalIncome}
          icon={TrendingUp}
          trend={12.5}
          variant="success"
        />
        <StatCard
          title="Total Expense"
          value={stats.totalExpense}
          icon={TrendingDown}
          trend={-8.3}
          variant="danger"
        />
        <StatCard
          title="Net Profit"
          value={stats.profit}
          icon={Wallet}
          trend={15.2}
          variant={stats.profit >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="Stock Value"
          value={stats.stockValue}
          icon={Package}
          variant="default"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receivables</p>
              <p className="text-2xl font-bold text-warning">{formatCurrency(stats.receivables)}</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <ArrowUpRight size={24} />
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Payables</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(stats.payables)}</p>
            </div>
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
              <ArrowDownRight size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">{stats.customerCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Invoices</h2>
            <Link to="/invoices" className="text-primary text-sm hover:underline">
              View All
            </Link>
          </div>
          <DataTable
            columns={[
              { key: 'invoiceNumber', label: 'Invoice' },
              { key: 'customerName', label: 'Customer' },
              {
                key: 'total',
                label: 'Amount',
                render: (inv) => formatCurrency(inv.total),
              },
              {
                key: 'status',
                label: 'Status',
                render: (inv) => (
                  <span className={`badge ${
                    inv.status === 'paid' ? 'badge-success' :
                    inv.status === 'sent' ? 'badge-info' :
                    inv.status === 'overdue' ? 'badge-danger' :
                    'badge-warning'
                  }`}>
                    {inv.status}
                  </span>
                ),
              },
            ]}
            data={recentInvoices}
            keyExtractor={(inv) => inv.id}
            emptyMessage="No invoices yet. Create your first invoice!"
          />
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Link to="/ledger" className="text-primary text-sm hover:underline">
              View All
            </Link>
          </div>
          <DataTable
            columns={[
              {
                key: 'date',
                label: 'Date',
                render: (entry) => formatDate(entry.date),
              },
              { key: 'description', label: 'Description' },
              {
                key: 'amount',
                label: 'Amount',
                render: (entry) => (
                  <span className={entry.type === 'income' ? 'text-success' : 'text-destructive'}>
                    {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                  </span>
                ),
              },
            ]}
            data={recentTransactions}
            keyExtractor={(entry) => entry.id}
            emptyMessage="No transactions yet."
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'New Invoice', icon: FileText, path: '/invoices', color: 'bg-primary/10 text-primary' },
            { label: 'Add Customer', icon: Users, path: '/customers', color: 'bg-success/10 text-success' },
            { label: 'Add Product', icon: Package, path: '/inventory', color: 'bg-warning/10 text-warning' },
            { label: 'Add Expense', icon: TrendingDown, path: '/ledger', color: 'bg-destructive/10 text-destructive' },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted transition-all group"
            >
              <div className={`p-4 rounded-xl ${action.color} transition-transform group-hover:scale-110`}>
                <action.icon size={24} />
              </div>
              <span className="text-sm font-medium text-center">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
