import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Supplier, Product, Invoice, Purchase, LedgerEntry, AppSettings, DashboardStats } from '@/types';
import { storage, generateId } from '@/lib/storage';

interface DataContextType {
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getNextInvoiceNumber: () => string;

  // Purchases
  purchases: Purchase[];
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  updatePurchase: (id: string, purchase: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;

  // Ledger
  ledgerEntries: LedgerEntry[];
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'createdAt'>) => void;
  updateLedgerEntry: (id: string, entry: Partial<LedgerEntry>) => void;
  deleteLedgerEntry: (id: string) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Stats
  getStats: () => DashboardStats;

  // Data Management
  clearAllData: () => void;
  exportData: () => string;
  importData: (data: string) => boolean;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  darkMode: false,
  invoicePrefix: 'INV-',
  purchasePrefix: 'PO-',
  currency: 'INR',
  fiscalYearStart: '04-01',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    setCustomers(storage.get('customers', []));
    setSuppliers(storage.get('suppliers', []));
    setProducts(storage.get('products', []));
    setInvoices(storage.get('invoices', []));
    setPurchases(storage.get('purchases', []));
    setLedgerEntries(storage.get('ledgerEntries', []));
    setSettings(storage.get('settings', defaultSettings));
  }, []);

  // Customers
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...customers, newCustomer];
    setCustomers(updated);
    storage.set('customers', updated);
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    const updated = customers.map(c => c.id === id ? { ...c, ...customer } : c);
    setCustomers(updated);
    storage.set('customers', updated);
  };

  const deleteCustomer = (id: string) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    storage.set('customers', updated);
  };

  // Suppliers
  const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...suppliers, newSupplier];
    setSuppliers(updated);
    storage.set('suppliers', updated);
  };

  const updateSupplier = (id: string, supplier: Partial<Supplier>) => {
    const updated = suppliers.map(s => s.id === id ? { ...s, ...supplier } : s);
    setSuppliers(updated);
    storage.set('suppliers', updated);
  };

  const deleteSupplier = (id: string) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    storage.set('suppliers', updated);
  };

  // Products
  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    storage.set('products', updated);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...product } : p);
    setProducts(updated);
    storage.set('products', updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    storage.set('products', updated);
  };

  // Invoices
  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...invoices, newInvoice];
    setInvoices(updated);
    storage.set('invoices', updated);

    // Add to ledger
    addLedgerEntry({
      date: invoice.date,
      type: 'income',
      category: 'Sales',
      description: `Invoice ${invoice.invoiceNumber} - ${invoice.customerName}`,
      amount: invoice.total,
      reference: invoice.invoiceNumber,
    });
  };

  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    const updated = invoices.map(i => i.id === id ? { ...i, ...invoice } : i);
    setInvoices(updated);
    storage.set('invoices', updated);
  };

  const deleteInvoice = (id: string) => {
    const updated = invoices.filter(i => i.id !== id);
    setInvoices(updated);
    storage.set('invoices', updated);
  };

  const getNextInvoiceNumber = (): string => {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = invoices.length + 1;
    return `${settings.invoicePrefix}${year}${count.toString().padStart(4, '0')}`;
  };

  // Purchases
  const addPurchase = (purchase: Omit<Purchase, 'id' | 'createdAt'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...purchases, newPurchase];
    setPurchases(updated);
    storage.set('purchases', updated);

    // Add to ledger
    addLedgerEntry({
      date: purchase.date,
      type: 'expense',
      category: 'Purchases',
      description: `Purchase ${purchase.purchaseNumber} - ${purchase.supplierName}`,
      amount: purchase.total,
      reference: purchase.purchaseNumber,
    });
  };

  const updatePurchase = (id: string, purchase: Partial<Purchase>) => {
    const updated = purchases.map(p => p.id === id ? { ...p, ...purchase } : p);
    setPurchases(updated);
    storage.set('purchases', updated);
  };

  const deletePurchase = (id: string) => {
    const updated = purchases.filter(p => p.id !== id);
    setPurchases(updated);
    storage.set('purchases', updated);
  };

  // Ledger
  const addLedgerEntry = (entry: Omit<LedgerEntry, 'id' | 'createdAt'>) => {
    const newEntry: LedgerEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...ledgerEntries, newEntry];
    setLedgerEntries(updated);
    storage.set('ledgerEntries', updated);
  };

  const updateLedgerEntry = (id: string, entry: Partial<LedgerEntry>) => {
    const updated = ledgerEntries.map(e => e.id === id ? { ...e, ...entry } : e);
    setLedgerEntries(updated);
    storage.set('ledgerEntries', updated);
  };

  const deleteLedgerEntry = (id: string) => {
    const updated = ledgerEntries.filter(e => e.id !== id);
    setLedgerEntries(updated);
    storage.set('ledgerEntries', updated);
  };

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    storage.set('settings', updated);
  };

  // Stats
  const getStats = (): DashboardStats => {
    const totalIncome = ledgerEntries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpense = ledgerEntries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    const stockValue = products.reduce((sum, p) => sum + (p.cost * p.quantity), 0);

    const receivables = invoices
      .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.total, 0);

    const payables = purchases
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.total, 0);

    return {
      totalIncome,
      totalExpense,
      profit: totalIncome - totalExpense,
      stockValue,
      cashBalance: totalIncome - totalExpense,
      receivables,
      payables,
      invoiceCount: invoices.length,
      customerCount: customers.length,
    };
  };

  // Data Management
  const clearAllData = () => {
    storage.clear();
    setCustomers([]);
    setSuppliers([]);
    setProducts([]);
    setInvoices([]);
    setPurchases([]);
    setLedgerEntries([]);
    setSettings(defaultSettings);
  };

  const exportData = (): string => {
    return storage.exportAll();
  };

  const importData = (data: string): boolean => {
    const success = storage.importAll(data);
    if (success) {
      setCustomers(storage.get('customers', []));
      setSuppliers(storage.get('suppliers', []));
      setProducts(storage.get('products', []));
      setInvoices(storage.get('invoices', []));
      setPurchases(storage.get('purchases', []));
      setLedgerEntries(storage.get('ledgerEntries', []));
      setSettings(storage.get('settings', defaultSettings));
    }
    return success;
  };

  return (
    <DataContext.Provider
      value={{
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getNextInvoiceNumber,
        purchases,
        addPurchase,
        updatePurchase,
        deletePurchase,
        ledgerEntries,
        addLedgerEntry,
        updateLedgerEntry,
        deleteLedgerEntry,
        settings,
        updateSettings,
        getStats,
        clearAllData,
        exportData,
        importData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
