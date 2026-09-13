import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TransactionService, BudgetItem } from '../services/transaction.service';

interface BudgetViewItem extends BudgetItem {
  spent: number;
  remaining: number;
  percentUsed: number;
  isClose: boolean;
  isExceeded: boolean;
}

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Budget.html',
  styleUrl: './Budget.css'
})
export class Budget implements OnInit, OnDestroy {
  private txService = inject(TransactionService);
  private sub!: Subscription;

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };

  budgetsList: BudgetViewItem[] = [];

  ngOnInit(): void {
    this.sub = this.txService.transactions$.subscribe(() => {
      this.calculateBudgets();
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  openAddModal(): void {
    this.txService.openModal();
  }

  private calculateBudgets(): void {
    this.txService.budgets$.subscribe(budgets => {
      this.budgetsList = budgets.map(b => {
        const spent = this.txService.getCategoryBreakdown()
          .find(c => c.name.toLowerCase() === b.category.toLowerCase())?.amount || 0;

        const remaining = b.allocated - spent;
        const percentUsed = b.allocated > 0 ? Math.round((spent / b.allocated) * 100) : 0;

        return {
          ...b,
          spent,
          remaining,
          percentUsed,
          isClose: percentUsed >= 85 && percentUsed <= 100,
          isExceeded: percentUsed > 100
        };
      });
    });
  }
}