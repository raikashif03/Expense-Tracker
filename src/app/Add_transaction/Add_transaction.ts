import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TransactionService } from '../services/transaction.service';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Add_transaction.html',
  styleUrl: './Add_transaction.css'
})
export class AddTransaction implements OnInit, OnDestroy {
  private txService = inject(TransactionService);
  private sub!: Subscription;

  isOpen = false;
  type: 'Expense' | 'Income' = 'Expense';
  amount: number | null = null;
  description = '';
  category = '';
  date = '';
  method = '';
  notes = '';
  isSubmitted = false;

  ngOnInit(): void {
    this.sub = this.txService.isModalOpen$.subscribe(state => {
      this.isOpen = state;
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  close(): void {
    this.resetForm();
    this.txService.closeModal();
  }

  save(): void {
    this.isSubmitted = true;
    if (!this.type || !this.amount || this.amount <= 0 || !this.description.trim() || !this.category || !this.date || !this.method) {
      return;
    }

    const isExpense = this.type === 'Expense';
    const computedAmount = isExpense ? -Math.abs(this.amount) : Math.abs(this.amount);

    const normCat = this.txService.normalizeCategory(this.category);
    let finalCategoryName = this.category;
    let icon = 'receipt_long';
    let iconBg = '#f1f5f9';
    let iconColor = '#475569';

    if (normCat === 'shopping') {
      finalCategoryName = 'Shopping';
      icon = 'shopping_bag';
      iconBg = '#dcfce7';
      iconColor = '#059669';
    } else if (normCat === 'food & dining') {
      finalCategoryName = 'Food & Dining';
      icon = 'restaurant';
      iconBg = '#ede9fe';
      iconColor = '#6366f1';
    } else if (normCat === 'transport') {
      finalCategoryName = 'Transport';
      icon = 'directions_car';
      iconBg = '#ffe4e6';
      iconColor = '#881337';
    } else if (normCat === 'income') {
      finalCategoryName = 'Income';
      icon = 'payments';
      iconBg = '#d1fae5';
      iconColor = '#10b981';
    } else if (normCat === 'entertainment') {
      finalCategoryName = 'Entertainment';
      icon = 'movie';
      iconBg = '#fee2e2';
      iconColor = '#ef4444';
    }

    const parsedDate = new Date(this.date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    this.txService.addTransaction({
      name: this.description.trim(),
      category: finalCategoryName,
      date: parsedDate,
      method: this.method,
      amount: computedAmount,
      icon,
      iconBg,
      iconColor
    });

    this.close();
  }

  private resetForm(): void {
    this.type = 'Expense';
    this.amount = null;
    this.description = '';
    this.category = '';
    this.date = '';
    this.method = '';
    this.notes = '';
    this.isSubmitted = false;
  }
}