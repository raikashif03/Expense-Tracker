import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly TX_KEY = 'fintrack_tx_clean_v9';
  private readonly CAT_KEY = 'fintrack_cat_clean_v9';
  private readonly BUD_KEY = 'fintrack_bud_clean_v9';
  private readonly SETTINGS_KEY = 'fintrack_user_settings_v1';

  private isModalOpenSubject = new BehaviorSubject<boolean>(false);
  isModalOpen$ = this.isModalOpenSubject.asObservable();

  private transactionsSubject = new BehaviorSubject<TransactionItem[]>(
    this.loadStorage(this.TX_KEY, [])
  );
  transactions$ = this.transactionsSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<CategoryItem[]>(
    this.loadStorage(this.CAT_KEY, [
      { id: 'cat-1', name: 'Food & Dining', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'restaurant', iconBg: '#ede9fe', iconColor: '#6366f1' },
      { id: 'cat-2', name: 'Transport', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'directions_car', iconBg: '#ffe4e6', iconColor: '#881337' },
      { id: 'cat-3', name: 'Shopping', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'shopping_bag', iconBg: '#dcfce7', iconColor: '#059669' },
      { id: 'cat-4', name: 'Bills & Utilities', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'receipt_long', iconBg: '#ede9fe', iconColor: '#6366f1' },
      { id: 'cat-5', name: 'Entertainment', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'movie', iconBg: '#fee2e2', iconColor: '#ef4444' },
      { id: 'cat-6', name: 'Health & Wellness', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'favorite', iconBg: '#ede9fe', iconColor: '#6366f1' },
      { id: 'cat-7', name: 'Education', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'school', iconBg: '#ede9fe', iconColor: '#6366f1' },
      { id: 'cat-8', name: 'Travel', transactionsCount: 0, spentAmount: 0, type: 'spent', icon: 'flight', iconBg: '#ede9fe', iconColor: '#6366f1' },
      { id: 'cat-9', name: 'Income', transactionsCount: 0, spentAmount: 0, type: 'earned', icon: 'payments', iconBg: '#dcfce7', iconColor: '#10b981' }
    ])
  );
  categories$ = this.categoriesSubject.asObservable();

  private budgetsSubject = new BehaviorSubject<BudgetItem[]>(
    this.loadStorage(this.BUD_KEY, [
      { id: 'b-1', category: 'Food & Dining', period: 'MONTHLY', allocated: 500, icon: 'restaurant', iconTheme: 'blue' },
      { id: 'b-2', category: 'Transport', period: 'MONTHLY', allocated: 250, icon: 'directions_car', iconTheme: 'yellow' },
      { id: 'b-3', category: 'Shopping', period: 'MONTHLY', allocated: 300, icon: 'shopping_bag', iconTheme: 'red' }
    ])
  );
  budgets$ = this.budgetsSubject.asObservable();

  // Global Settings Subjects
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
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveStorage(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
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
    const index = current.findIndex(b => b.id === budget.id);
    const updated = index > -1
      ? current.map((b, i) => (i === index ? budget : b))
      : [...current, budget];
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

  getTotalIncome(): number {
    return this.transactionsSubject.getValue()
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpense(): number {
    return this.transactionsSubject.getValue()
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  getSavingsRate(): number {
    const income = this.getTotalIncome();
    if (income <= 0) return 0;
    const rate = ((income - this.getTotalExpense()) / income) * 100;
    return Math.max(0, Math.round(rate * 10) / 10);
  }

  getCategoryBreakdown(): { name: string; amount: number; percentage: number; color: string }[] {
    const totalExp = this.getTotalExpense();
    const grouped = new Map<string, number>();

    this.transactionsSubject.getValue()
      .filter(t => t.amount < 0)
      .forEach(t => {
        const catName = t.category || 'Other';
        grouped.set(catName, (grouped.get(catName) || 0) + Math.abs(t.amount));
      });

    const palette = ['#881337', '#3b3bf5', '#059669', '#d97706', '#6366f1', '#ec4899', '#0284c7'];
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

  getLargestExpense(): { name: string; amount: number; percentage: number } {
    const expenses = this.transactionsSubject.getValue().filter(t => t.amount < 0);
    if (expenses.length === 0) return { name: 'None', amount: 0, percentage: 0 };

    const totalSpent = this.getTotalExpense();
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
}