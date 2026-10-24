import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TransactionService, TransactionItem } from '../Services/transaction.service';
import { NotificationsDropdown } from '../Notifications/notifications-dropdown';
import { NotificationService } from '../Services/notification.service';

export interface MonthlyCashFlow {
  month: string;
  year: number;
  income: number;
  expense: number;
  incomeHeightPct: number;
  expenseHeightPct: number;
}

export interface TrendPoint {
  x: number;
  y: number;
  label: string;
  subLabel?: string;
  amount: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationsDropdown],
  templateUrl: './Analytics.html',
  styleUrl: './Analytics.css'
})
export class Analytics implements OnInit, OnDestroy {
  private txService = inject(TransactionService);
  notifService = inject(NotificationService);
  private sub = new Subscription();

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };

  searchQuery = '';
  timeframe: 'Daily' | 'Weekly' | 'Monthly' = 'Weekly';
  totalSpent = 0;
  totalIncome = 0;
  savingsRate = 0;
  largestExpense = { name: 'None', amount: 0, percentage: 0 };
  categoryBreakdown: { name: string; amount: number; percentage: number; color: string }[] = [];
  donutGradient = 'var(--donut-empty-track, #e2e8f0)';
  transactions: TransactionItem[] = [];
  currency = '€';

  chartPath = '';
  chartAreaPath = '';
  trendXLabels: string[] = [];
  trendPoints: TrendPoint[] = [];
  yTrendLabels: number[] = [1000, 800, 600, 400, 200, 0];
  activeTrendPoint: TrendPoint | null = null;

  cashFlowMonths: MonthlyCashFlow[] = [];
  yCashFlowLabels: number[] = [5000, 4000, 3000, 2000, 1000, 0];
  activeCashFlowMonth: MonthlyCashFlow | null = null;

  ngOnInit(): void {
    this.sub.add(
      this.txService.transactions$.subscribe(list => {
        this.transactions = list;
        this.calculateAnalytics();
      })
    );
    this.sub.add(
      this.txService.currency$.subscribe(c => (this.currency = c))
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  openAddModal(): void {
    this.txService.openModal();
  }

  onSearchChange(): void {
    this.calculateAnalytics();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.calculateAnalytics();
  }

  setTimeframe(tf: 'Daily' | 'Weekly' | 'Monthly'): void {
    this.timeframe = tf;
    this.buildTrendLine();
  }

  setActiveTrendPoint(pt: TrendPoint | null): void {
    this.activeTrendPoint = pt;
  }

  setActiveCashFlow(month: MonthlyCashFlow | null): void {
    this.activeCashFlowMonth = month;
  }

  private calculateAnalytics(): void {
    const q = this.searchQuery.toLowerCase().trim();
    let allBreakdown = this.txService.getCategoryBreakdown();

    if (q) {
      allBreakdown = allBreakdown.filter(c => 
        c.name.toLowerCase().includes(q) ||
        this.transactions.some(t => t.category.toLowerCase().includes(q) && t.category === c.name)
      );
      this.categoryBreakdown = allBreakdown;
      this.totalSpent = this.categoryBreakdown.reduce((s, c) => s + c.amount, 0);
      this.totalIncome = this.transactions
        .filter(t => t.amount > 0 && (t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)))
        .reduce((s, t) => s + t.amount, 0);

      if (this.categoryBreakdown.length > 0) {
        const top = this.categoryBreakdown[0];
        this.largestExpense = {
          name: top.name,
          amount: top.amount,
          percentage: this.totalSpent > 0 ? Math.round((top.amount / this.totalSpent) * 100) : 0
        };
      } else {
        this.largestExpense = { name: 'None', amount: 0, percentage: 0 };
      }
      this.savingsRate = this.totalIncome > 0 
        ? Math.max(0, Math.round(((this.totalIncome - this.totalSpent) / this.totalIncome) * 100))
        : 0;
    } else {
      this.totalSpent = this.txService.getTotalExpense();
      this.totalIncome = this.txService.getTotalIncome();
      this.savingsRate = this.txService.getSavingsRate();
      this.largestExpense = this.txService.getLargestExpense();
      this.categoryBreakdown = allBreakdown;
    }

    this.buildDonutGradient();
    this.buildTrendLine();
    this.buildCashFlow();
  }

  private buildDonutGradient(): void {
    if (this.categoryBreakdown.length === 0 || this.totalSpent === 0) {
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

  private buildTrendLine(): void {
    const svgWidth = 560;
    const svgHeight = 160;
    const topPadding = 20;
    const bottomPadding = 25;
    const usableHeight = svgHeight - topPadding - bottomPadding;

    let rawData: { label: string; subLabel?: string; amount: number }[] = [];

    if (this.timeframe === 'Daily') {
      const dailySeries = this.txService.getDailySpendingSeries(7);
      rawData = dailySeries.map(d => ({
        label: d.label,
        subLabel: d.date,
        amount: d.amount
      }));
    } else if (this.timeframe === 'Weekly') {
      const weeklySeries = this.txService.getWeeklySpendingSeries(8);
      rawData = weeklySeries.map(w => ({
        label: w.week,
        subLabel: w.label,
        amount: w.amount
      }));
    } else {
      const monthlySeries = this.txService.getMonthlyCashFlowSeries(6);
      rawData = monthlySeries.map(m => ({
        label: m.month,
        subLabel: `${m.year}`,
        amount: m.expense
      }));
    }

    this.trendXLabels = rawData.map(d => d.label);

    const amounts = rawData.map(d => d.amount);
    const maxVal = Math.max(...amounts, 20);
    const stepUnit = maxVal > 1000 ? 500 : (maxVal > 200 ? 50 : 10);
    const dynamicMax = Math.max(Math.ceil((maxVal * 1.2) / stepUnit) * stepUnit, 50);

    const step = Math.round(dynamicMax / 5);
    this.yTrendLabels = [
      dynamicMax,
      Math.round(step * 4),
      Math.round(step * 3),
      Math.round(step * 2),
      Math.round(step * 1),
      0
    ];

    const n = rawData.length;
    const points: TrendPoint[] = rawData.map((item, idx) => {
      const x = n > 1 ? (idx / (n - 1)) * (svgWidth - 60) + 30 : svgWidth / 2;
      const ratio = Math.min(item.amount / dynamicMax, 1);
      const y = svgHeight - bottomPadding - (ratio * usableHeight);
      return {
        x,
        y,
        label: item.label,
        subLabel: item.subLabel,
        amount: item.amount
      };
    });

    this.trendPoints = points;

    if (points.length === 0) {
      this.chartPath = '';
      this.chartAreaPath = '';
      return;
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    this.chartPath = d;
    this.chartAreaPath = `${d} L ${points[points.length - 1].x} ${svgHeight - bottomPadding} L ${points[0].x} ${svgHeight - bottomPadding} Z`;
  }

  private buildCashFlow(): void {
    const rawSeries = this.txService.getMonthlyCashFlowSeries(6);

    let highestVal = 0;
    rawSeries.forEach(val => {
      highestVal = Math.max(highestVal, val.income, val.expense);
    });

    const stepUnit = highestVal > 2000 ? 1000 : (highestVal > 500 ? 250 : 100);
    const ceiling = Math.max(Math.ceil((highestVal * 1.15) / stepUnit) * stepUnit, 500);

    const step = Math.round(ceiling / 5);
    this.yCashFlowLabels = [
      ceiling,
      Math.round(step * 4),
      Math.round(step * 3),
      Math.round(step * 2),
      Math.round(step * 1),
      0
    ];

    this.cashFlowMonths = rawSeries.map(s => ({
      month: s.month,
      year: s.year,
      income: s.income,
      expense: s.expense,
      incomeHeightPct: Math.min(100, Math.max(2, Math.round((s.income / ceiling) * 100))),
      expenseHeightPct: Math.min(100, Math.max(2, Math.round((s.expense / ceiling) * 100)))
    }));
  }
}