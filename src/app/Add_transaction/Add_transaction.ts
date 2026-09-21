import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TransactionService, CategoryItem } from '../services/transaction.service';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Add_transaction.html',
  styleUrl: './Add_transaction.css'
})
export class AddTransaction implements OnInit, OnDestroy {
  private txService = inject(TransactionService);
  private sub = new Subscription();

  isOpen = false;
  type: 'Expense' | 'Income' = 'Expense';
  amount: number | null = null;
  description = '';
  category = '';
  date = '';
  method = '';
  notes = '';
  isSubmitted = false;

  currency = '€';
  categoriesList: CategoryItem[] = [];

  ngOnInit(): void {
    this.sub.add(
      this.txService.isModalOpen$.subscribe(state => (this.isOpen = state))
    );
    this.sub.add(
      this.txService.categories$.subscribe(cats => (this.categoriesList = cats))
    );
    this.sub.add(
      this.txService.currency$.subscribe(curr => (this.currency = curr))
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  close(): void {
    this.resetForm();
    this.txService.closeModal();
  }

  validateYearLength(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const parts = input.value.split('-');
      if (parts[0] && parts[0].length > 4) {
        parts[0] = parts[0].slice(0, 4);
        input.value = parts.join('-');
        this.date = input.value;
      }
    }
  }

  save(): void {
    this.isSubmitted = true;
    if (!this.type || !this.amount || this.amount <= 0 || !this.description.trim() || !this.category || !this.date || !this.method) {
      return;
    }

    const year = new Date(this.date).getFullYear();
    if (isNaN(year) || year < 1900 || year > 2099) {
      return;
    }

    const isExpense = this.type === 'Expense';
    const computedAmount = isExpense ? -Math.abs(this.amount) : Math.abs(this.amount);

    const foundCategory = this.categoriesList.find(c => c.name === this.category);
    let icon = foundCategory?.icon || 'receipt_long';
    let iconBg = foundCategory?.iconBg || (isExpense ? '#ede9fe' : '#dcfce7');
    let iconColor = foundCategory?.iconColor || (isExpense ? '#6366f1' : '#10b981');

    this.txService.addTransaction({
      name: this.description.trim(),
      category: this.category,
      date: this.date,
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