import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/storage';
import { useData } from '@/context/DataContext';

export const Bank: React.FC = () => {
  const { getStats } = useData();
  const stats = getStats();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Bank & Cash</h1>
        <p className="text-muted-foreground mt-1">Manage your cash flow and bank transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <Wallet size={32} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cash Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.cashBalance)}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-success/10 text-success">
              <ArrowDownRight size={32} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Deposits</p>
              <p className="text-3xl font-bold text-success">{formatCurrency(stats.totalIncome)}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive">
              <ArrowUpRight size={32} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Withdrawals</p>
              <p className="text-3xl font-bold text-destructive">{formatCurrency(stats.totalExpense)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-8 text-center">
        <RefreshCw className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Bank Reconciliation</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Connect your bank accounts, track deposits and withdrawals, manage cash flow,
          and reconcile statements with your accounting records.
        </p>
        <div className="flex justify-center gap-4">
          <button className="btn-secondary">Add Bank Account</button>
          <button className="btn-primary">Record Transaction</button>
        </div>
      </div>
    </div>
  );
};
