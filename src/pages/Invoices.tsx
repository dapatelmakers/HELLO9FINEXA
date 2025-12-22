import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/modals/FormModal';
import { Plus, Search, FileText, Printer, Download, Trash2, Edit } from 'lucide-react';
import { formatCurrency, formatDate, generateId } from '@/lib/storage';
import { Invoice, InvoiceItem } from '@/types';
import { toast } from 'sonner';

export const Invoices: React.FC = () => {
  const { invoices, customers, products, addInvoice, deleteInvoice, getNextInvoiceNumber } = useData();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [] as InvoiceItem[],
    notes: '',
  });

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateGST = (amount: number, rate: number, customerState: string, companyState: string) => {
    const gstAmount = (amount * rate) / 100;
    const isSameState = customerState === companyState;
    
    return {
      cgst: isSameState ? gstAmount / 2 : 0,
      sgst: isSameState ? gstAmount / 2 : 0,
      igst: isSameState ? 0 : gstAmount,
    };
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: generateId(),
      description: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      discountType: 'percentage',
      gstRate: 18,
      amount: 0,
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
    const items = [...formData.items];
    items[index] = { ...items[index], ...updates };
    
    // Calculate amount
    const item = items[index];
    let baseAmount = item.quantity * item.rate;
    const discountAmount = item.discountType === 'percentage'
      ? (baseAmount * item.discount) / 100
      : item.discount;
    items[index].amount = baseAmount - discountAmount;
    
    setFormData({ ...formData, items });
  };

  const removeItem = (index: number) => {
    const items = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) return;

    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const discountTotal = formData.items.reduce((sum, item) => {
      const base = item.quantity * item.rate;
      return sum + (item.discountType === 'percentage' ? (base * item.discount) / 100 : item.discount);
    }, 0);

    // For simplicity, using a fixed GST calculation
    const gstTotal = formData.items.reduce((sum, item) => sum + (item.amount * item.gstRate) / 100, 0);

    const invoice: Omit<Invoice, 'id' | 'createdAt'> = {
      invoiceNumber: getNextInvoiceNumber(),
      customerId: formData.customerId,
      customerName: customer.name,
      date: formData.date,
      dueDate: formData.dueDate,
      items: formData.items,
      subtotal,
      discountTotal,
      cgst: gstTotal / 2,
      sgst: gstTotal / 2,
      igst: 0,
      total: subtotal + gstTotal,
      status: 'draft',
      notes: formData.notes,
    };

    addInvoice(invoice);
    toast.success('Invoice created successfully!');
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      notes: '',
    });
  };

  const handleDelete = (invoice: Invoice) => {
    if (window.confirm(`Delete invoice ${invoice.invoiceNumber}?`)) {
      deleteInvoice(invoice.id);
      toast.success('Invoice deleted');
    }
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
  const gstTotal = formData.items.reduce((sum, item) => sum + (item.amount * item.gstRate) / 100, 0);
  const grandTotal = subtotal + gstTotal;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage your sales invoices and GST</p>
        </div>
        {hasPermission('accountant') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            New Invoice
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Invoices Table */}
      <DataTable
        columns={[
          {
            key: 'invoiceNumber',
            label: 'Invoice #',
            render: (inv) => (
              <span className="font-mono font-medium text-primary">{inv.invoiceNumber}</span>
            ),
          },
          { key: 'customerName', label: 'Customer' },
          {
            key: 'date',
            label: 'Date',
            render: (inv) => formatDate(inv.date),
          },
          {
            key: 'total',
            label: 'Amount',
            render: (inv) => <span className="font-semibold">{formatCurrency(inv.total)}</span>,
          },
          {
            key: 'status',
            label: 'Status',
            render: (inv) => (
              <span className={`badge ${
                inv.status === 'paid' ? 'badge-success' :
                inv.status === 'sent' ? 'badge-info' :
                inv.status === 'overdue' ? 'badge-danger' :
                inv.status === 'cancelled' ? 'badge-warning' :
                'bg-muted text-muted-foreground'
              }`}>
                {inv.status}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (inv) => (
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Print">
                  <Printer size={16} />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Download">
                  <Download size={16} />
                </button>
                {hasPermission('accountant') && (
                  <button
                    onClick={() => handleDelete(inv)}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        data={filteredInvoices}
        keyExtractor={(inv) => inv.id}
        emptyMessage="No invoices found. Create your first invoice!"
      />

      {/* Create Invoice Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Create New Invoice"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer *</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Invoice Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Invoice Items</label>
              <button type="button" onClick={addItem} className="btn-secondary text-sm py-1.5">
                <Plus size={16} className="mr-1" /> Add Item
              </button>
            </div>
            
            {formData.items.length === 0 ? (
              <div className="bg-muted/50 rounded-lg p-6 text-center text-muted-foreground">
                No items added. Click "Add Item" to start.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={item.id} className="bg-muted/30 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateItem(index, { description: e.target.value })}
                          className="input-field text-sm"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                          className="input-field text-sm"
                          min="1"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => updateItem(index, { rate: Number(e.target.value) })}
                          className="input-field text-sm"
                          min="0"
                        />
                      </div>
                      <div>
                        <select
                          value={item.gstRate}
                          onChange={(e) => updateItem(index, { gstRate: Number(e.target.value) })}
                          className="input-field text-sm"
                        >
                          <option value="0">0% GST</option>
                          <option value="5">5% GST</option>
                          <option value="12">12% GST</option>
                          <option value="18">18% GST</option>
                          <option value="28">28% GST</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{formatCurrency(item.amount)}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1.5 hover:bg-destructive/10 text-destructive rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST</span>
              <span>{formatCurrency(gstTotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
              <span>Grand Total</span>
              <span className="text-primary">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Invoice
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
