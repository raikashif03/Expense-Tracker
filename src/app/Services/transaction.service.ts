import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TransactionItem {
  id: string;
  selected: boolean;
  name: string;
  category: string;
  date: string;
  method: string;
  amount: number;
  status: 'Completed' | 'Pending';
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  transactionsCount: number;
  spentAmount: number;
  type: 'spent' | 'earned';
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  period: string;
  allocated: number;
  icon: string;
  iconTheme: 'blue' | 'yellow' | 'red';
}

export interface ChartPoint {
  label: string;
  subLabel?: string;
  value: number;
  x?: number;
  y?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly TX_KEY = 'fintrack_tx_v11';
  private readonly CAT_KEY = 'fintrack_cat_v11';
  private readonly BUD_KEY = 'fintrack_bud_v11';
  private readonly SETTINGS_KEY = 'fintrack_user_settings_v1';

  private isModalOpenSubject = new BehaviorSubject<boolean>(false);
  isModalOpen$ = this.isModalOpenSubject.asObservable();

  private defaultCategories: CategoryItem[] = [
    { id: 'cat-1', name: 'Food & Dining', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'restaurant', iconBg: '#ede9fe', iconColor: '#6366f1' },
    { id: 'cat-2', name: 'Transport', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'directions_car', iconBg: '#ffe4e6', iconColor: '#e11d48' },
    { id: 'cat-3', name: 'Shopping', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'shopping_bag', iconBg: '#dcfce7', iconColor: '#059669' },
    { id: 'cat-4', name: 'Bills & Utilities', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'receipt_long', iconBg: '#fef3c7', iconColor: '#d97706' },
    { id: 'cat-5', name: 'Entertainment', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'movie', iconBg: '#fee2e2', iconColor: '#ef4444' },
    { id: 'cat-6', name: 'Health & Wellness', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'favorite', iconBg: '#fce7f3', iconColor: '#ec4899' },
    { id: 'cat-7', name: 'Education', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'school', iconBg: '#e0e7ff', iconColor: '#4f46e5' },
    { id: 'cat-8', name: 'Travel', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'flight', iconBg: '#e0f2fe', iconColor: '#0284c7' },
    { id: 'cat-9', name: 'Income', transactionsCount: 0, spentAmount: 0, type: 'earned', icon: 'payments', iconBg: '#dcfce7', iconColor: '#10b981' }
  ];

