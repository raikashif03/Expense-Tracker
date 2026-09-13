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
  private sub!: Subscription;

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

  // Spending Trend properties
  chartPath = '';
  chartAreaPath = '';
  trendWeeks: string[] = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
  yTrendLabels: number[] = [3500, 3000, 2500, 2000, 1500, 1000, 500, 0];

  // Cash Flow properties
  cashFlowMonths: MonthlyCashFlow[] = [];
  yCashFlowLabels: number[] = [10000, 8000, 6000, 4000, 2000, 0];

  ngOnInit(): void {
    this.sub = this.txService.transactions$.subscribe(list => {
      this.transactions = list;
      this.calculateAnalytics();
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
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

    // Use actual spending to determine a realistic maximum or standard demo baseline
    const dynamicMax = actualExpense > 0 
      ? Math.max(Math.ceil((actualExpense * 1.4) / 100) * 100, 200) 
      : 3500;

    // Set 8 step labels down to 0
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

    // Create wave multipliers to simulate weekly expenditure flow
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

    // Build smooth cubic Bézier curves
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
    const inc = this.totalIncome > 0 ? this.totalIncome : 3200;
    const exp = this.totalSpent > 0 ? this.totalSpent : 1845;

    const maxVal = Math.max(inc, exp, 8000);
    const chartCeiling = Math.ceil(maxVal / 2000) * 2000;
    
    this.yCashFlowLabels = [
      chartCeiling,
      Math.round(chartCeiling * 0.8),
      Math.round(chartCeiling * 0.6),
      Math.round(chartCeiling * 0.4),
      Math.round(chartCeiling * 0.2),
      0
    ];

    this.cashFlowMonths = [
      {
        month: 'Sep',
        income: inc,
        expense: exp,
        incomeHeightPct: Math.min(100, (inc / chartCeiling) * 100),
        expenseHeightPct: Math.min(100, (exp / chartCeiling) * 100)
      },
      {
        month: 'Oct',
        income: Math.round(inc * 1.05),
        expense: Math.round(exp * 0.92),
        incomeHeightPct: Math.min(100, ((inc * 1.05) / chartCeiling) * 100),
        expenseHeightPct: Math.min(100, ((exp * 0.92) / chartCeiling) * 100)
      },
      {
        month: 'Nov',
        income: Math.round(inc * 1.12),
        expense: Math.round(exp * 1.06),
        incomeHeightPct: Math.min(100, ((inc * 1.12) / chartCeiling) * 100),
        expenseHeightPct: Math.min(100, ((exp * 1.06) / chartCeiling) * 100)
      }
    ];
  }
}