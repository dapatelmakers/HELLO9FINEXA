import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Supplier, Product, Invoice, Purchase, LedgerEntry, AppSettings, DashboardStats, BankTransaction, Loan } from '@/types';
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
  getNextPurchaseNumber: () => string;

  // Bank & Cash
  bankTransactions: BankTransaction[];
  addBankTransaction: (tx: Omit<BankTransaction, 'id' | 'createdAt'>) => void;
  updateBankTransaction: (id: string, tx: Partial<BankTransaction>) => void;
  deleteBankTransaction: (id: string) => void;
  getBalances: () => { bank: number; cash: number };

  // Loans
  loans: Loan[];
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt'>) => void;
  updateLoan: (id: string, loan: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;

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
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    setCustomers(storage.get('customers', []));
    setSuppliers(storage.get('suppliers', []));
    setProducts(storage.get('products', []));
    setInvoices(storage.get('invoices', []));
    setPurchases(storage.get('purchases', []));
    setLedgerEntries(storage.get('ledgerEntries', []));
    setBankTransactions(storage.get('bankTransactions', []));
    setLoans(storage.get('loans', []));
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

    // Auto stock update for received purchases
    if (purchase.status === 'received') {
      applyStockChange(purchase.items, 1);
    }
  };

  const applyStockChange = (items: Invoice['items'], direction: 1 | -1) => {
    const current = storage.get<Product[]>('products', []);
    const updatedProducts = current.map(product => {
      const matched = items.filter(item => item.productId === product.id);
      if (matched.length === 0) return product;
      const qty = matched.reduce((sum, item) => sum + item.quantity, 0);
      return { ...product, quantity: Math.max(0, product.quantity + direction * qty) };
    });
    setProducts(updatedProducts);
    storage.set('products', updatedProducts);
  };

  const getNextPurchaseNumber = (): string => {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = purchases.length + 1;
    return `${settings.purchasePrefix}${year}${count.toString().padStart(4, '0')}`;
  };

  // Bank & Cash
  const addBankTransaction = (tx: Omit<BankTransaction, 'id' | 'createdAt'>) => {
    const newTx: BankTransaction = {
      ...tx,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...bankTransactions, newTx];
    setBankTransactions(updated);
    storage.set('bankTransactions', updated);
  };

  const updateBankTransaction = (id: string, tx: Partial<BankTransaction>) => {
    const updated = bankTransactions.map(t => t.id === id ? { ...t, ...tx } : t);
    setBankTransactions(updated);
    storage.set('bankTransactions', updated);
  };

  const deleteBankTransaction = (id: string) => {
    const updated = bankTransactions.filter(t => t.id !== id);
    setBankTransactions(updated);
    storage.set('bankTransactions', updated);
  };

  const getBalances = () => {
    const compute = (account: 'bank' | 'cash') =>
      bankTransactions
        .filter(t => t.account === account)
        .reduce((sum, t) => sum + (t.type === 'deposit' ? t.amount : -t.amount), 0);
    return { bank: compute('bank'), cash: compute('cash') };
  };

  // Loans
  const addLoan = (loan: Omit<Loan, 'id' | 'createdAt'>) => {
    const newLoan: Loan = {
      ...loan,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...loans, newLoan];
    setLoans(updated);
    storage.set('loans', updated);
  };

  const updateLoan = (id: string, loan: Partial<Loan>) => {
    const updated = loans.map(l => l.id === id ? { ...l, ...loan } : l);
    setLoans(updated);
    storage.set('loans', updated);
  };

  const deleteLoan = (id: string) => {
    const updated = loans.filter(l => l.id !== id);
    setLoans(updated);
    storage.set('loans', updated);
  };

  const updatePurchase = (id: string, purchase: Partial<Purchase>) => {
    const existing = purchases.find(p => p.id === id);
    if (existing && purchase.status && purchase.status !== existing.status) {
      if (purchase.status === 'received' && existing.status !== 'received') {
        applyStockChange(existing.items, 1);
      } else if (existing.status === 'received' && purchase.status !== 'received') {
        applyStockChange(existing.items, -1);
      }
    }
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
      cashBalance: bankTransactions.length > 0
        ? bankTransactions.reduce((sum, t) => sum + (t.type === 'deposit' ? t.amount : -t.amount), 0)
        : totalIncome - totalExpense,
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
    setBankTransactions([]);
    setLoans([]);
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
      setBankTransactions(storage.get('bankTransactions', []));
      setLoans(storage.get('loans', []));
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
        getNextPurchaseNumber,
        bankTransactions,
        addBankTransaction,
        updateBankTransaction,
        deleteBankTransaction,
        getBalances,
        loans,
        addLoan,
        updateLoan,
        deleteLoan,
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
