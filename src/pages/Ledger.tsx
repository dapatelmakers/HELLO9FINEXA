import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/modals/FormModal';
import { Plus, Search, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/storage';
import { LedgerEntry } from '@/types';
import { toast } from 'sonner';

const incomeCategories = [
  'Sales', 'Services', 'Interest', 'Commission', 'Rent Received', 'Other Income'
];

const expenseCategories = [
  'Purchases', 'Salaries', 'Rent', 'Utilities', 'Office Supplies', 'Marketing',
  'Travel', 'Insurance', 'Repairs', 'Bank Charges', 'Professional Fees', 'Other Expenses'
];

export const Ledger: React.FC = () => {
  const { ledgerEntries, addLedgerEntry, updateLedgerEntry, deleteLedgerEntry } = useData();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'income' as 'income' | 'expense',
    category: '',
    description: '',
    amount: 0,
    reference: '',
  });

  const filteredEntries = ledgerEntries
    .filter((e) => filterType === 'all' || e.type === filterType)
    .filter(
      (e) =>
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = ledgerEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = ledgerEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);

  const openModal = (entry?: LedgerEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        date: entry.date,
        type: entry.type,
        category: entry.category,
        description: entry.description,
        amount: entry.amount,
        reference: entry.reference || '',
      });
    } else {
      setEditingEntry(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: '',
        description: '',
        amount: 0,
        reference: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (editingEntry) {
      updateLedgerEntry(editingEntry.id, formData);
      toast.success('Entry updated successfully');
    } else {
      addLedgerEntry(formData);
      toast.success('Entry added successfully');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (entry: LedgerEntry) => {
    if (window.confirm('Delete this ledger entry?')) {
      deleteLedgerEntry(entry.id);
      toast.success('Entry deleted');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Ledger</h1>
          <p className="text-muted-foreground mt-1">Track your income and expenses</p>
        </div>
        {hasPermission('accountant') && (
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Entry
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10 text-success">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expense</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${totalIncome - totalExpense >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
              {totalIncome - totalExpense >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(totalIncome - totalExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Entries Table */}
      <DataTable
        columns={[
          {
            key: 'date',
            label: 'Date',
            render: (e) => formatDate(e.date),
          },
          {
            key: 'type',
            label: 'Type',
            render: (e) => (
              <span className={`badge ${e.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                {e.type}
              </span>
            ),
          },
          { key: 'category', label: 'Category' },
          { key: 'description', label: 'Description' },
          {
            key: 'amount',
            label: 'Amount',
            render: (e) => (
              <span className={`font-semibold ${e.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount)}
              </span>
            ),
          },
          {
            key: 'reference',
            label: 'Reference',
            render: (e) => e.reference ? (
              <span className="text-xs font-mono text-muted-foreground">{e.reference}</span>
            ) : '-',
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (e) => hasPermission('accountant') ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(e)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(e)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : null,
          },
        ]}
        data={filteredEntries}
        keyExtractor={(e) => e.id}
        emptyMessage="No entries found."
      />

      {/* Add/Edit Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEntry ? 'Edit Entry' : 'Add New Entry'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense', category: '' })}
                className="input-field"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select Category</option>
              {(formData.type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              placeholder="Enter description"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reference</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="input-field"
                placeholder="Invoice/Receipt #"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingEntry ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
