import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/modals/FormModal';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Building2 } from 'lucide-react';
import { indianStates, formatDate } from '@/lib/storage';
import { Supplier } from '@/types';
import { toast } from 'sonner';

export const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
    state: '',
  });

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone?.includes(searchQuery)
  );

  const openModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        gstin: supplier.gstin || '',
        address: supplier.address || '',
        state: supplier.state,
      });
    } else {
      setEditingSupplier(null);
      setFormData({ name: '', email: '', phone: '', gstin: '', address: '', state: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Supplier name is required');
      return;
    }

    if (!formData.state) {
      toast.error('Please select a state');
      return;
    }

    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      toast.error('Invalid GSTIN format');
      return;
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, formData);
      toast.success('Supplier updated successfully');
    } else {
      addSupplier(formData);
      toast.success('Supplier added successfully');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (supplier: Supplier) => {
    if (window.confirm(`Delete supplier "${supplier.name}"?`)) {
      deleteSupplier(supplier.id);
      toast.success('Supplier deleted');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground mt-1">Manage your vendor database</p>
        </div>
        {hasPermission('accountant') && (
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Supplier
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 text-center">
          <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-3xl font-bold">{suppliers.length}</p>
          <p className="text-sm text-muted-foreground">Total Suppliers</p>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-success">
            {suppliers.filter(s => s.gstin).length}
          </p>
          <p className="text-sm text-muted-foreground">GST Registered</p>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-3xl font-bold">
            {new Set(suppliers.map(s => s.state)).size}
          </p>
          <p className="text-sm text-muted-foreground">States Covered</p>
        </div>
      </div>

      {/* Suppliers Table */}
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Supplier',
            render: (s) => (
              <div>
                <p className="font-medium">{s.name}</p>
                {s.gstin && <p className="text-xs text-muted-foreground font-mono">{s.gstin}</p>}
              </div>
            ),
          },
          {
            key: 'contact',
            label: 'Contact',
            render: (s) => (
              <div className="space-y-1">
                {s.phone && (
                  <div className="flex items-center gap-1 text-sm">
                    <Phone size={12} className="text-muted-foreground" />
                    {s.phone}
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-1 text-sm">
                    <Mail size={12} className="text-muted-foreground" />
                    {s.email}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'state',
            label: 'State',
            render: (s) => (
              <div className="flex items-center gap-1">
                <MapPin size={12} className="text-muted-foreground" />
                {s.state}
              </div>
            ),
          },
          {
            key: 'createdAt',
            label: 'Added',
            render: (s) => formatDate(s.createdAt),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (s) => hasPermission('accountant') ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(s)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(s)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : null,
          },
        ]}
        data={filteredSuppliers}
        keyExtractor={(s) => s.id}
        emptyMessage="No suppliers found. Add your first supplier!"
      />

      {/* Add/Edit Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Supplier Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Business name"
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
              {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
