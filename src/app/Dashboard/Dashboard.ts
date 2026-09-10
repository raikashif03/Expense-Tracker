import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Dashboard.html',
  styleUrl: './Dashboard.css'
})
export class Dashboard {
  user = {
    name: 'Alex',
    period: 'September',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };

  metrics = {
    totalBalance: 4280.50,
    balanceTrend: '+€320.50 this month',
    income: 3200.00,
    incomeTrend: '+8.2% vs last month',
    expenses: 1845.30,
    expensesTrend: '-4.5% vs last month'
  };

  transactions = [
    { title: 'Salary', category: 'Tech Corp Inc.', date: 'Sep 28, 2023', amount: 2500.00, icon: 'business_center', bg: '#dcfce7', color: '#10b981' },
    { title: 'Netflix', category: 'Entertainment', date: 'Sep 26, 2023', amount: -17.99, icon: 'movie', bg: '#ffe4e6', color: '#f43f5e' },
    { title: 'Carrefour', category: 'Groceries', date: 'Sep 25, 2023', amount: -54.80, icon: 'shopping_cart', bg: '#ede9fe', color: '#6366f1' }
  ];

  categories = [
    { name: 'Food', percent: 35, color: '#3b3bf5' },
    { name: 'Transport', percent: 25, color: '#881337' },
    { name: 'Other', percent: 40, color: '#cbd5e1' }
  ];

  budgets = [
    { name: 'Food', spent: 320, limit: 500, color: '#3b3bf5' },
    { name: 'Transport', spent: 180, limit: 250, color: '#881337' },
    { name: 'Shopping', spent: 240, limit: 300, color: '#065f46' }
  ];

  getSavings(): number {
    return this.metrics.income - this.metrics.expenses;
  }

  getSavingsRate(): number {
    return this.metrics.income > 0 ? Math.round((this.getSavings() / this.metrics.income) * 100) : 0;
  }

  getAbs(val: number): number {
    return Math.abs(val);
  }

  getBudgetPercentage(spent: number, limit: number): number {
    return Math.min(100, Math.round((spent / limit) * 100));
  }

  getDonutGradient(): string {
    let currentAngle = 0;
    const segments = this.categories.map(cat => {
      const start = currentAngle;
      const end = currentAngle + (cat.percent * 3.6);
      currentAngle = end;
      return `${cat.color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${segments.join(', ')})`;
  }
}