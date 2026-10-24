import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionService, TransactionItem, BudgetItem } from '../Services/transaction.service';
import { NotificationsDropdown } from '../Notifications/notifications-dropdown';
import { NotificationService } from '../Services/notification.service';

export interface DashboardCategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface DashboardBudgetItem {
  name: string;
  spent: number;
  allocated: number;
  percentage: number;
  color: string;
  isExceeded: boolean;
}

export interface WeeklyDataPoint {
  week: string;
  amount: number;
  label: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NotificationsDropdown],
  templateUrl: './Dashboard.html',
  styleUrl: './Dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  private txService = inject(TransactionService);
  notifService = inject(NotificationService);
  private sub = new Subscription();

  userName = 'Jane';
  currentDate = new Date();
  currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };

  currency = '€';
  dateFormat = 'MMM dd, yyyy';

  totalBalance = 0;
  monthlyIncome = 0;
  monthlyExpenses = 0;
  savingsAmount = 0;
  savingsRate = 0;

  searchQuery = '';
  allTransactions: TransactionItem[] = [];
  recentTransactions: TransactionItem[] = [];
  categoryBreakdown: DashboardCategoryBreakdown[] = [];
  donutGradient = 'var(--donut-empty-track, #e2e8f0)';
  budgetList: DashboardBudgetItem[] = [];
  
  trendPath = '';
  trendAreaPath = '';
  weeklyPoints: WeeklyDataPoint[] = [];
  activePoint: WeeklyDataPoint | null = null;

  private currentBudgets: BudgetItem[] = [];

  get filteredRecentTransactions(): TransactionItem[] {
    if (!this.searchQuery.trim()) {
      return this.recentTransactions;
    }
    const q = this.searchQuery.trim().toLowerCase();
    return this.allTransactions.filter(t =>
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.method && t.method.toLowerCase().includes(q)) ||
      t.amount.toString().includes(q)
    ).slice(0, 8);
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  ngOnInit(): void {
    this.loadUserProfile();

    this.sub.add(
      this.txService.currency$.subscribe(curr => {
        this.currency = curr;
      })
    );

    this.sub.add(
      this.txService.dateFormat$.subscribe(fmt => {
        this.dateFormat = fmt;
      })
    );

    this.sub.add(
      this.txService.budgets$.subscribe(b => {
        this.currentBudgets = b;
        this.computeBudgets();
      })
    );

    this.sub.add(
      this.txService.transactions$.subscribe(list => {
        this.allTransactions = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.recentTransactions = this.allTransactions.slice(0, 5);
        this.computeMetrics();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  openAddModal(): void {
    this.txService.openModal();
  }

  getAbs(val: number): number {
    return Math.abs(val);
  }

  setActivePoint(point: WeeklyDataPoint | null): void {
    this.activePoint = point;
  }

  private loadUserProfile(): void {
    try {
      const saved = localStorage.getItem('fintrack_user_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user?.firstName) {
          this.userName = parsed.user.firstName;
        }
        if (parsed.user?.avatar) {
          this.user.avatar = parsed.user.avatar;
        }
      }
    } catch {}
  }

  private computeMetrics(): void {
    const curMonth = this.currentDate.getMonth();
    const curYear = this.currentDate.getFullYear();

    // Check if there are transactions this month; if not, fall back to all-time so dashboard isn't completely empty
    let inc = this.txService.getTotalIncome(curMonth, curYear);
    let exp = this.txService.getTotalExpense(curMonth, curYear);

    if (inc === 0 && exp === 0) {
      inc = this.txService.getTotalIncome();
      exp = this.txService.getTotalExpense();
      // Use active month name
      const latestDate = this.txService.getLatestActiveDate();
      this.currentMonth = latestDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      this.currentMonth = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    this.monthlyIncome = inc;
    this.monthlyExpenses = exp;
    this.totalBalance = this.monthlyIncome - this.monthlyExpenses;
    this.savingsAmount = Math.max(0, this.totalBalance);
    this.savingsRate = this.monthlyIncome > 0 
      ? Math.max(0, Math.round(((this.monthlyIncome - this.monthlyExpenses) / this.monthlyIncome) * 1000) / 10)
      : 0;

    this.computeCategories();
    this.computeBudgets();
    this.computeWaveChart();
  }

  private computeCategories(): void {
    const curMonth = this.currentDate.getMonth();
    const curYear = this.currentDate.getFullYear();

    let rawBreakdown = this.txService.getCategoryBreakdown(curMonth, curYear);
    if (rawBreakdown.length === 0) {
      rawBreakdown = this.txService.getCategoryBreakdown();
    }

    const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    // Top 4 categories + Other if more exist
    if (rawBreakdown.length <= 4) {
      this.categoryBreakdown = rawBreakdown.map((item, index) => ({
        name: item.name,
        amount: item.amount,
        percentage: item.percentage,
        color: colors[index % colors.length]
      }));
    } else {
      const top4 = rawBreakdown.slice(0, 4);
      const remaining = rawBreakdown.slice(4);
      const otherAmount = remaining.reduce((s, c) => s + c.amount, 0);
      const otherPct = remaining.reduce((s, c) => s + c.percentage, 0);

      this.categoryBreakdown = top4.map((item, index) => ({
        name: item.name,
        amount: item.amount,
        percentage: item.percentage,
        color: colors[index % colors.length]
      }));

      if (otherAmount > 0) {
        this.categoryBreakdown.push({
          name: 'Other',
          amount: otherAmount,
          percentage: otherPct,
          color: '#94a3b8'
        });
      }
    }

    if (this.categoryBreakdown.length === 0 || this.monthlyExpenses === 0) {
      this.donutGradient = 'var(--donut-empty-track, #e2e8f0)';
      return;
    }

    let deg = 0;
    const slices = this.categoryBreakdown.map(cat => {
      const sliceDeg = (cat.percentage / 100) * 360;
      const start = deg;
      const end = deg + sliceDeg;
      deg = end;
      return `${cat.color} ${start}deg ${end}deg`;
    });

    if (deg < 360) {
      slices.push(`var(--donut-empty-track, #e2e8f0) ${deg}deg 360deg`);
    }

    this.donutGradient = `conic-gradient(${slices.join(', ')})`;
  }

  private computeBudgets(): void {
    const curMonth = this.currentDate.getMonth();
    const curYear = this.currentDate.getFullYear();

    let allBreakdown = this.txService.getCategoryBreakdown(curMonth, curYear);
    if (allBreakdown.length === 0) {
      allBreakdown = this.txService.getCategoryBreakdown();
    }

    // Merge breakdown with currentBudgets
    const list: DashboardBudgetItem[] = [];
    const handledCats = new Set<string>();

    for (const b of this.currentBudgets) {
      const normB = this.txService.normalizeCategory(b.category);
      handledCats.add(normB);
      const spentItem = allBreakdown.find(c => this.txService.normalizeCategory(c.name) === normB);
      const spent = spentItem ? spentItem.amount : 0;
      const percentage = b.allocated > 0 ? Math.min(100, Math.round((spent / b.allocated) * 100)) : 0;
      const isExceeded = spent > b.allocated;

      list.push({
        name: b.category,
        spent,
        allocated: b.allocated,
        percentage,
        color: isExceeded ? '#ef4444' : (percentage >= 85 ? '#f59e0b' : '#3b82f6'),
        isExceeded
      });
    }

    // Add any active expense categories that don't have explicit budgets yet
    for (const cat of allBreakdown) {
      const normC = this.txService.normalizeCategory(cat.name);
      if (!handledCats.has(normC)) {
        const allocated = 300;
        const percentage = Math.min(100, Math.round((cat.amount / allocated) * 100));
        const isExceeded = cat.amount > allocated;
        list.push({
          name: cat.name,
          spent: cat.amount,
          allocated,
          percentage,
          color: isExceeded ? '#ef4444' : (percentage >= 85 ? '#f59e0b' : '#3b82f6'),
          isExceeded
        });
      }
    }

    this.budgetList = list.slice(0, 4);
  }

  private computeWaveChart(): void {
    const curYear = this.currentDate.getFullYear();
    const curMonth = this.currentDate.getMonth();
    const weeklyData = this.txService.getWeeklySpending(curYear, curMonth);

    const values = weeklyData.map(w => w.amount);
    const maxVal = Math.max(...values, 50);
    const ceilVal = Math.ceil((maxVal * 1.25) / 50) * 50;

    const width = 600;
    const height = 135;
    const topPad = 20;
    const bottomPad = 25;
    const usableH = height - topPad - bottomPad;

    const xCoords = [75, 225, 375, 525];
    const points: WeeklyDataPoint[] = weeklyData.map((w, idx) => {
      const x = xCoords[idx] !== undefined ? xCoords[idx] : 75 + idx * 150;
      const ratio = ceilVal > 0 ? Math.min(w.amount / ceilVal, 1) : 0;
      const y = height - bottomPad - (ratio * usableH);
      return {
        week: w.week,
        amount: w.amount,
        label: w.label,
        x,
        y
      };
    });

    this.weeklyPoints = points;

    if (!points || points.length === 0) {
      this.trendPath = '';
      this.trendAreaPath = '';
      return;
    }

    if (points.length === 1) {
      this.trendPath = `M 0 ${points[0].y} L ${width} ${points[0].y}`;
      this.trendAreaPath = `M 0 ${points[0].y} L ${width} ${points[0].y} L ${width} ${height} L 0 ${height} Z`;
      return;
    }

    // Cubic bezier curve across the points
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    this.trendPath = d;
    const firstC = d.indexOf('C');
    if (firstC !== -1) {
      this.trendAreaPath = `M 0 ${points[0].y} L ${points[0].x} ${points[0].y} ` +
        d.substring(firstC) +
        ` L ${width} ${points[points.length - 1].y} L ${width} ${height} L 0 ${height} Z`;
    } else {
      this.trendAreaPath = `M 0 ${points[0].y} L ${width} ${points[points.length - 1].y} L ${width} ${height} L 0 ${height} Z`;
    }
  }
}