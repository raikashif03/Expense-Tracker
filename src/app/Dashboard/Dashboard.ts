import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TransactionService, TransactionItem, BudgetItem } from '../services/transaction.service';

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
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './Dashboard.html',
  styleUrl: './Dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  private txService = inject(TransactionService);
  private sub!: Subscription;

  userName = 'Alex';
  currentMonth = 'September';

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };

  totalBalance = 0;
  monthlyIncome = 0;
  monthlyExpenses = 0;
  savingsAmount = 0;
  savingsRate = 0;

  recentTransactions: TransactionItem[] = [];
  categoryBreakdown: DashboardCategoryBreakdown[] = [];
  donutGradient = '#e2e8f0';
  budgetList: DashboardBudgetItem[] = [];
  trendPath = '';
  trendAreaPath = '';

  private currentBudgets: BudgetItem[] = [];

  ngOnInit(): void {
    this.sub = this.txService.budgets$.subscribe(b => {
      this.currentBudgets = b;
    });

    this.sub.add(
      this.txService.transactions$.subscribe(list => {
        this.recentTransactions = list.slice(0, 5);
        this.computeMetrics();
      })
    );
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  openAddModal(): void {
    this.txService.openModal();
  }

  getAbs(val: number): number {
    return Math.abs(val);
  }

  private computeMetrics(): void {
    this.monthlyIncome = this.txService.getTotalIncome();
    this.monthlyExpenses = this.txService.getTotalExpense();
    this.totalBalance = this.monthlyIncome - this.monthlyExpenses;
    this.savingsAmount = Math.max(0, this.totalBalance);
    this.savingsRate = this.txService.getSavingsRate();

    this.computeCategories();
    this.computeBudgets();
    this.computeWaveChart();
  }

  private computeCategories(): void {
    const rawBreakdown = this.txService.getCategoryBreakdown();
    const colors = ['#881337', '#3b3bf5', '#059669', '#d97706', '#6366f1', '#ec4899'];

    this.categoryBreakdown = rawBreakdown.slice(0, 4).map((item, index) => ({
      name: item.name,
      amount: item.amount,
      percentage: item.percentage,
      color: colors[index % colors.length]
    }));

    if (this.categoryBreakdown.length === 0 || this.monthlyExpenses === 0) {
      this.donutGradient = '#e2e8f0';
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

  private computeBudgets(): void {
    const allBreakdown = this.txService.getCategoryBreakdown();

    // Map whatever categories actually have expenses added to them
    this.budgetList = allBreakdown.map(cat => {
      // Find allocation from registered budgets if exists, else default to 300
      const existingBudget = this.currentBudgets.find(b =>
        b.category.toLowerCase().trim() === cat.name.toLowerCase().trim() ||
        this.txService.normalizeCategory(b.category) === this.txService.normalizeCategory(cat.name)
      );

      const allocated = existingBudget ? existingBudget.allocated : 300;
      const percentage = Math.min(100, Math.round((cat.amount / allocated) * 100));

      return {
        name: cat.name,
        spent: cat.amount,
        allocated: allocated,
        percentage: percentage,
        color: cat.color
      };
    });
  }

  private computeWaveChart(): void {
    const expenses = this.recentTransactions
      .filter(t => t.amount < 0)
      .map(t => Math.abs(t.amount));

    if (expenses.length === 0) {
      this.trendPath = 'M 0 110 Q 150 90, 300 115 T 600 60';
      this.trendAreaPath = 'M 0 110 Q 150 90, 300 115 T 600 60 L 600 150 L 0 150 Z';
      return;
    }

    const max = Math.max(...expenses, 100);
    const width = 600;
    const height = 130;

    const points = expenses.map((val, idx) => {
      const x = expenses.length === 1 ? width / 2 : (idx / (expenses.length - 1)) * width;
      const y = height - (val / max) * (height - 35);
      return { x, y };
    });

    if (points.length === 1) {
      this.trendPath = `M 0 ${points[0].y} L ${width} ${points[0].y}`;
      this.trendAreaPath = `M 0 ${points[0].y} L ${width} ${points[0].y} L ${width} 150 L 0 150 Z`;
      return;
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    this.trendPath = d;
    this.trendAreaPath = `${d} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;
  }
}