import React, { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { FormModal } from '@/components/modals/FormModal';
import { Plus, Search, Trash2, PackageCheck, XCircle } from 'lucide-react';
import { formatCurrency, formatDate, generateId } from '@/lib/storage';
import { InvoiceItem, Purchase } from '@/types';
import { toast } from 'sonner';

const emptyItem = (): InvoiceItem => ({ id: generateId(), description: '', quantity: 1, rate: 0, discount: 0, discountType: 'percentage', gstRate: 18, amount: 0 });

export const Purchases: React.FC = () => {
  const { purchases, suppliers, products, addPurchase, updatePurchase, deletePurchase, getNextPurchaseNumber } = useData();
  const { user, hasPermission } = useAuth();
  const canEdit = hasPermission('accountant');
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<Purchase['status']>('pending');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);

  const supplier = suppliers.find(s => s.id === supplierId);
  const interState = !!supplier && !!user?.gstState && supplier.state !== user.gstState;

  const calc = useMemo(() => {
    let subtotal = 0, tax = 0;
    const rows = items.map(it => {
      const base = it.quantity * it.rate;
      const disc = it.discountType === 'percentage' ? base * it.discount / 100 : it.discount;
      const net = base - disc;
      subtotal += net; tax += net * it.gstRate / 100;
      return { ...it, amount: net };
    });
    return { rows, subtotal, cgst: interState ? 0 : tax / 2, sgst: interState ? 0 : tax / 2, igst: interState ? tax : 0, total: subtotal + tax };
  }, [items, interState]);

  const setItem = (id: string, patch: Partial<InvoiceItem>) => setItems(items.map(i => i.id === id ? { ...i, ...patch } : i));
  const pickProduct = (id: string, productId: string) => {
    const p = products.find(x => x.id === productId);
    setItem(id, p ? { productId, description: p.name, rate: p.cost, gstRate: p.gstRate } : { productId: undefined });
  };

  const reset = () => { setSupplierId(''); setStatus('pending'); setNotes(''); setItems([emptyItem()]); };

  const save = () => {
    if (!supplier) return toast.error('Select a supplier');
    if (!calc.rows.some(r => r.description && r.quantity > 0)) return toast.error('Add at least one item');
    addPurchase({
      purchaseNumber: getNextPurchaseNumber(), supplierId, supplierName: supplier.name, date,
      items: calc.rows.filter(r => r.description), subtotal: calc.subtotal, cgst: calc.cgst, sgst: calc.sgst, igst: calc.igst,
      total: calc.total, status, notes,
    });
    toast.success(status === 'received' ? 'Purchase saved & stock updated' : 'Purchase saved');
    setOpen(false); reset();
  };

  const list = purchases.filter(p => (p.purchaseNumber + p.supplierName).toLowerCase().includes(q.toLowerCase())).slice().reverse();
  const totals = { all: purchases.reduce((s, p) => s + (p.status !== 'cancelled' ? p.total : 0), 0), pending: purchases.filter(p => p.status === 'pending').reduce((s, p) => s + p.total, 0) };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Purchases</h1>
          <p className="text-muted-foreground mt-1">Record supplier bills with GST — stock updates when goods are received</p>
        </div>
        {canEdit && <button className="btn-primary flex items-center gap-2" onClick={() => setOpen(true)}><Plus size={18} /> New Purchase</button>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4"><p className="text-sm text-muted-foreground">Total purchases</p><p className="text-2xl font-bold">{formatCurrency(totals.all)}</p></div>
        <div className="glass-card rounded-xl p-4"><p className="text-sm text-muted-foreground">Pending (payable)</p><p className="text-2xl font-bold">{formatCurrency(totals.pending)}</p></div>
        <div className="glass-card rounded-xl p-4"><p className="text-sm text-muted-foreground">Bills</p><p className="text-2xl font-bold">{purchases.length}</p></div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search purchases..." className="input-field pl-10" />
      </div>

      <div className="glass-card rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr className="text-left">
            <th className="p-3">No.</th><th className="p-3">Date</th><th className="p-3">Supplier</th><th className="p-3 text-right">GST</th><th className="p-3 text-right">Total</th><th className="p-3">Status</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No purchases yet</td></tr>}
            {list.map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-medium">{p.purchaseNumber}</td>
                <td className="p-3">{formatDate(p.date)}</td>
                <td className="p-3">{p.supplierName}</td>
                <td className="p-3 text-right">{formatCurrency(p.cgst + p.sgst + p.igst)}</td>
                <td className="p-3 text-right font-semibold">{formatCurrency(p.total)}</td>
                <td className="p-3"><span className="badge">{p.status}</span></td>
                <td className="p-3">
                  {canEdit && <div className="flex gap-1 justify-end">
                    {p.status === 'pending' && <button aria-label="Mark received" title="Mark received" className="p-2 rounded hover:bg-muted" onClick={() => { updatePurchase(p.id, { status: 'received' }); toast.success('Marked received — stock added'); }}><PackageCheck size={16} /></button>}
                    {p.status !== 'cancelled' && <button aria-label="Cancel" title="Cancel / debit note" className="p-2 rounded hover:bg-muted" onClick={() => { updatePurchase(p.id, { status: 'cancelled' }); toast.success('Purchase cancelled'); }}><XCircle size={16} /></button>}
                    <button aria-label="Delete" className="p-2 rounded hover:bg-muted text-destructive" onClick={() => window.confirm('Delete this purchase?') && deletePurchase(p.id)}><Trash2 size={16} /></button>
                  </div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormModal isOpen={open} onClose={() => setOpen(false)} title="New Purchase" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select aria-label="Supplier" className="input-field" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
              <option value="">Select supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input aria-label="Date" type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
            <select aria-label="Status" className="input-field" value={status} onChange={e => setStatus(e.target.value as Purchase['status'])}>
              <option value="pending">Pending</option><option value="received">Received</option>
            </select>
          </div>
          {suppliers.length === 0 && <p className="text-sm text-destructive">Add a supplier first on the Suppliers page.</p>}
          <div className="space-y-2">
            {items.map(it => (
              <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                <select aria-label="Product" className="input-field col-span-12 md:col-span-4" value={it.productId || ''} onChange={e => pickProduct(it.id, e.target.value)}>
                  <option value="">Custom item</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input aria-label="Description" className="input-field col-span-12 md:col-span-3" placeholder="Description" value={it.description} onChange={e => setItem(it.id, { description: e.target.value })} />
                <input aria-label="Quantity" type="number" className="input-field col-span-3 md:col-span-1" value={it.quantity} onChange={e => setItem(it.id, { quantity: +e.target.value })} />
                <input aria-label="Rate" type="number" className="input-field col-span-4 md:col-span-2" value={it.rate} onChange={e => setItem(it.id, { rate: +e.target.value })} />
                <select aria-label="GST rate" className="input-field col-span-3 md:col-span-1" value={it.gstRate} onChange={e => setItem(it.id, { gstRate: +e.target.value })}>
                  {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                </select>
                <button aria-label="Remove item" className="col-span-2 md:col-span-1 p-2 text-destructive" onClick={() => setItems(items.length > 1 ? items.filter(i => i.id !== it.id) : items)}><Trash2 size={16} /></button>
              </div>
            ))}
            <button className="btn-secondary text-sm" onClick={() => setItems([...items, emptyItem()])}>+ Add item</button>
          </div>
          <textarea className="input-field" placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
          <div className="text-sm space-y-1 text-right">
            <p>Subtotal: {formatCurrency(calc.subtotal)}</p>
            {interState ? <p>IGST: {formatCurrency(calc.igst)}</p> : <><p>CGST: {formatCurrency(calc.cgst)}</p><p>SGST: {formatCurrency(calc.sgst)}</p></>}
            <p className="text-lg font-bold">Total: {formatCurrency(calc.total)}</p>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={save}>Save Purchase</button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};
