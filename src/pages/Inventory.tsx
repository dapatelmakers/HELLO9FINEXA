import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/modals/FormModal';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/storage';
import { Product } from '@/types';
import { toast } from 'sonner';

export const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: 0,
    cost: 0,
    quantity: 0,
    unit: 'pcs',
    hsnCode: '',
    gstRate: 18,
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.quantity <= 10);
  const totalValue = products.reduce((sum, p) => sum + (p.cost * p.quantity), 0);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku || '',
        description: product.description || '',
        price: product.price,
        cost: product.cost,
        quantity: product.quantity,
        unit: product.unit,
        hsnCode: product.hsnCode || '',
        gstRate: product.gstRate,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', sku: '', description: '', price: 0, cost: 0,
        quantity: 0, unit: 'pcs', hsnCode: '', gstRate: 18,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (formData.price < 0 || formData.cost < 0 || formData.quantity < 0) {
      toast.error('Price, cost, and quantity must be positive');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      toast.success('Product updated successfully');
    } else {
      addProduct(formData);
      toast.success('Product added successfully');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`Delete product "${product.name}"?`)) {
      deleteProduct(product.id);
      toast.success('Product deleted');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage your products and stock</p>
        </div>
        {hasPermission('accountant') && (
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Product
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 text-center">
          <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{products.length}</p>
          <p className="text-sm text-muted-foreground">Total Products</p>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-2xl font-bold text-success">{formatCurrency(totalValue)}</p>
          <p className="text-sm text-muted-foreground">Stock Value</p>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-2xl font-bold">
            {products.reduce((sum, p) => sum + p.quantity, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Units</p>
        </div>
        <div className="glass-card rounded-xl p-5 text-center">
          {lowStockProducts.length > 0 && (
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-warning" />
          )}
          <p className="text-2xl font-bold text-warning">{lowStockProducts.length}</p>
          <p className="text-sm text-muted-foreground">Low Stock Items</p>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Product',
            render: (p) => (
              <div>
                <p className="font-medium">{p.name}</p>
                {p.sku && <p className="text-xs text-muted-foreground font-mono">SKU: {p.sku}</p>}
              </div>
            ),
          },
          {
            key: 'price',
            label: 'Sell Price',
            render: (p) => formatCurrency(p.price),
          },
          {
            key: 'cost',
            label: 'Cost',
            render: (p) => formatCurrency(p.cost),
          },
          {
            key: 'quantity',
            label: 'Stock',
            render: (p) => (
              <div className="flex items-center gap-2">
                <span className={p.quantity <= 10 ? 'text-warning font-medium' : ''}>
                  {p.quantity} {p.unit}
                </span>
                {p.quantity <= 10 && <AlertTriangle size={14} className="text-warning" />}
              </div>
            ),
          },
          {
            key: 'gstRate',
            label: 'GST',
            render: (p) => <span className="badge badge-info">{p.gstRate}%</span>,
          },
          {
            key: 'value',
            label: 'Value',
            render: (p) => formatCurrency(p.cost * p.quantity),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (p) => hasPermission('accountant') ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(p)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(p)}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : null,
          },
        ]}
        data={filteredProducts}
        keyExtractor={(p) => p.id}
        emptyMessage="No products found. Add your first product!"
      />

      {/* Add/Edit Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Product name"
                required
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="input-field font-mono"
                placeholder="PRD-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field resize-none"
              rows={2}
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sell Price *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cost Price *</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quantity *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="input-field"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="input-field"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="l">Liters</option>
                <option value="ml">Milliliters</option>
                <option value="m">Meters</option>
                <option value="box">Boxes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">HSN Code</label>
              <input
                type="text"
                value={formData.hsnCode}
                onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                className="input-field font-mono"
                placeholder="8471"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">GST Rate</label>
              <select
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                className="input-field"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
