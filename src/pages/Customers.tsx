import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/modals/FormModal';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { indianStates, formatDate } from '@/lib/storage';
import { Customer } from '@/types';
import { toast } from 'sonner';

export const Customers: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
    state: '',
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery)
  );

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        gstin: customer.gstin || '',
        address: customer.address || '',
        state: customer.state,
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', gstin: '', address: '', state: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (!formData.state) {
      toast.error('Please select a state');
      return;
    }

    // GSTIN validation
    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      toast.error('Invalid GSTIN format');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
      toast.success('Customer updated successfully');
    } else {
      // Check for duplicate
      const duplicate = customers.find(
        c => c.name.toLowerCase() === formData.name.toLowerCase() && c.phone === formData.phone
      );
      if (duplicate) {
        toast.error('A customer with this name and phone already exists');
        return;
      }
      addCustomer(formData);
      toast.success('Customer added successfully');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (customer: Customer) => {
    if (window.confirm(`Delete customer "${customer.name}"?`)) {
      deleteCustomer(customer.id);
      toast.success('Customer deleted');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer database</p>
        </div>
        {hasPermission('accountant') && (
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Customer
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-primary">{customers.length}</p>
          <p className="text-sm text-muted-foreground">Total Customers</p>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-success">
            {customers.filter(c => c.gstin).length}
          </p>
          <p className="text-sm text-muted-foreground">GST Registered</p>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-3xl font-bold">
            {customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
          </p>
          <p className="text-sm text-muted-foreground">Added This Month</p>
        </div>
      </div>

      {/* Customers Table */}
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Customer',
            render: (c) => (
              <div>
                <p className="font-medium">{c.name}</p>
                {c.gstin && <p className="text-xs text-muted-foreground font-mono">{c.gstin}</p>}
              </div>
            ),
          },
          {
            key: 'contact',
            label: 'Contact',
            render: (c) => (
              <div className="space-y-1">
                {c.phone && (
                  <div className="flex items-center gap-1 text-sm">
                    <Phone size={12} className="text-muted-foreground" />
                    {c.phone}
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-1 text-sm">
                    <Mail size={12} className="text-muted-foreground" />
                    {c.email}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'state',
            label: 'State',
            render: (c) => (
              <div className="flex items-center gap-1">
                <MapPin size={12} className="text-muted-foreground" />
                {c.state}
              </div>
            ),
          },
          {
            key: 'createdAt',
            label: 'Added',
            render: (c) => formatDate(c.createdAt),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (c) => hasPermission('accountant') ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(c)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : null,
          },
        ]}
        data={filteredCustomers}
        keyExtractor={(c) => c.id}
        emptyMessage="No customers found. Add your first customer!"
      />

      {/* Add/Edit Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Customer Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Business or customer name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+91 XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">GSTIN</label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              className="input-field font-mono"
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">State *</label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select State</option>
              {indianStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Full address..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
