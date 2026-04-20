import { supabase, isSupabaseAvailable } from './supabaseService';
import { Invoice, Payment, Expense, Budget, FinancialService } from './financialService';
import { campRegistrationService } from './campRegistrationService';
import { format, parseISO, differenceInDays, startOfDay, endOfDay, subDays, isWithinInterval } from 'date-fns';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { matchesActivity, ACTIVITY_CATEGORIES } from '@/lib/activityCategories';

const financialService = FinancialService.getInstance();

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ReportFilters {
  dateRange: DateRange;
  activities?: string[]; // camp_type or program_name filter
}

export interface ProfitLossData {
  revenue: {
    invoices: number;
    payments: number;
    campRegistrations: number;
    total: number;
  };
  expenses: {
    byCategory: Record<string, number>;
    total: number;
  };
  netProfit: number;
  period: DateRange;
}

export interface ARAgingItem {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  childName?: string;
  activityName?: string;
  referenceId?: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  dueDate: string;
  daysOverdue: number;
  agingBucket: 'current' | '1-30' | '31-60' | '61-90' | '90+';
  source: 'invoice' | 'collection';
}

export interface ARAgingSummary {
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  days90plus: number;
  total: number;
  items: ARAgingItem[];
  // Attended-but-unpaid collections (matches Dashboard "Total Outstanding")
  attendedUnpaidTotal: number;
  attendedUnpaidCount: number;
  // Invoice-only subtotal (formal AR)
  invoicedTotal: number;
  invoicedCount: number;
}

export interface RevenueReportData {
  totalRevenue: number;
  paymentsRevenue: number;
  campRegistrationsRevenue: number;
  bySource: Array<{ source: string; amount: number; count: number }>;
  byActivity: Array<{ activity: string; amount: number; count: number }>;
  byMethod: Array<{ method: string; amount: number; count: number }>;
  trend: Array<{ date: string; amount: number }>;
  period: DateRange;
}

export interface ExpenseReportData {
  totalExpenses: number;
  byCategory: Array<{ category: string; amount: number; count: number; percentage: number }>;
  byStatus: Array<{ status: string; amount: number; count: number }>;
  byVendor: Array<{ vendor: string; amount: number; count: number }>;
  trend: Array<{ date: string; amount: number }>;
  topExpenses: Array<{ description: string; category: string; amount: number; date: string }>;
  period: DateRange;
}

export interface DailySalesData {
  date: string;
  invoicesCreated: number;
  invoicesAmount: number;
  paymentsReceived: number;
  paymentsAmount: number;
  campRegistrations: number;
  campRevenue: number;
  totalRevenue: number;
}

