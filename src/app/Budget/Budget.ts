import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import { TransactionService, BudgetItem, CategoryItem } from '../services/transaction.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './Budget.html',
  styleUrl: './Budget.css'
})
export class Budget implements OnInit, OnDestroy {
  private txService = inject(TransactionService);
  private sub = new Subscription();

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };

  budgetsList: BudgetViewItem[] = [];
  categoriesList: CategoryItem[] = [];
  currency = '€';

  isAddEditModalOpen = false;
  isEditMode = false;
  currentEditId: string | null = null;
  formCategory = '';
  formAllocated: number | null = null;
  formPeriod = 'MONTHLY';
  formIcon = 'account_balance_wallet';
  formTheme: 'blue' | 'yellow' | 'red' = 'blue';

  isDeleteModalOpen = false;
  budgetToDelete: BudgetItem | null = null;

  ngOnInit(): void {
    // Combine observables so any change to transactions or budgets triggers a recalculation
    this.sub.add(
      combineLatest([
        this.txService.transactions$,
        this.txService.budgets$,
        this.txService.categories$
      ]).subscribe(([_, rawBudgets, cats]) => {
        this.categoriesList = cats;
        this.recalculateBudgets(rawBudgets);
      })
    );

    this.sub.add(
      this.txService.currency$.subscribe(c => (this.currency = c))
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private recalculateBudgets(rawBudgets: BudgetItem[]): void {
    const breakdown = this.txService.getCategoryBreakdown();

    this.budgetsList = rawBudgets.map(b => {
      const match = breakdown.find(c => 
        this.txService.normalizeCategory(c.name) === this.txService.normalizeCategory(b.category)
      );
      const spent = match ? match.amount : 0;
      const remaining = b.allocated - spent;
      const percentUsed = b.allocated > 0 ? Math.round((spent / b.allocated) * 100) : 0;

      return {
        ...b,
        spent,
        remaining,
        percentUsed,
        isClose: percentUsed >= 85 && percentUsed <= 100,
        isExceeded: spent > b.allocated // Triggers the red progress bar and red border
      };
    });
  }

  openCreateBudgetModal(): void {
    this.isEditMode = false;
    this.currentEditId = null;
    this.formCategory = this.categoriesList.length > 0 ? this.categoriesList[0].name : 'Food & Dining';
    this.formAllocated = null;
    this.formPeriod = 'MONTHLY';
    this.formIcon = 'account_balance_wallet';
    this.formTheme = 'blue';
    this.isAddEditModalOpen = true;
  }

  openEditBudgetModal(b: BudgetItem): void {
    this.isEditMode = true;
    this.currentEditId = b.id;
    this.formCategory = b.category;
    this.formAllocated = b.allocated;
    this.formPeriod = b.period;
    this.formIcon = b.icon;
    this.formTheme = b.iconTheme;
    this.isAddEditModalOpen = true;
  }

  closeAddEditModal(): void {
    this.isAddEditModalOpen = false;
  }

  saveBudget(): void {
    if (!this.formCategory || !this.formAllocated || this.formAllocated <= 0) return;

    const item: BudgetItem = {
      id: this.currentEditId || `bud-${Date.now()}`,
      category: this.formCategory,
      allocated: Math.abs(this.formAllocated),
      period: this.formPeriod,
      icon: this.formIcon,
      iconTheme: this.formTheme
    };

    this.txService.saveBudget(item);
    this.closeAddEditModal();
  }

  openDeleteModal(b: BudgetItem): void {
    this.budgetToDelete = b;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.budgetToDelete = null;
  }

  confirmDelete(): void {
    if (this.budgetToDelete) {
      this.txService.deleteBudget(this.budgetToDelete.id);
    }
    this.closeDeleteModal();
  }
}