  private defaultTransactions: TransactionItem[] = [
    { id: 'tx-1', selected: false, name: 'Tech Store - Wireless Headphones', category: 'Shopping', date: '2026-10-23', method: 'Credit Card', amount: -149.00, status: 'Completed', icon: 'shopping_bag', iconBg: '#dcfce7', iconColor: '#059669' },
    { id: 'tx-2', selected: false, name: 'Whole Foods Market', category: 'Food & Dining', date: '2026-10-22', method: 'Debit Card', amount: -86.50, status: 'Completed', icon: 'restaurant', iconBg: '#ede9fe', iconColor: '#6366f1' },
    { id: 'tx-3', selected: false, name: 'Monthly Salary - Acme Corp', category: 'Income', date: '2026-10-20', method: 'Direct Deposit', amount: 4850.00, status: 'Completed', icon: 'payments', iconBg: '#dcfce7', iconColor: '#10b981' },
    { id: 'tx-4', selected: false, name: 'Shell Gas Station', category: 'Transport', date: '2026-10-18', method: 'Credit Card', amount: -58.00, status: 'Completed', icon: 'directions_car', iconBg: '#ffe4e6', iconColor: '#e11d48' },
    { id: 'tx-5', selected: false, name: 'Netflix & Spotify Subs', category: 'Entertainment', date: '2026-10-16', method: 'Debit Card', amount: -28.98, status: 'Completed', icon: 'movie', iconBg: '#fee2e2', iconColor: '#ef4444' },
    { id: 'tx-6', selected: false, name: 'City Power & Electric', category: 'Bills & Utilities', date: '2026-10-14', method: 'Bank Transfer', amount: -142.30, status: 'Completed', icon: 'receipt_long', iconBg: '#fef3c7', iconColor: '#d97706' },
    { id: 'tx-7', selected: false, name: 'Bistro Bella Dinner', category: 'Food & Dining', date: '2026-10-11', method: 'Credit Card', amount: -74.20, status: 'Completed', icon: 'restaurant', iconBg: '#ede9fe', iconColor: '#6366f1' },
    { id: 'tx-8', selected: false, name: 'Pharmacy Essentials', category: 'Health & Wellness', date: '2026-10-08', method: 'Debit Card', amount: -45.00, status: 'Completed', icon: 'favorite', iconBg: '#fce7f3', iconColor: '#ec4899' },
    { id: 'tx-9', selected: false, name: 'Freelance UI Design', category: 'Income', date: '2026-10-05', method: 'Stripe Transfer', amount: 1200.00, status: 'Completed', icon: 'payments', iconBg: '#dcfce7', iconColor: '#10b981' },
    { id: 'tx-10', selected: false, name: 'Subway & Train Pass', category: 'Transport', date: '2026-10-02', method: 'Apple Pay', amount: -65.00, status: 'Completed', icon: 'directions_car', iconBg: '#ffe4e6', iconColor: '#e11d48' },
    // September
    { id: 'tx-11', selected: false, name: 'September Salary', category: 'Income', date: '2026-09-20', method: 'Direct Deposit', amount: 4850.00, status: 'Completed', icon: 'payments', iconBg: '#dcfce7', iconColor: '#10b981' },
    { id: 'tx-12', selected: false, name: 'Groceries & Dining', category: 'Food & Dining', date: '2026-09-18', method: 'Credit Card', amount: -320.00, status: 'Completed', icon: 'restaurant', iconBg: '#ede9fe', iconColor: '#6366f1' },
    { id: 'tx-13', selected: false, name: 'Home Utilities', category: 'Bills & Utilities', date: '2026-09-14', method: 'Bank Transfer', amount: -195.00, status: 'Completed', icon: 'receipt_long', iconBg: '#fef3c7', iconColor: '#d97706' },
    { id: 'tx-14', selected: false, name: 'Autumn Wardrobe', category: 'Shopping', date: '2026-09-08', method: 'Credit Card', amount: -210.00, status: 'Completed', icon: 'shopping_bag', iconBg: '#dcfce7', iconColor: '#059669' },
    // August
    { id: 'tx-15', selected: false, name: 'August Salary', category: 'Income', date: '2026-08-20', method: 'Direct Deposit', amount: 4850.00, status: 'Completed', icon: 'payments', iconBg: '#dcfce7', iconColor: '#10b981' },
    { id: 'tx-16', selected: false, name: 'Summer Getaway Flight', category: 'Travel', date: '2026-08-15', method: 'Credit Card', amount: -420.00, status: 'Completed', icon: 'flight', iconBg: '#e0f2fe', iconColor: '#0284c7' },
    { id: 'tx-17', selected: false, name: 'Dining & Outings', category: 'Food & Dining', date: '2026-08-12', method: 'Debit Card', amount: -280.00, status: 'Completed', icon: 'restaurant', iconBg: '#ede9fe', iconColor: '#6366f1' },
    // July
    { id: 'tx-18', selected: false, name: 'July Salary', category: 'Income', date: '2026-07-20', method: 'Direct Deposit', amount: 4850.00, status: 'Completed', icon: 'payments', iconBg: '#dcfce7', iconColor: '#10b981' },
    { id: 'tx-19', selected: false, name: 'Living Expenses', category: 'Bills & Utilities', date: '2026-07-15', method: 'Bank Transfer', amount: -380.00, status: 'Completed', icon: 'receipt_long', iconBg: '#fef3c7', iconColor: '#d97706' },
    // June
    { id: 'tx-20', selected: false, name: 'June Salary', category: 'Income', date: '2026-06-20', method: 'Direct Deposit', amount: 4850.00, status: 'Completed', icon: 'payments', iconBg: '#dcfce7', iconColor: '#10b981' },
    { id: 'tx-21', selected: false, name: 'Office Setup Tech', category: 'Shopping', date: '2026-06-11', method: 'Credit Card', amount: -450.00, status: 'Completed', icon: 'shopping_bag', iconBg: '#dcfce7', iconColor: '#059669' },
    // May
    { id: 'tx-22', selected: false, name: 'May Salary', category: 'Income', date: '2026-05-20', method: 'Direct Deposit', amount: 4850.00, status: 'Completed', icon: 'payments', iconBg: '#dcfce7', iconColor: '#10b981' },
    { id: 'tx-23', selected: false, name: 'Spring Conference', category: 'Education', date: '2026-05-14', method: 'Credit Card', amount: -290.00, status: 'Completed', icon: 'school', iconBg: '#e0e7ff', iconColor: '#4f46e5' }
  ];