export const financialReportService = {
  // Fetch all financial data for a date range with optional activity filter
  async fetchFinancialData(dateRange: DateRange, activities?: string[]) {
    const [invoices, payments, expenses, budgets, campRegistrations] = await Promise.all([
      financialService.getInvoices(),
      financialService.getPayments(),
      financialService.getExpenses(),
      financialService.getBudgets(),
      campRegistrationService.getAllRegistrations({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      }),
    ]);

    // Apply activity filter if provided (alias-aware)
    const hasActivityFilter = activities && activities.length > 0;
    const filteredCampRegistrations = hasActivityFilter
      ? campRegistrations.filter(r => matchesActivity((r as any).camp_type, activities!))
      : campRegistrations;

    const filteredPayments = hasActivityFilter
      ? payments.filter(p => {
          // Include payments linked to filtered registrations, or matching program_name
          if (p.registration_id) {
            return filteredCampRegistrations.some(r => r.id === p.registration_id);
          }
          if (p.program_name) {
            return matchesActivity(p.program_name, activities!);
          }
          // Include unlinked payments only when no activity filter
          return false;
        })
      : payments;

    const filteredExpenses = hasActivityFilter
      ? expenses.filter(e => matchesActivity(e.category, activities!))
      : expenses;

    return { invoices, payments: filteredPayments, expenses: filteredExpenses, budgets, campRegistrations: filteredCampRegistrations };
  },

  // Generate Profit & Loss Statement — uses payments table as source of truth for revenue
  async generateProfitLoss(dateRange: DateRange, activities?: string[]): Promise<ProfitLossData> {
    const { invoices, payments, expenses, campRegistrations } = await this.fetchFinancialData(dateRange, activities);

    // Filter by date range
    const filteredInvoices = invoices.filter(inv => {
      const date = parseISO(inv.created_at);
      return isWithinInterval(date, { start: dateRange.startDate, end: dateRange.endDate });
    });

    // Payments table = source of truth for revenue (matches dashboard)
    const filteredPayments = payments.filter(p => {
      const date = parseISO(p.payment_date);
      return isWithinInterval(date, { start: dateRange.startDate, end: dateRange.endDate }) && p.status === 'completed';
    });

    const filteredExpenses = expenses.filter(e => {
      const date = parseISO(e.expense_date);
      return isWithinInterval(date, { start: dateRange.startDate, end: dateRange.endDate }) && 
             (e.status === 'approved' || e.status === 'paid');
    });

    // Revenue from payments table
    const paymentRevenue = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // For breakdown: split payments linked to camp registrations vs other
    const campRegIds = new Set(campRegistrations.map(r => r.id));
    const paymentLinkedRegIds = new Set(
      filteredPayments
        .filter(p => p.registration_id && campRegIds.has(p.registration_id))
        .map(p => p.registration_id as string)
    );
    const campPaymentRevenue = filteredPayments
      .filter(p => (p.registration_id && campRegIds.has(p.registration_id)) || p.source === 'camp_registration')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const otherPaymentRevenue = paymentRevenue - campPaymentRevenue;

    // Add camp registrations marked payment_status='paid' that DO NOT have a corresponding payment row
    // (avoid double-counting). This matches the Dashboard's source of truth.
    const paidCampRegRevenue = campRegistrations
      .filter(r => {
        if ((r as any).payment_status !== 'paid') return false;
        if (paymentLinkedRegIds.has(r.id!)) return false; // already counted via payments
        // Filter by created_at within range
        const createdAt = r.created_at ? parseISO(r.created_at) : null;
        return createdAt ? isWithinInterval(createdAt, { start: dateRange.startDate, end: dateRange.endDate }) : false;
      })
      .reduce((sum, r) => sum + Number((r as any).total_amount || 0), 0);

    // Combined camp revenue = payments-linked camp + paid registrations not yet in payments
    const combinedCampRevenue = campPaymentRevenue + paidCampRegRevenue;

    // Invoice revenue for reference only (not counted in total to avoid double-counting)
    const invoiceRevenue = filteredInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);

    // Calculate expenses by category
    const expensesByCategory: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      const category = exp.category || 'Uncategorized';
      expensesByCategory[category] = (expensesByCategory[category] || 0) + Number(exp.amount);
    });

    const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
    const totalRevenue = paymentRevenue + paidCampRegRevenue;

    return {
      revenue: {
        invoices: invoiceRevenue,
        payments: otherPaymentRevenue,
        campRegistrations: combinedCampRevenue,
        total: totalRevenue,
      },
      expenses: {
        byCategory: expensesByCategory,
        total: totalExpenses,
      },
      netProfit: totalRevenue - totalExpenses,
      period: dateRange,
    };
  },

  // Generate AR Aging Report — combines invoice-based AR + attended-but-unpaid collections,
  // each aged into proper buckets so 90+ days reflects real overdue items
  async generateARAgingReport(activities?: string[]): Promise<ARAgingSummary> {
    const bucketize = (daysOverdue: number): ARAgingItem['agingBucket'] => {
      if (daysOverdue <= 0) return 'current';
      if (daysOverdue <= 30) return '1-30';
      if (daysOverdue <= 60) return '31-60';
      if (daysOverdue <= 90) return '61-90';
      return '90+';
    };

    const hasActivityFilter = activities && activities.length > 0;
    const itemMatchesActivity = (activity?: string) =>
      !hasActivityFilter || matchesActivity(activity, activities!);

    const invoices = await financialService.getInvoices();
    const payments = await financialService.getPayments();
    const today = new Date();

    // Map invoice -> linked registration to enrich activity/child info
    let invoiceRegMap: Record<string, any> = {};
    if (isSupabaseAvailable() && supabase) {
      const invoiceIds = invoices.map(i => i.id).filter(Boolean);
      if (invoiceIds.length > 0) {
        const { data: regsForInvoices } = await supabase
          .from('camp_registrations' as any)
          .select('id, invoice_id, camp_type, child_name, parent_phone, parent_email')
          .in('invoice_id', invoiceIds);
        ((regsForInvoices || []) as any[]).forEach((r: any) => {
          if (r.invoice_id) invoiceRegMap[r.invoice_id] = r;
        });
      }
    }

    // ---- 1) Build invoice-based aging items
    const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled');
    const invoiceItems: ARAgingItem[] = unpaidInvoices.map(inv => {
      const invoicePayments = payments.filter(p => p.invoice_id === inv.id && p.status === 'completed');
      const paidAmount = invoicePayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const balanceDue = Number(inv.total_amount) - paidAmount;
      const dueDate = parseISO(inv.due_date);
      const daysOverdue = differenceInDays(today, dueDate);
      const bucket = bucketize(daysOverdue);
      const linkedReg = invoiceRegMap[inv.id];
      return {
        invoiceId: inv.id,
        invoiceNumber: inv.invoice_number,
        customerName: inv.customer_name,
        customerEmail: inv.customer_email || linkedReg?.parent_email || '',
        customerPhone: linkedReg?.parent_phone || '',
        childName: linkedReg?.child_name || '',
        activityName: linkedReg?.camp_type || (inv as any).description || '',
        referenceId: linkedReg?.id || inv.id,
        totalAmount: Number(inv.total_amount),
        paidAmount,
        balanceDue,
        dueDate: inv.due_date,
        daysOverdue: Math.max(0, daysOverdue),
        agingBucket: bucket,
        source: 'invoice' as const,
      };
    }).filter(item => item.balanceDue > 0);

    // ---- 2) Build attended-but-unpaid collection items (aged by created_at)
    const collectionItems: ARAgingItem[] = [];
    let attendedUnpaidTotal = 0;
    let attendedUnpaidCount = 0;
    if (isSupabaseAvailable() && supabase) {
      const { data: collections } = await supabase
        .from('accounts_action_items' as any)
        .select('id, registration_id, parent_name, child_name, email, phone, amount_due, amount_paid, created_at, camp_type')
        .eq('status', 'pending');
      const rows = (collections || []) as any[];
      rows.forEach((c: any) => {
        const balance = Number(c.amount_due || 0) - Number(c.amount_paid || 0);
        if (balance <= 0) return;
        const created = c.created_at ? parseISO(c.created_at) : today;
        const daysOverdue = differenceInDays(today, created);
        const bucket = bucketize(daysOverdue);
        collectionItems.push({
          invoiceId: c.id,
          invoiceNumber: `COLL-${String(c.id).slice(0, 8)}`,
          customerName: c.parent_name || c.child_name || 'Unknown',
          customerEmail: c.email || '',
          customerPhone: c.phone || '',
          childName: c.child_name || '',
          activityName: c.camp_type || '',
          referenceId: c.registration_id || c.id,
          totalAmount: Number(c.amount_due || 0),
          paidAmount: Number(c.amount_paid || 0),
          balanceDue: balance,
          dueDate: c.created_at || today.toISOString(),
          daysOverdue: Math.max(0, daysOverdue),
          agingBucket: bucket,
          source: 'collection' as const,
        });
      });
    }

    // ---- 3) Combine + apply activity filter
    let items = [...invoiceItems, ...collectionItems];
    if (hasActivityFilter) {
      items = items.filter(it => itemMatchesActivity(it.activityName));
    }
    items.sort((a, b) => b.daysOverdue - a.daysOverdue);

    // Recompute attended-unpaid totals respecting the filter
    items.filter(i => i.source === 'collection').forEach(i => {
      attendedUnpaidTotal += i.balanceDue;
      attendedUnpaidCount += 1;
    });

    const filteredInvoiceItems = items.filter(i => i.source === 'invoice');
    const invoicedTotal = filteredInvoiceItems.reduce((s, i) => s + i.balanceDue, 0);

    const summary: ARAgingSummary = {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      days90plus: 0,
      total: 0,
      items,
      attendedUnpaidTotal,
      attendedUnpaidCount,
      invoicedTotal,
      invoicedCount: filteredInvoiceItems.length,
    };

    items.forEach(item => {
      summary.total += item.balanceDue;
      switch (item.agingBucket) {
        case 'current': summary.current += item.balanceDue; break;
        case '1-30': summary.days1to30 += item.balanceDue; break;
        case '31-60': summary.days31to60 += item.balanceDue; break;
        case '61-90': summary.days61to90 += item.balanceDue; break;
        case '90+': summary.days90plus += item.balanceDue; break;
      }
    });

    return summary;
  },

  // Export an aging bucket subset (clicked card) to CSV
  exportAgingBucketToCSV(items: ARAgingItem[], bucketLabel: string, filename?: string) {
    const headers = ['Source', 'Reference', 'Customer', 'Phone', 'Email', 'Child', 'Activity', 'Due/Created Date', 'Days Overdue', 'Total', 'Paid', 'Balance Due'];
    const rows = items.map(i => [
      i.source,
      i.invoiceNumber,
      i.customerName,
      i.customerPhone || '',
      i.customerEmail || '',
      i.childName || '',
      i.activityName || '',
      i.dueDate ? format(parseISO(i.dueDate), 'yyyy-MM-dd') : '',
      i.daysOverdue.toString(),
      i.totalAmount.toFixed(2),
      i.paidAmount.toFixed(2),
      i.balanceDue.toFixed(2),
    ]);
    const total = items.reduce((s, i) => s + i.balanceDue, 0);
    rows.push([]);
    rows.push(['', '', '', '', '', '', '', '', 'TOTAL', '', '', total.toFixed(2)]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename || `ar-aging-${bucketLabel.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  },

  // Export an aging bucket subset (clicked card) to PDF
  exportAgingBucketToPDF(items: ARAgingItem[], bucketLabel: string, filename?: string) {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.text(`AR Aging — ${bucketLabel}`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 25);
    const total = items.reduce((s, i) => s + i.balanceDue, 0);
    doc.text(`Items: ${items.length}  •  Total Outstanding: KES ${total.toLocaleString()}`, 14, 31);
    autoTable(doc, {
      head: [['Source', 'Reference', 'Customer', 'Phone', 'Child', 'Activity', 'Days', 'Balance']],
      body: items.map(i => [
        i.source,
        i.invoiceNumber,
        i.customerName.substring(0, 22),
        i.customerPhone || '',
        (i.childName || '').substring(0, 18),
        (i.activityName || '').substring(0, 22),
        i.daysOverdue.toString(),
        i.balanceDue.toLocaleString(),
      ]),
      startY: 38,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 53, 69] },
    });
    doc.save(filename || `ar-aging-${bucketLabel.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },

  // Generate Daily Sales Summary
  async generateDailySalesSummary(dateRange: DateRange, activities?: string[]): Promise<DailySalesData[]> {
    const { invoices, payments, campRegistrations } = await this.fetchFinancialData(dateRange, activities);

    // Create a map for each day in range
    const dailyData: Record<string, DailySalesData> = {};
    let currentDate = new Date(dateRange.startDate);
    
    while (currentDate <= dateRange.endDate) {
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      dailyData[dateKey] = {
        date: dateKey,
        invoicesCreated: 0,
        invoicesAmount: 0,
        paymentsReceived: 0,
        paymentsAmount: 0,
        campRegistrations: 0,
        campRevenue: 0,
        totalRevenue: 0,
      };
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }

    // Populate with invoice data
    invoices.forEach(inv => {
      const dateKey = format(parseISO(inv.created_at), 'yyyy-MM-dd');
      if (dailyData[dateKey]) {
        dailyData[dateKey].invoicesCreated++;
        dailyData[dateKey].invoicesAmount += Number(inv.total_amount);
      }
    });

    // Populate with payment data — payments table is one source of revenue
    const campRegIds = new Set(campRegistrations.map(r => r.id));
    const paymentLinkedRegIds = new Set<string>();
    payments.filter(p => p.status === 'completed').forEach(p => {
      const dateKey = format(parseISO(p.payment_date), 'yyyy-MM-dd');
      if (p.registration_id && campRegIds.has(p.registration_id)) {
        paymentLinkedRegIds.add(p.registration_id);
      }
      if (dailyData[dateKey]) {
        dailyData[dateKey].paymentsReceived++;
        dailyData[dateKey].paymentsAmount += Number(p.amount);
        // Track camp-linked payments separately for breakdown
        if ((p.registration_id && campRegIds.has(p.registration_id)) || p.source === 'camp_registration') {
          dailyData[dateKey].campRevenue += Number(p.amount);
        }
      }
    });

    // Track registration count, plus add paid-camp-registration revenue (matches Dashboard)
    campRegistrations.forEach(reg => {
      const dateKey = format(parseISO(reg.created_at!), 'yyyy-MM-dd');
      if (!dailyData[dateKey]) return;
      dailyData[dateKey].campRegistrations++;
      // Add paid registration revenue if not already represented in payments
      if ((reg as any).payment_status === 'paid' && !paymentLinkedRegIds.has(reg.id!)) {
        const amt = Number((reg as any).total_amount || 0);
        dailyData[dateKey].campRevenue += amt;
        dailyData[dateKey].paymentsAmount += amt;
      }
    });

    // Total revenue = payments amount + paid camp registrations (matches Dashboard)
    Object.values(dailyData).forEach(day => {
      day.totalRevenue = day.paymentsAmount;
    });

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  },

  // Export functions
  exportProfitLossToCSV(data: ProfitLossData, filename?: string) {
    const rows = [
      ['Profit & Loss Statement'],
      [`Period: ${format(data.period.startDate, 'dd MMM yyyy')} - ${format(data.period.endDate, 'dd MMM yyyy')}`],
      [''],
      ['REVENUE'],
      ['Payments Received', data.revenue.payments.toFixed(2)],
      ['Camp Registrations', data.revenue.campRegistrations.toFixed(2)],
      ['Total Revenue', data.revenue.total.toFixed(2)],
      [''],
      ['EXPENSES'],
      ...Object.entries(data.expenses.byCategory).map(([cat, amt]) => [cat, (amt as number).toFixed(2)]),
      ['Total Expenses', data.expenses.total.toFixed(2)],
      [''],
      ['NET PROFIT', data.netProfit.toFixed(2)],
    ];

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename || `profit-loss-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  },

  exportProfitLossToPDF(data: ProfitLossData, filename?: string) {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Profit & Loss Statement', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Period: ${format(data.period.startDate, 'dd MMM yyyy')} - ${format(data.period.endDate, 'dd MMM yyyy')}`, 14, 28);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 34);

    // Revenue section
    autoTable(doc, {
      head: [['Revenue', 'Amount (KES)']],
      body: [
        ['Payments Received', data.revenue.payments.toLocaleString()],
        ['Camp Registrations', data.revenue.campRegistrations.toLocaleString()],
        ['Total Revenue', data.revenue.total.toLocaleString()],
      ],
      startY: 42,
      headStyles: { fillColor: [34, 139, 34] },
    });

    // Expenses section
    const expenseRows = Object.entries(data.expenses.byCategory).map(([cat, amt]) => [cat, (amt as number).toLocaleString()]);
    expenseRows.push(['Total Expenses', data.expenses.total.toLocaleString()]);

    autoTable(doc, {
      head: [['Expenses', 'Amount (KES)']],
      body: expenseRows,
      startY: (doc as any).lastAutoTable.finalY + 10,
      headStyles: { fillColor: [220, 53, 69] },
    });

    // Net profit
    autoTable(doc, {
      head: [['Summary', 'Amount (KES)']],
      body: [['Net Profit', data.netProfit.toLocaleString()]],
      startY: (doc as any).lastAutoTable.finalY + 10,
      headStyles: { fillColor: [0, 123, 255] },
    });

    doc.save(filename || `profit-loss-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },

  exportARAgingToCSV(data: ARAgingSummary, filename?: string) {
    const headers = ['Invoice #', 'Customer', 'Email', 'Total Amount', 'Paid', 'Balance Due', 'Due Date', 'Days Overdue', 'Aging Bucket'];
    const rows = data.items.map(item => [
      item.invoiceNumber,
      item.customerName,
      item.customerEmail,
      item.totalAmount.toFixed(2),
      item.paidAmount.toFixed(2),
      item.balanceDue.toFixed(2),
      item.dueDate,
      item.daysOverdue.toString(),
      item.agingBucket,
    ]);

    // Add summary
    rows.push([]);
    rows.push(['SUMMARY']);
    rows.push(['Current', '', '', '', '', data.current.toFixed(2)]);
    rows.push(['1-30 Days', '', '', '', '', data.days1to30.toFixed(2)]);
    rows.push(['31-60 Days', '', '', '', '', data.days31to60.toFixed(2)]);
    rows.push(['61-90 Days', '', '', '', '', data.days61to90.toFixed(2)]);
    rows.push(['90+ Days', '', '', '', '', data.days90plus.toFixed(2)]);
    rows.push(['Total Outstanding', '', '', '', '', data.total.toFixed(2)]);

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename || `ar-aging-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  },

  exportARAgingToPDF(data: ARAgingSummary, filename?: string) {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text('Accounts Receivable Aging Report', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 28);
    doc.text(`Total Outstanding: KES ${data.total.toLocaleString()}`, 14, 34);

    // Summary
    autoTable(doc, {
      head: [['Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days', 'Total']],
      body: [[
        data.current.toLocaleString(),
        data.days1to30.toLocaleString(),
        data.days31to60.toLocaleString(),
        data.days61to90.toLocaleString(),
        data.days90plus.toLocaleString(),
        data.total.toLocaleString(),
      ]],
      startY: 40,
      headStyles: { fillColor: [255, 193, 7] },
    });

    // Detail table
    autoTable(doc, {
      head: [['Invoice #', 'Customer', 'Total', 'Paid', 'Balance', 'Due Date', 'Overdue', 'Bucket']],
      body: data.items.map(item => [
        item.invoiceNumber,
        item.customerName.substring(0, 20),
        item.totalAmount.toLocaleString(),
        item.paidAmount.toLocaleString(),
        item.balanceDue.toLocaleString(),
        item.dueDate,
        item.daysOverdue.toString(),
        item.agingBucket,
      ]),
      startY: (doc as any).lastAutoTable.finalY + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 53, 69] },
    });

    doc.save(filename || `ar-aging-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },

  exportDailySalesToCSV(data: DailySalesData[], filename?: string) {
    const headers = ['Date', 'Invoices Created', 'Invoice Amount', 'Payments', 'Payment Amount', 'Camp Registrations', 'Camp Revenue', 'Total Revenue'];
    const rows = data.map(day => [
      day.date,
      day.invoicesCreated.toString(),
      day.invoicesAmount.toFixed(2),
      day.paymentsReceived.toString(),
      day.paymentsAmount.toFixed(2),
      day.campRegistrations.toString(),
      day.campRevenue.toFixed(2),
      day.totalRevenue.toFixed(2),
    ]);

    // Add totals
    const totals = data.reduce(
      (acc, day) => ({
        invoicesCreated: acc.invoicesCreated + day.invoicesCreated,
        invoicesAmount: acc.invoicesAmount + day.invoicesAmount,
        paymentsReceived: acc.paymentsReceived + day.paymentsReceived,
        paymentsAmount: acc.paymentsAmount + day.paymentsAmount,
        campRegistrations: acc.campRegistrations + day.campRegistrations,
        campRevenue: acc.campRevenue + day.campRevenue,
        totalRevenue: acc.totalRevenue + day.totalRevenue,
      }),
      { invoicesCreated: 0, invoicesAmount: 0, paymentsReceived: 0, paymentsAmount: 0, campRegistrations: 0, campRevenue: 0, totalRevenue: 0 }
    );

    rows.push([
      'TOTAL',
      totals.invoicesCreated.toString(),
      totals.invoicesAmount.toFixed(2),
      totals.paymentsReceived.toString(),
      totals.paymentsAmount.toFixed(2),
      totals.campRegistrations.toString(),
      totals.campRevenue.toFixed(2),
      totals.totalRevenue.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename || `daily-sales-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  },

  // Generate Activity-level Profit & Loss with both ACTUAL (collected) and
  // POTENTIAL (billed/expected) revenue per activity. Activities are rolled
  // up using the alias-aware matcher so DB values like "mid-term-feb-march"
  // are grouped under "Mid-Term Camp".
  async generateActivityProfitLoss(
    dateRange: DateRange,
    activities?: string[],
  ): Promise<Array<{
    activity: string;
    revenue: number;        // alias for actualRevenue (back-compat)
    actualRevenue: number;
    potentialRevenue: number;
    outstanding: number;
    expenses: number;
    netProfit: number;        // actual - expenses
    potentialNetProfit: number; // potential - expenses
  }>> {
    const { payments, expenses, campRegistrations } = await this.fetchFinancialData(dateRange, activities);

    // Pull pending collections (attended-but-unpaid) for outstanding by activity
    let pendingCollections: Array<{ camp_type: string | null; amount_due: number; amount_paid: number }> = [];
    if (isSupabaseAvailable() && supabase) {
      const { data } = await supabase
        .from('accounts_action_items' as any)
        .select('camp_type, amount_due, amount_paid')
        .eq('status', 'pending');
      pendingCollections = (data || []) as any[];
    }

    // Resolve a raw activity value (e.g. "mid-term-feb-march") to the friendly
    // category label managed by the admin (e.g. "Mid-Term Camp"). Falls back
    // to the raw value if no managed category matches.
    const knownLabels = [...ACTIVITY_CATEGORIES];
    const resolveLabel = (raw?: string | null): string => {
      const v = (raw || '').trim();
      if (!v) return 'Other';
      const hit = knownLabels.find(label => matchesActivity(v, [label]));
      return hit || v;
    };

    const ensure = (
      bucket: Record<string, { actualRevenue: number; potentialRevenue: number; expenses: number; outstanding: number }>,
      key: string,
    ) => {
      if (!bucket[key]) bucket[key] = { actualRevenue: 0, potentialRevenue: 0, expenses: 0, outstanding: 0 };
      return bucket[key];
    };

    const byActivity: Record<string, { actualRevenue: number; potentialRevenue: number; expenses: number; outstanding: number }> = {};

    // Build registration_id -> activity label map from camp registrations
    const regActivityMap: Record<string, string> = {};
    campRegistrations.forEach(reg => {
      regActivityMap[reg.id!] = resolveLabel((reg as any).camp_type);
    });

    // ---- ACTUAL revenue: completed payments in range
    const completedPayments = payments.filter(
      p => p.status === 'completed' &&
        isWithinInterval(parseISO(p.payment_date), { start: dateRange.startDate, end: dateRange.endDate }),
    );
    const paymentLinkedRegIds = new Set<string>();
    completedPayments.forEach(p => {
      let label = 'Other';
      if (p.registration_id && regActivityMap[p.registration_id]) {
        label = regActivityMap[p.registration_id];
        paymentLinkedRegIds.add(p.registration_id);
      } else if (p.program_name) {
        label = resolveLabel(p.program_name);
      }
      ensure(byActivity, label).actualRevenue += Number(p.amount);
    });

    // Add paid camp registrations not yet linked to a payment row (matches Dashboard logic)
    campRegistrations.forEach(r => {
      if ((r as any).payment_status !== 'paid') return;
      if (paymentLinkedRegIds.has(r.id!)) return;
      const created = r.created_at ? parseISO(r.created_at) : null;
      if (!created || !isWithinInterval(created, { start: dateRange.startDate, end: dateRange.endDate })) return;
      const label = regActivityMap[r.id!] || 'Other';
      ensure(byActivity, label).actualRevenue += Number((r as any).total_amount || 0);
    });

    // ---- POTENTIAL revenue: every registration's billed total (created in range)
    campRegistrations.forEach(r => {
      const created = r.created_at ? parseISO(r.created_at) : null;
      if (!created || !isWithinInterval(created, { start: dateRange.startDate, end: dateRange.endDate })) return;
      const label = regActivityMap[r.id!] || 'Other';
      ensure(byActivity, label).potentialRevenue += Number((r as any).total_amount || 0);
    });

    // ---- OUTSTANDING per activity from pending collections (alias-aware)
    pendingCollections.forEach(c => {
      const balance = Number(c.amount_due || 0) - Number(c.amount_paid || 0);
      if (balance <= 0) return;
      // Honor the activity filter if one was applied
      if (activities && activities.length > 0 && !matchesActivity(c.camp_type, activities)) return;
      const label = resolveLabel(c.camp_type);
      ensure(byActivity, label).outstanding += balance;
    });

    // ---- Expenses by category (already filtered upstream by activity)
    expenses
      .filter(e => (e.status === 'approved' || e.status === 'paid') &&
        isWithinInterval(parseISO(e.expense_date), { start: dateRange.startDate, end: dateRange.endDate }))
      .forEach(exp => {
        const label = resolveLabel(exp.category);
        ensure(byActivity, label).expenses += Number(exp.amount);
      });

    // Merge & shape
    const result = Object.entries(byActivity).map(([activity, v]) => ({
      activity,
      revenue: v.actualRevenue, // back-compat
      actualRevenue: v.actualRevenue,
      potentialRevenue: v.potentialRevenue,
      outstanding: v.outstanding,
      expenses: v.expenses,
      netProfit: v.actualRevenue - v.expenses,
      potentialNetProfit: v.potentialRevenue - v.expenses,
    }));

    return result.sort((a, b) => Math.max(b.actualRevenue, b.potentialRevenue) - Math.max(a.actualRevenue, a.potentialRevenue));
  },


  // Generate Potential vs Actual revenue analysis
  // Outstanding now uses accounts_action_items (matches Dashboard "Total Outstanding")
  async generatePotentialVsActual(dateRange: DateRange, activities?: string[]): Promise<{ potentialRevenue: number; actualRevenue: number; outstanding: number; collectionRate: number }> {
    const { payments, campRegistrations } = await this.fetchFinancialData(dateRange, activities);

    // Potential = total_amount of ALL registrations in period
    const potentialRevenue = campRegistrations.reduce((sum, r) => sum + r.total_amount, 0);

    // Actual = from payments table + paid camp registrations not yet in payments (matches Dashboard)
    const campRegIds = new Set(campRegistrations.map(r => r.id));
    const linkedPayments = payments
      .filter(p => p.status === 'completed' && isWithinInterval(parseISO(p.payment_date), { start: dateRange.startDate, end: dateRange.endDate }))
      .filter(p => (p.registration_id && campRegIds.has(p.registration_id)) || p.source === 'camp_registration');
    const paymentLinkedRegIds = new Set(
      linkedPayments.filter(p => p.registration_id).map(p => p.registration_id as string)
    );
    const paymentRevenue = linkedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const paidRegRevenue = campRegistrations
      .filter(r => (r as any).payment_status === 'paid' && !paymentLinkedRegIds.has(r.id!))
      .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);
    const actualRevenue = paymentRevenue + paidRegRevenue;

    // Outstanding = attended-but-unpaid from accounts_action_items (Dashboard source of truth)
    let outstanding = 0;
    if (isSupabaseAvailable() && supabase) {
      const { data: collections } = await supabase
        .from('accounts_action_items' as any)
        .select('amount_due, amount_paid')
        .eq('status', 'pending');
      outstanding = ((collections || []) as any[]).reduce(
        (sum: number, c: any) => sum + (Number(c.amount_due || 0) - Number(c.amount_paid || 0)),
        0
      );
    }

    const collectionRate = potentialRevenue > 0 ? (actualRevenue / potentialRevenue) * 100 : 0;

    return { potentialRevenue, actualRevenue, outstanding, collectionRate };
  },

  // Generate Revenue Report — detailed breakdown of all revenue sources
  async generateRevenueReport(dateRange: DateRange, activities?: string[]): Promise<RevenueReportData> {
    const { payments, campRegistrations } = await this.fetchFinancialData(dateRange, activities);

    const inRange = (d: Date) => isWithinInterval(d, { start: dateRange.startDate, end: dateRange.endDate });

    // Filter completed payments in range
    const completedPayments = payments.filter(
      p => p.status === 'completed' && inRange(parseISO(p.payment_date))
    );

    const campRegIds = new Set(campRegistrations.map(r => r.id));
    const paymentLinkedRegIds = new Set(
      completedPayments.filter(p => p.registration_id && campRegIds.has(p.registration_id))
        .map(p => p.registration_id as string)
    );

    // Paid registrations not represented in payments
    const paidRegs = campRegistrations.filter(
      r => (r as any).payment_status === 'paid'
        && !paymentLinkedRegIds.has(r.id!)
        && r.created_at && inRange(parseISO(r.created_at))
    );

    // Source totals
    const campPaymentRevenue = completedPayments
      .filter(p => (p.registration_id && campRegIds.has(p.registration_id)) || p.source === 'camp_registration')
      .reduce((s, p) => s + Number(p.amount), 0);
    const otherPaymentRevenue = completedPayments
      .filter(p => !((p.registration_id && campRegIds.has(p.registration_id)) || p.source === 'camp_registration'))
      .reduce((s, p) => s + Number(p.amount), 0);
    const paidRegRevenue = paidRegs.reduce((s, r) => s + Number(r.total_amount || 0), 0);

    const campRegistrationsRevenue = campPaymentRevenue + paidRegRevenue;
    const paymentsRevenue = otherPaymentRevenue;
    const totalRevenue = campRegistrationsRevenue + paymentsRevenue;

    // By source
    const bySource = [
      { source: 'Camp Registration Payments', amount: campPaymentRevenue, count: completedPayments.filter(p => (p.registration_id && campRegIds.has(p.registration_id)) || p.source === 'camp_registration').length },
      { source: 'Direct Paid Registrations', amount: paidRegRevenue, count: paidRegs.length },
      { source: 'Other Payments', amount: otherPaymentRevenue, count: completedPayments.filter(p => !((p.registration_id && campRegIds.has(p.registration_id)) || p.source === 'camp_registration')).length },
    ].filter(s => s.amount > 0);

    // By activity (camp_type)
    const byActivityMap: Record<string, { amount: number; count: number }> = {};
    const regActivityMap: Record<string, string> = {};
    campRegistrations.forEach(r => {
      regActivityMap[r.id!] = (r as any).camp_type || 'Other';
    });
    completedPayments.forEach(p => {
      let act = 'Other';
      if (p.registration_id && regActivityMap[p.registration_id]) act = regActivityMap[p.registration_id];
      else if (p.program_name) act = p.program_name;
      if (!byActivityMap[act]) byActivityMap[act] = { amount: 0, count: 0 };
      byActivityMap[act].amount += Number(p.amount);
      byActivityMap[act].count += 1;
    });
    paidRegs.forEach(r => {
      const act = (r as any).camp_type || 'Other';
      if (!byActivityMap[act]) byActivityMap[act] = { amount: 0, count: 0 };
      byActivityMap[act].amount += Number(r.total_amount || 0);
      byActivityMap[act].count += 1;
    });
    const byActivity = Object.entries(byActivityMap)
      .map(([activity, v]) => ({ activity, ...v }))
      .sort((a, b) => b.amount - a.amount);

    // By payment method
    const byMethodMap: Record<string, { amount: number; count: number }> = {};
    completedPayments.forEach(p => {
      const m = (p as any).payment_method || 'Unknown';
      if (!byMethodMap[m]) byMethodMap[m] = { amount: 0, count: 0 };
      byMethodMap[m].amount += Number(p.amount);
      byMethodMap[m].count += 1;
    });
    if (paidRegs.length > 0) {
      byMethodMap['Direct (Registration)'] = {
        amount: paidRegRevenue,
        count: paidRegs.length,
      };
    }
    const byMethod = Object.entries(byMethodMap)
      .map(([method, v]) => ({ method, ...v }))
      .sort((a, b) => b.amount - a.amount);

    // Trend (daily)
    const trendMap: Record<string, number> = {};
    let cursor = new Date(dateRange.startDate);
    while (cursor <= dateRange.endDate) {
      trendMap[format(cursor, 'yyyy-MM-dd')] = 0;
      cursor = new Date(cursor.getTime() + 86400000);
    }
    completedPayments.forEach(p => {
      const k = format(parseISO(p.payment_date), 'yyyy-MM-dd');
      if (k in trendMap) trendMap[k] += Number(p.amount);
    });
    paidRegs.forEach(r => {
      const k = format(parseISO(r.created_at!), 'yyyy-MM-dd');
      if (k in trendMap) trendMap[k] += Number(r.total_amount || 0);
    });
    const trend = Object.entries(trendMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRevenue,
      paymentsRevenue,
      campRegistrationsRevenue,
      bySource,
      byActivity,
      byMethod,
      trend,
      period: dateRange,
    };
  },

  // Generate Expense Report — detailed breakdown of all expenses
  async generateExpenseReport(dateRange: DateRange, activities?: string[]): Promise<ExpenseReportData> {
    const { expenses } = await this.fetchFinancialData(dateRange, activities);
    const inRange = (d: Date) => isWithinInterval(d, { start: dateRange.startDate, end: dateRange.endDate });

    const filtered = expenses.filter(e => inRange(parseISO(e.expense_date)));
    const totalExpenses = filtered
      .filter(e => e.status === 'approved' || e.status === 'paid')
      .reduce((s, e) => s + Number(e.amount), 0);

    // By category (only approved/paid count toward totals)
    const byCategoryMap: Record<string, { amount: number; count: number }> = {};
    filtered
      .filter(e => e.status === 'approved' || e.status === 'paid')
      .forEach(e => {
        const c = e.category || 'Uncategorized';
        if (!byCategoryMap[c]) byCategoryMap[c] = { amount: 0, count: 0 };
        byCategoryMap[c].amount += Number(e.amount);
        byCategoryMap[c].count += 1;
      });
    const byCategory = Object.entries(byCategoryMap)
      .map(([category, v]) => ({
        category,
        ...v,
        percentage: totalExpenses > 0 ? (v.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // By status (all statuses)
    const byStatusMap: Record<string, { amount: number; count: number }> = {};
    filtered.forEach(e => {
      const s = e.status || 'pending';
      if (!byStatusMap[s]) byStatusMap[s] = { amount: 0, count: 0 };
      byStatusMap[s].amount += Number(e.amount);
      byStatusMap[s].count += 1;
    });
    const byStatus = Object.entries(byStatusMap)
      .map(([status, v]) => ({ status, ...v }))
      .sort((a, b) => b.amount - a.amount);

    // By vendor
    const byVendorMap: Record<string, { amount: number; count: number }> = {};
    filtered
      .filter(e => e.status === 'approved' || e.status === 'paid')
      .forEach(e => {
        const v = (e as any).vendor || (e as any).vendor_name || 'Direct';
        if (!byVendorMap[v]) byVendorMap[v] = { amount: 0, count: 0 };
        byVendorMap[v].amount += Number(e.amount);
        byVendorMap[v].count += 1;
      });
    const byVendor = Object.entries(byVendorMap)
      .map(([vendor, v]) => ({ vendor, ...v }))
      .sort((a, b) => b.amount - a.amount);

    // Trend (daily)
    const trendMap: Record<string, number> = {};
    let cursor = new Date(dateRange.startDate);
    while (cursor <= dateRange.endDate) {
      trendMap[format(cursor, 'yyyy-MM-dd')] = 0;
      cursor = new Date(cursor.getTime() + 86400000);
    }
    filtered
      .filter(e => e.status === 'approved' || e.status === 'paid')
      .forEach(e => {
        const k = format(parseISO(e.expense_date), 'yyyy-MM-dd');
        if (k in trendMap) trendMap[k] += Number(e.amount);
      });
    const trend = Object.entries(trendMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top 10 expenses
    const topExpenses = filtered
      .filter(e => e.status === 'approved' || e.status === 'paid')
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 10)
      .map(e => ({
        description: e.description || 'Expense',
        category: e.category || 'Uncategorized',
        amount: Number(e.amount),
        date: e.expense_date,
      }));

    return {
      totalExpenses,
      byCategory,
      byStatus,
      byVendor,
      trend,
      topExpenses,
      period: dateRange,
    };
  },

  exportRevenueReportToCSV(data: RevenueReportData, filename?: string) {
    const rows: (string | number)[][] = [
      ['Revenue Report'],
      [`Period: ${format(data.period.startDate, 'dd MMM yyyy')} - ${format(data.period.endDate, 'dd MMM yyyy')}`],
      [''],
      ['SUMMARY'],
      ['Total Revenue', data.totalRevenue.toFixed(2)],
      ['Camp Registrations Revenue', data.campRegistrationsRevenue.toFixed(2)],
      ['Other Payments Revenue', data.paymentsRevenue.toFixed(2)],
      [''],
      ['BY SOURCE'],
      ['Source', 'Amount', 'Count'],
      ...data.bySource.map(s => [s.source, s.amount.toFixed(2), s.count]),
      [''],
      ['BY ACTIVITY'],
      ['Activity', 'Amount', 'Count'],
      ...data.byActivity.map(a => [a.activity, a.amount.toFixed(2), a.count]),
      [''],
      ['BY PAYMENT METHOD'],
      ['Method', 'Amount', 'Count'],
      ...data.byMethod.map(m => [m.method, m.amount.toFixed(2), m.count]),
    ];
    const csvContent = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename || `revenue-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  },

  exportRevenueReportToPDF(data: RevenueReportData, filename?: string) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Revenue Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Period: ${format(data.period.startDate, 'dd MMM yyyy')} - ${format(data.period.endDate, 'dd MMM yyyy')}`, 14, 28);
    doc.text(`Total Revenue: KES ${data.totalRevenue.toLocaleString()}`, 14, 34);

    autoTable(doc, {
      head: [['Source', 'Amount (KES)', 'Count']],
      body: data.bySource.map(s => [s.source, s.amount.toLocaleString(), s.count.toString()]),
      startY: 42,
      headStyles: { fillColor: [34, 139, 34] },
    });
    autoTable(doc, {
      head: [['Activity', 'Amount (KES)', 'Count']],
      body: data.byActivity.map(a => [a.activity, a.amount.toLocaleString(), a.count.toString()]),
      startY: (doc as any).lastAutoTable.finalY + 8,
      headStyles: { fillColor: [0, 123, 255] },
    });
    autoTable(doc, {
      head: [['Payment Method', 'Amount (KES)', 'Count']],
      body: data.byMethod.map(m => [m.method, m.amount.toLocaleString(), m.count.toString()]),
      startY: (doc as any).lastAutoTable.finalY + 8,
      headStyles: { fillColor: [255, 152, 0] },
    });
    doc.save(filename || `revenue-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },

  exportExpenseReportToCSV(data: ExpenseReportData, filename?: string) {
    const rows: (string | number)[][] = [
      ['Expense Report'],
      [`Period: ${format(data.period.startDate, 'dd MMM yyyy')} - ${format(data.period.endDate, 'dd MMM yyyy')}`],
      [''],
      ['Total Expenses', data.totalExpenses.toFixed(2)],
      [''],
      ['BY CATEGORY'],
      ['Category', 'Amount', 'Count', '% of Total'],
      ...data.byCategory.map(c => [c.category, c.amount.toFixed(2), c.count, c.percentage.toFixed(1) + '%']),
      [''],
      ['BY STATUS'],
      ['Status', 'Amount', 'Count'],
      ...data.byStatus.map(s => [s.status, s.amount.toFixed(2), s.count]),
      [''],
      ['BY VENDOR'],
      ['Vendor', 'Amount', 'Count'],
      ...data.byVendor.map(v => [v.vendor, v.amount.toFixed(2), v.count]),
      [''],
      ['TOP EXPENSES'],
      ['Date', 'Description', 'Category', 'Amount'],
      ...data.topExpenses.map(e => [e.date, e.description, e.category, e.amount.toFixed(2)]),
    ];
    const csvContent = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename || `expense-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  },

  exportExpenseReportToPDF(data: ExpenseReportData, filename?: string) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Expense Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Period: ${format(data.period.startDate, 'dd MMM yyyy')} - ${format(data.period.endDate, 'dd MMM yyyy')}`, 14, 28);
    doc.text(`Total Expenses: KES ${data.totalExpenses.toLocaleString()}`, 14, 34);

    autoTable(doc, {
      head: [['Category', 'Amount (KES)', 'Count', '%']],
      body: data.byCategory.map(c => [c.category, c.amount.toLocaleString(), c.count.toString(), c.percentage.toFixed(1) + '%']),
      startY: 42,
      headStyles: { fillColor: [220, 53, 69] },
    });
    autoTable(doc, {
      head: [['Status', 'Amount (KES)', 'Count']],
      body: data.byStatus.map(s => [s.status, s.amount.toLocaleString(), s.count.toString()]),
      startY: (doc as any).lastAutoTable.finalY + 8,
      headStyles: { fillColor: [108, 117, 125] },
    });
    autoTable(doc, {
      head: [['Vendor', 'Amount (KES)', 'Count']],
      body: data.byVendor.map(v => [v.vendor, v.amount.toLocaleString(), v.count.toString()]),
      startY: (doc as any).lastAutoTable.finalY + 8,
      headStyles: { fillColor: [0, 123, 255] },
    });
    doc.save(filename || `expense-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },

  exportDailySalesToPDF(data: DailySalesData[], filename?: string) {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text('Daily Sales Summary', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 28);

    autoTable(doc, {
      head: [['Date', 'Invoices', 'Inv. Amt', 'Payments', 'Pmt Amt', 'Camp Regs', 'Camp Rev', 'Total Rev']],
      body: data.map(day => [
        day.date,
        day.invoicesCreated.toString(),
        day.invoicesAmount.toLocaleString(),
        day.paymentsReceived.toString(),
        day.paymentsAmount.toLocaleString(),
        day.campRegistrations.toString(),
        day.campRevenue.toLocaleString(),
        day.totalRevenue.toLocaleString(),
      ]),
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 139, 34] },
    });

    doc.save(filename || `daily-sales-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },
};
