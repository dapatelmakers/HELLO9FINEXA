import React from 'react';
import { useData } from '@/context/DataContext';
import { DataTable } from '@/components/ui/DataTable';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/storage';

export const Purchases: React.FC = () => {
  const { purchases } = useData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Purchases</h1>
          <p className="text-muted-foreground mt-1">Manage purchase orders and vendor payments</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          New Purchase
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search purchases..."
          className="input-field pl-10"
        />
      </div>

      <div className="glass-card rounded-xl p-12 text-center">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Purchase Management</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Track your purchase orders, manage supplier invoices, and record debit notes.
          Purchase functionality mirrors invoice creation with supplier-focused workflows.
        </p>
        <button className="btn-primary mt-6">
          <Plus size={18} className="mr-2" />
          Create First Purchase
        </button>
      </div>
    </div>
  );
};
