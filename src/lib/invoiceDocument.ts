import { AppSettings, Customer, Invoice } from '@/types';
import { formatCurrency, formatDate } from './storage';

interface CompanyInfo {
  name: string;
  gstin?: string;
  address?: string;
  phone?: string;
  email?: string;
  state?: string;
  logo?: string;
}

const esc = (value?: string | number) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const getCompanyInfo = (
  settings: AppSettings,
  fallbackName: string,
  fallbackState?: string,
): CompanyInfo => ({
  name: settings.companyName || fallbackName || 'Hello9 FINEXA™',
  gstin: settings.companyGstin,
  address: settings.companyAddress,
  phone: settings.companyPhone,
  email: settings.companyEmail,
  state: fallbackState,
  logo: settings.companyLogo,
});

export const buildInvoiceHtml = (
  invoice: Invoice,
  company: CompanyInfo,
  customer?: Customer,
): string => {
  const rows = invoice.items
    .map((item, index) => {
      const gst = (item.amount * item.gstRate) / 100;
      return `<tr>
        <td>${index + 1}</td>
        <td>${esc(item.description) || '-'}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">${formatCurrency(item.rate)}</td>
        <td class="num">${item.discount ? (item.discountType === 'percentage' ? `${item.discount}%` : formatCurrency(item.discount)) : '-'}</td>
        <td class="num">${item.gstRate}%</td>
        <td class="num">${formatCurrency(gst)}</td>
        <td class="num">${formatCurrency(item.amount + gst)}</td>
      </tr>`;
    })
    .join('');

  const logo = company.logo
    ? `<img src="${esc(company.logo)}" alt="${esc(company.name)} logo" class="logo" />`
    : `<div class="logo-fallback">H9</div>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>${esc(invoice.invoiceNumber)} — ${esc(company.name)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "Helvetica Neue", Arial, sans-serif; color: #0f172a; margin: 0; padding: 28px; background: #fff; font-size: 12px; }
  .sheet { max-width: 800px; margin: 0 auto; }
  header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 3px solid #0ea5e9; padding-bottom: 16px; }
  .logo { max-height: 68px; max-width: 190px; object-fit: contain; }
  .logo-fallback { width: 60px; height: 60px; border-radius: 14px; background: linear-gradient(135deg,#0ea5e9,#14b8a6); color:#fff; font-weight:700; font-size:22px; display:flex; align-items:center; justify-content:center; }
  h1 { font-size: 22px; margin: 10px 0 4px; }
  .muted { color: #64748b; }
  .doc-title { text-align: right; }
  .doc-title h2 { margin: 0; font-size: 26px; letter-spacing: 2px; color: #0ea5e9; }
  .parties { display: flex; gap: 24px; margin: 20px 0; }
  .parties > div { flex: 1; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
  .parties h3 { margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #e2e8f0; padding: 7px 8px; text-align: left; }
  th { background: #f1f5f9; font-size: 11px; text-transform: uppercase; letter-spacing: .4px; }
  .num { text-align: right; white-space: nowrap; }
  .totals { margin-top: 16px; margin-left: auto; width: 320px; }
  .totals td { border: none; padding: 5px 8px; }
  .totals tr.grand td { border-top: 2px solid #0f172a; font-size: 15px; font-weight: 700; }
  footer { margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
  .sign { text-align: right; }
  .sign span { display: block; margin-top: 42px; border-top: 1px solid #94a3b8; padding-top: 4px; }
  @media print { body { padding: 0; } @page { margin: 14mm; } }
</style></head>
<body><div class="sheet">
  <header>
    <div>
      ${logo}
      <h1>${esc(company.name)}</h1>
      ${company.gstin ? `<div><strong>GSTIN:</strong> ${esc(company.gstin)}</div>` : ''}
      ${company.address ? `<div class="muted">${esc(company.address)}</div>` : ''}
      ${company.state ? `<div class="muted">${esc(company.state)}, India</div>` : ''}
      ${company.phone ? `<div class="muted">Ph: ${esc(company.phone)}</div>` : ''}
      ${company.email ? `<div class="muted">${esc(company.email)}</div>` : ''}
    </div>
    <div class="doc-title">
      <h2>TAX INVOICE</h2>
      <div><strong>${esc(invoice.invoiceNumber)}</strong></div>
      <div class="muted">Date: ${formatDate(invoice.date)}</div>
      <div class="muted">Due: ${formatDate(invoice.dueDate)}</div>
      <div class="muted">Status: ${esc(invoice.status)}</div>
    </div>
  </header>

  <div class="parties">
    <div>
      <h3>Bill To</h3>
      <div><strong>${esc(invoice.customerName)}</strong></div>
      ${customer?.gstin ? `<div>GSTIN: ${esc(customer.gstin)}</div>` : ''}
      ${customer?.address ? `<div class="muted">${esc(customer.address)}</div>` : ''}
      ${customer?.state ? `<div class="muted">${esc(customer.state)}</div>` : ''}
      ${customer?.phone ? `<div class="muted">Ph: ${esc(customer.phone)}</div>` : ''}
    </div>
    <div>
      <h3>Place of Supply</h3>
      <div>${esc(customer?.state || company.state || '-')}</div>
      <h3 style="margin-top:10px">Supply Type</h3>
      <div>${invoice.igst > 0 ? 'Inter-state (IGST)' : 'Intra-state (CGST + SGST)'}</div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th>#</th><th>Description</th><th class="num">Qty</th><th class="num">Rate</th>
      <th class="num">Disc.</th><th class="num">GST %</th><th class="num">GST Amt</th><th class="num">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <table class="totals">
    <tr><td>Taxable Value</td><td class="num">${formatCurrency(invoice.subtotal)}</td></tr>
    ${invoice.discountTotal ? `<tr><td>Discount</td><td class="num">- ${formatCurrency(invoice.discountTotal)}</td></tr>` : ''}
    ${invoice.cgst ? `<tr><td>CGST</td><td class="num">${formatCurrency(invoice.cgst)}</td></tr>` : ''}
    ${invoice.sgst ? `<tr><td>SGST</td><td class="num">${formatCurrency(invoice.sgst)}</td></tr>` : ''}
    ${invoice.igst ? `<tr><td>IGST</td><td class="num">${formatCurrency(invoice.igst)}</td></tr>` : ''}
    <tr class="grand"><td>Grand Total</td><td class="num">${formatCurrency(invoice.total)}</td></tr>
  </table>

  ${invoice.notes ? `<p><strong>Notes:</strong> ${esc(invoice.notes)}</p>` : ''}

  <footer>
    <div class="muted">
      <div>Generated by Hello9 FINEXA™ — Smart Accounting • GST • Offline-First</div>
      <div>This is a computer generated invoice.</div>
    </div>
    <div class="sign"><span>Authorised Signatory</span></div>
  </footer>
</div>
<script>window.onload = function () { window.focus(); window.print(); };</script>
</body></html>`;
};

export const printInvoice = (invoice: Invoice, company: CompanyInfo, customer?: Customer) => {
  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) return false;
  win.document.write(buildInvoiceHtml(invoice, company, customer));
  win.document.close();
  return true;
};

export const downloadInvoiceHtml = (invoice: Invoice, company: CompanyInfo, customer?: Customer) => {
  const html = buildInvoiceHtml(invoice, company, customer).replace(
    '<script>window.onload = function () { window.focus(); window.print(); };</script>',
    '',
  );
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invoice.invoiceNumber}.html`;
  a.click();
  URL.revokeObjectURL(url);
};
