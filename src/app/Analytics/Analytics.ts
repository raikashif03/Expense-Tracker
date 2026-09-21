import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TransactionService, TransactionItem } from '../services/transaction.service';

export interface MonthlyCashFlow {
  month: string;
  income: number;
  expense: number;
  incomeHeightPct: number;
  expenseHeightPct: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Analytics.html',
  styleUrl: './Analytics.css'
})
export class Analytics implements OnInit, OnDestroy {
  private txService = inject(TransactionService);
  private sub = new Subscription();

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };

  timeframe: 'Daily' | 'Weekly' | 'Monthly' = 'Weekly';
  totalSpent = 0;
  totalIncome = 0;
  savingsRate = 0;
  largestExpense = { name: 'None', amount: 0, percentage: 0 };
  categoryBreakdown: { name: string; amount: number; percentage: number; color: string }[] = [];
  donutGradient = '#e2e8f0';
  transactions: TransactionItem[] = [];
  currency = '€';

  chartPath = '';
  chartAreaPath = '';
  trendWeeks: string[] = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
  yTrendLabels: number[] = [3500, 3000, 2500, 2000, 1500, 1000, 500, 0];

  cashFlowMonths: MonthlyCashFlow[] = [];
  yCashFlowLabels: number[] = [10000, 8000, 6000, 4000, 2000, 0];

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

  private calculateAnalytics(): void {
    this.totalSpent = this.txService.getTotalExpense();
    this.totalIncome = this.txService.getTotalIncome();
    this.savingsRate = this.txService.getSavingsRate();
    this.largestExpense = this.txService.getLargestExpense();
    this.categoryBreakdown = this.txService.getCategoryBreakdown();

    this.buildDonutGradient();
    this.buildTrendLine();
    this.buildCashFlow();
  }

  private buildDonutGradient(): void {
    if (this.categoryBreakdown.length === 0 || this.totalSpent === 0) {
      this.donutGradient = '#f1f5f9';
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
      slices.push(`#e2e8f0 ${deg}deg 360deg`);
    }

    this.donutGradient = `conic-gradient(${slices.join(', ')})`;
  }

  private buildTrendLine(): void {
    const actualExpense = this.totalSpent;
    const dynamicMax = actualExpense > 0 
      ? Math.max(Math.ceil((actualExpense * 1.4) / 100) * 100, 200) 
      : 3500;

    const step = Math.round(dynamicMax / 7);
    this.yTrendLabels = [
      dynamicMax,
      Math.round(step * 6),
      Math.round(step * 5),
      Math.round(step * 4),
      Math.round(step * 3),
      Math.round(step * 2),
      Math.round(step * 1),
      0
    ];

    const waveMultipliers = [0.35, 0.55, 0.45, 0.62, 0.52, 0.82, 0.72, 0.92, 0.76, 0.58, 0.52, 0.74];
    const dataPoints = waveMultipliers.map(m => dynamicMax * m);

    const svgWidth = 560;
    const svgHeight = 150;
    const topPadding = 15;
    const bottomPadding = 15;
    const usableHeight = svgHeight - topPadding - bottomPadding;

    const points = dataPoints.map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * svgWidth;
      const ratio = Math.min(val / dynamicMax, 1);
      const y = svgHeight - bottomPadding - (ratio * usableHeight);
      return { x, y };
    });

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    this.chartPath = d;
    this.chartAreaPath = `${d} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;
  }

  private buildCashFlow(): void {
    const monthBuckets = new Map<string, { income: number; expense: number }>();

    this.transactions.forEach(t => {
      const d = new Date(t.date);
      const mName = isNaN(d.getTime()) 
        ? 'Dec' 
        : d.toLocaleDateString('en-US', { month: 'short' });

      if (!monthBuckets.has(mName)) {
        monthBuckets.set(mName, { income: 0, expense: 0 });
      }

      const item = monthBuckets.get(mName)!;
      if (t.amount > 0) item.income += t.amount;
      else item.expense += Math.abs(t.amount);
    });

    if (monthBuckets.size === 0) {
      monthBuckets.set('Dec', { income: this.totalIncome, expense: this.totalSpent });
    }

    let highestVal = 0;
    monthBuckets.forEach(val => {
      highestVal = Math.max(highestVal, val.income, val.expense);
    });

    const ceiling = Math.max(Math.ceil((highestVal * 1.2) / 1000) * 1000, 1000);
    this.yCashFlowLabels = [
      ceiling,
      Math.round(ceiling * 0.8),
      Math.round(ceiling * 0.6),
      Math.round(ceiling * 0.4),
      Math.round(ceiling * 0.2),
      0
    ];

    this.cashFlowMonths = Array.from(monthBuckets.entries()).map(([month, stats]) => ({
      month,
      income: stats.income,
      expense: stats.expense,
      incomeHeightPct: Math.min(100, Math.round((stats.income / ceiling) * 100)),
      expenseHeightPct: Math.min(100, Math.round((stats.expense / ceiling) * 100))
    }));
  }
}