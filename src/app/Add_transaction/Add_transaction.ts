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

  isOpen: boolean = false;

  type: 'Expense' | 'Income' | null = null;
  amount: number | null = null;
  description: string = '';
  category: string = '';
  date: string = '';
  method: string = '';
  notes: string = '';
  isSubmitted: boolean = false;

  ngOnInit(): void {
    this.sub = this.txService.isModalOpen$.subscribe(state => {
      this.isOpen = state;
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  close(): void {
    this.resetForm();
    this.txService.closeModal();
  }

  save(): void {
    this.isSubmitted = true;

    if (!this.type || !this.amount || this.amount <= 0 || !this.description.trim() || !this.category || !this.method || !this.date) {
      return;
    }

    const isExpense = this.type === 'Expense';
    const computedAmount = isExpense ? -Math.abs(this.amount) : Math.abs(this.amount);

    let icon = 'receipt';
    let iconBg = '#f1f5f9';
    let iconColor = '#475569';

    if (this.category === 'Food & Dining') {
      icon = 'shopping_cart'; iconBg = '#ede9fe'; iconColor = '#6366f1';
    } else if (this.category === 'Transportation') {
      icon = 'local_gas_station'; iconBg = '#e0e7ff'; iconColor = '#3b3bf5';
    } else if (this.category === 'Entertainment') {
      icon = 'movie'; iconBg = '#ffe4e6'; iconColor = '#f43f5e';
    } else if (this.type === 'Income' || this.category === 'Salary / Income') {
      icon = 'payments'; iconBg = '#dcfce7'; iconColor = '#10b981';
    }

    const formattedDate = new Date(this.date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    this.txService.addTransaction({
      name: this.description.trim(),
      category: this.category,
      date: formattedDate,
      method: this.method,
      amount: computedAmount,
      icon,
      iconBg,
      iconColor
    });

    this.close();
  }

  private resetForm(): void {
    this.type = null;
    this.amount = null;
    this.description = '';
    this.category = '';
    this.date = '';
    this.method = '';
    this.notes = '';
    this.isSubmitted = false;
  }
}