  private defaultBudgets: BudgetItem[] = [
    { id: 'bud-1', category: 'Food & Dining', period: 'MONTHLY', allocated: 400, icon: 'restaurant', iconTheme: 'blue' },
    { id: 'bud-2', category: 'Shopping', period: 'MONTHLY', allocated: 300, icon: 'shopping_bag', iconTheme: 'blue' },
    { id: 'bud-3', category: 'Transport', period: 'MONTHLY', allocated: 150, icon: 'directions_car', iconTheme: 'yellow' },
    { id: 'bud-4', category: 'Bills & Utilities', period: 'MONTHLY', allocated: 250, icon: 'receipt_long', iconTheme: 'red' }
  ];

  private transactionsSubject = new BehaviorSubject<TransactionItem[]>(
    this.loadStorage(this.TX_KEY, this.defaultTransactions)
  );
  transactions$ = this.transactionsSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<CategoryItem[]>(
    this.loadStorage(this.CAT_KEY, this.defaultCategories)
  );
  categories$ = this.categoriesSubject.asObservable();

  private budgetsSubject = new BehaviorSubject<BudgetItem[]>(
    this.loadStorage(this.BUD_KEY, this.defaultBudgets)
  );
  budgets$ = this.budgetsSubject.asObservable();

  private currencySubject = new BehaviorSubject<string>(this.getInitialCurrency());
  currency$ = this.currencySubject.asObservable();

  private dateFormatSubject = new BehaviorSubject<string>(this.getInitialDateFormat());
  dateFormat$ = this.dateFormatSubject.asObservable();

  constructor() {
    this.syncCategoryTotals();
  }

