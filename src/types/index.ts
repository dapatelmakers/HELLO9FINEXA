export type UserRole = 'admin' | 'accountant' | 'viewer';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  companyName: string;
  gstState: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gstin?: string;
  address?: string;
  state: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gstin?: string;
  address?: string;
  state: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  cost: number;
  quantity: number;
  unit: string;
  hsnCode?: string;
  gstRate: number;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  gstRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: 'pending' | 'received' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  reference?: string;
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  description: string;
  amount: number;
  balance: number;
  reference?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  stockValue: number;
  cashBalance: number;
  receivables: number;
  payables: number;
  invoiceCount: number;
  customerCount: number;
}

export type ThemeType = 'light' | 'dark' | 'purple' | 'green' | 'solar' | 'high-contrast';

export interface AppSettings {
  theme: ThemeType;
  darkMode: boolean;
  companyLogo?: string;
  invoicePrefix: string;
  purchasePrefix: string;
  currency: string;
  fiscalYearStart: string;
}
