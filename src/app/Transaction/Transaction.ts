import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TransactionService, TransactionItem } from '../services/transaction.service';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Transaction.html',
  styleUrl: './Transaction.css'
})
export class Transaction implements OnInit, OnDestroy {
  private txService = inject(TransactionService);
  private sub!: Subscription;

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };

  searchQuery = '';
  selectedType = 'All Types';
  selectedCategory = 'All Categories';
  selectedPeriod = 'This Month';
  sortOrder = 'Newest First';

  transactionsList: TransactionItem[] = [];

  ngOnInit(): void {
    this.sub = this.txService.transactions$.subscribe(list => {
      this.transactionsList = list;
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  openAddModal(): void {
    this.txService.openModal();
  }

  deleteItem(id: string): void {
    this.txService.deleteTransaction(id);
  }

  getAbs(val: number): number {
    return Math.abs(val);
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.transactionsList.forEach(t => (t.selected = isChecked));
  }

  get filteredTransactions(): TransactionItem[] {
    return this.transactionsList.filter(item => {
      const matchSearch = !this.searchQuery.trim() ||
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchType = this.selectedType === 'All Types' ||
        (this.selectedType === 'Income' && item.amount > 0) ||
        (this.selectedType === 'Expense' && item.amount < 0);

      const matchCat = this.selectedCategory === 'All Categories' ||
        item.category.toLowerCase() === this.selectedCategory.toLowerCase();

      return matchSearch && matchType && matchCat;
    });
  }
}