  private loadStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as T;
        }
      }
      return fallback;
    } catch {
      return fallback;
    }
  }

  private saveStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  }

  private getInitialCurrency(): string {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const curr = parsed.preferences?.currency || '';
        if (curr.includes('$')) return '$';
        if (curr.includes('£')) return '£';
        if (curr.includes('€')) return '€';
      }
    } catch {}
    return '€';
  }

  private getInitialDateFormat(): string {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const fmt = parsed.preferences?.dateFormat;
        if (fmt === 'MM/DD/YYYY') return 'MM/dd/yyyy';
        if (fmt === 'DD/MM/YYYY') return 'dd/MM/yyyy';
        if (fmt === 'YYYY-MM-DD') return 'yyyy-MM-dd';
      }
    } catch {}
    return 'MMM dd, yyyy';
  }

  setCurrency(currencyStr: string): void {
    let symbol = '€';
    if (currencyStr.includes('$')) symbol = '$';
    else if (currencyStr.includes('£')) symbol = '£';
    else if (currencyStr.includes('€')) symbol = '€';
    this.currencySubject.next(symbol);
  }

  setDateFormat(format: string): void {
    let mapped = 'MMM dd, yyyy';
    if (format === 'MM/DD/YYYY') mapped = 'MM/dd/yyyy';
    else if (format === 'DD/MM/YYYY') mapped = 'dd/MM/yyyy';
    else if (format === 'YYYY-MM-DD') mapped = 'yyyy-MM-dd';
    this.dateFormatSubject.next(mapped);
  }

  openModal(): void {
    this.isModalOpenSubject.next(true);
  }

  closeModal(): void {
    this.isModalOpenSubject.next(false);
  }

  getTransactions(): TransactionItem[] {
    return this.transactionsSubject.getValue();
  }

  addTransaction(tx: Omit<TransactionItem, 'id' | 'selected' | 'status'>): void {
    const newTx: TransactionItem = {
      ...tx,
      id: `tx-${Date.now()}`,
      selected: false,
      status: 'Completed'
    };
    const updated = [newTx, ...this.transactionsSubject.getValue()];
    this.transactionsSubject.next(updated);
    this.saveStorage(this.TX_KEY, updated);
    this.syncCategoryTotals();
  }

  deleteTransaction(id: string): void {
    const updated = this.transactionsSubject.getValue().filter(t => t.id !== id);
    this.transactionsSubject.next(updated);
    this.saveStorage(this.TX_KEY, updated);
    this.syncCategoryTotals();
  }

  deleteTransactions(ids: string[]): void {
    const idSet = new Set(ids);
    const updated = this.transactionsSubject.getValue().filter(t => !idSet.has(t.id));
    this.transactionsSubject.next(updated);
    this.saveStorage(this.TX_KEY, updated);
    this.syncCategoryTotals();
  }

  saveCategory(item: CategoryItem): void {
    const current = this.categoriesSubject.getValue();
    const index = current.findIndex(c => c.id === item.id);
    const updated = index > -1
      ? current.map((c, i) => (i === index ? item : c))
      : [...current, item];
    this.categoriesSubject.next(updated);
    this.saveStorage(this.CAT_KEY, updated);
    this.syncCategoryTotals();
  }

  deleteCategory(id: string): void {
    const cat = this.categoriesSubject.getValue().find(c => c.id === id);
    const updated = this.categoriesSubject.getValue().filter(c => c.id !== id);
    this.categoriesSubject.next(updated);
    this.saveStorage(this.CAT_KEY, updated);

    if (cat) {
      const txs = this.transactionsSubject.getValue().map(t => {
        if (this.normalizeCategory(t.category) === this.normalizeCategory(cat.name)) {
          return { ...t, category: 'Other' };
        }
        return t;
      });
      this.transactionsSubject.next(txs);
      this.saveStorage(this.TX_KEY, txs);
    }
  }

  saveBudget(budget: BudgetItem): void {
    const current = this.budgetsSubject.getValue();
    const existingIndex = current.findIndex(b => 
      b.id === budget.id || 
      this.normalizeCategory(b.category) === this.normalizeCategory(budget.category)
    );

    let updated: BudgetItem[];
    if (existingIndex > -1) {
      updated = current.map((b, i) => 
        i === existingIndex 
          ? { ...budget, id: b.id, category: budget.category } 
          : b
      );
    } else {
      updated = [...current, budget];
    }

    this.budgetsSubject.next(updated);
    this.saveStorage(this.BUD_KEY, updated);
  }

  deleteBudget(id: string): void {
    const updated = this.budgetsSubject.getValue().filter(b => b.id !== id);
    this.budgetsSubject.next(updated);
    this.saveStorage(this.BUD_KEY, updated);
  }

  normalizeCategory(cat: string): string {
    const lower = (cat || '').toLowerCase().trim();
    if (lower.includes('transport')) return 'transport';
    if (lower.includes('food') || lower.includes('dining')) return 'food & dining';
    if (lower.includes('income') || lower.includes('salary')) return 'income';
    if (lower.includes('shop')) return 'shopping';
    if (lower.includes('bill') || lower.includes('util')) return 'bills & utilities';
    if (lower.includes('entertain') || lower.includes('movie')) return 'entertainment';
    if (lower.includes('health') || lower.includes('well')) return 'health & wellness';
    if (lower.includes('edu') || lower.includes('school')) return 'education';
    if (lower.includes('travel') || lower.includes('flight')) return 'travel';
    return lower;
  }

  syncCategoryTotals(): void {
    const txs = this.transactionsSubject.getValue();
    const cats = this.categoriesSubject.getValue().map(cat => {
      const normCatName = this.normalizeCategory(cat.name);
      const matchingTxs = txs.filter(t => this.normalizeCategory(t.category) === normCatName);
      
      const sum = matchingTxs.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);
      return {
        ...cat,
        transactionsCount: matchingTxs.length,
        spentAmount: sum
      };
    });
    this.categoriesSubject.next(cats);
    this.saveStorage(this.CAT_KEY, cats);
  }

  getTotalIncome(month?: number, year?: number): number {
    return this.transactionsSubject.getValue()
      .filter(t => {
        if (t.amount <= 0) return false;
        if (month !== undefined && year !== undefined) {
          const d = new Date(t.date);
          return d.getMonth() === month && d.getFullYear() === year;
        }
        return true;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpense(month?: number, year?: number): number {
    return this.transactionsSubject.getValue()
      .filter(t => {
        if (t.amount >= 0) return false;
        if (month !== undefined && year !== undefined) {
          const d = new Date(t.date);
          return d.getMonth() === month && d.getFullYear() === year;
        }
        return true;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  getSavingsRate(month?: number, year?: number): number {
    const income = this.getTotalIncome(month, year);
    if (income <= 0) return 0;
    const expense = this.getTotalExpense(month, year);
    const rate = ((income - expense) / income) * 100;
    return Math.max(0, Math.round(rate * 10) / 10);
  }

  getCategoryBreakdown(month?: number, year?: number): { name: string; amount: number; percentage: number; color: string }[] {
    const expenses = this.transactionsSubject.getValue().filter(t => {
      if (t.amount >= 0) return false;
      if (month !== undefined && year !== undefined) {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      }
      return true;
    });

    const totalExp = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const grouped = new Map<string, number>();

    expenses.forEach(t => {
      const catName = t.category || 'Other';
      grouped.set(catName, (grouped.get(catName) || 0) + Math.abs(t.amount));
    });

    const palette = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];
    let idx = 0;

    return Array.from(grouped.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0,
        color: palette[idx++ % palette.length]
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  getLargestExpense(month?: number, year?: number): { name: string; amount: number; percentage: number } {
    const expenses = this.transactionsSubject.getValue().filter(t => {
      if (t.amount >= 0) return false;
      if (month !== undefined && year !== undefined) {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      }
      return true;
    });

    if (expenses.length === 0) return { name: 'None', amount: 0, percentage: 0 };

    const totalSpent = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const maxItem = expenses.reduce((prev, curr) => 
      Math.abs(curr.amount) > Math.abs(prev.amount) ? curr : prev
    );

    const amount = Math.abs(maxItem.amount);
    const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;

    return {
      name: maxItem.category || maxItem.name,
      amount,
      percentage
    };
  }

  // --- Real Analytical Series for Charts ---

  /**
   * Weekly spending for a specific month (W1: Days 1-7, W2: Days 8-14, W3: Days 15-21, W4: Days 22-end)
   */
  getWeeklySpendingForMonth(year: number, month: number): { week: string; amount: number; label: string }[] {
    const txs = this.transactionsSubject.getValue().filter(t => {
      if (t.amount >= 0) return false;
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const w1 = txs.filter(t => { const day = new Date(t.date).getDate(); return day >= 1 && day <= 7; })
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const w2 = txs.filter(t => { const day = new Date(t.date).getDate(); return day >= 8 && day <= 14; })
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const w3 = txs.filter(t => { const day = new Date(t.date).getDate(); return day >= 15 && day <= 21; })
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const w4 = txs.filter(t => { const day = new Date(t.date).getDate(); return day >= 22; })
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    return [
      { week: 'W1', amount: w1, label: 'Days 1-7' },
      { week: 'W2', amount: w2, label: 'Days 8-14' },
      { week: 'W3', amount: w3, label: 'Days 15-21' },
      { week: 'W4', amount: w4, label: 'Days 22+' }
    ];
  }

  /**
   * Returns weekly spending data for a month, falling back to the latest month with activity if 0
   */
  getWeeklySpending(year?: number, month?: number): { week: string; amount: number; label: string }[] {
    const curYear = year !== undefined ? year : new Date().getFullYear();
    const curMonth = month !== undefined ? month : new Date().getMonth();
    const currentMonthData = this.getWeeklySpendingForMonth(curYear, curMonth);

    if (currentMonthData.some(w => w.amount > 0)) {
      return currentMonthData;
    }

    const allTxs = this.transactionsSubject.getValue().filter(t => t.amount < 0);
    if (allTxs.length > 0) {
      const dates = allTxs.map(t => new Date(t.date).getTime()).filter(t => !isNaN(t));
      if (dates.length > 0) {
        const latestDate = new Date(Math.max(...dates));
        const fallbackData = this.getWeeklySpendingForMonth(latestDate.getFullYear(), latestDate.getMonth());
        if (fallbackData.some(w => w.amount > 0)) {
          return fallbackData;
        }
      }
    }

    return currentMonthData;
  }

  /**
   * Returns latest active date with transactions, or today
   */
  getLatestActiveDate(): Date {
    const allTxs = this.transactionsSubject.getValue();
    if (allTxs.length === 0) return new Date();
    const dates = allTxs.map(t => new Date(t.date).getTime()).filter(t => !isNaN(t));
    if (dates.length === 0) return new Date();
    return new Date(Math.max(...dates));
  }

  /**
   * Daily spending series for the last N days (default 7 days)
   */
  getDailySpendingSeries(daysCount = 7): { date: string; label: string; amount: number }[] {
    const txs = this.transactionsSubject.getValue().filter(t => t.amount < 0);
    const result: { date: string; label: string; amount: number }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateKey = `${yyyy}-${mm}-${dd}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayTotal = txs
        .filter(t => t.date === dateKey)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      result.push({
        date: dateKey,
        label: dayName,
        amount: dayTotal
      });
    }

    return result;
  }

  /**
   * Weekly spending series for the last N weeks (default 8 weeks)
   */
  getWeeklySpendingSeries(weeksCount = 8): { week: string; label: string; amount: number }[] {
    const txs = this.transactionsSubject.getValue().filter(t => t.amount < 0);
    const result: { week: string; label: string; amount: number }[] = [];
    const now = new Date();

    for (let i = weeksCount - 1; i >= 0; i--) {
      const endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
      const startDay = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate() - 6);

      const weekTotal = txs.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= startDay && txDate <= endDay;
      }).reduce((sum, t) => sum + Math.abs(t.amount), 0);

      result.push({
        week: `W${weeksCount - i}`,
        label: `${startDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        amount: weekTotal
      });
    }

    return result;
  }

  /**
   * Monthly Cash Flow series for the last N months (default 6 months)
   */
  getMonthlyCashFlowSeries(monthsCount = 6): { month: string; year: number; income: number; expense: number }[] {
    const txs = this.transactionsSubject.getValue();
    const result: { month: string; year: number; income: number; expense: number }[] = [];
    const now = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const targetMonth = d.getMonth();
      const targetYear = d.getFullYear();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      const monthTxs = txs.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === targetMonth && txDate.getFullYear() === targetYear;
      });

      const income = monthTxs.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const expense = monthTxs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

      result.push({
        month: monthName,
        year: targetYear,
        income,
        expense
      });
    }

    return result;
  }
}