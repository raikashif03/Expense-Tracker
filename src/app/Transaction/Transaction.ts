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

  searchQuery: string = '';
  selectedType: string = 'All Types';
  selectedCategory: string = 'All Categories';
  selectedPeriod: string = 'This Month';
  sortOrder: string = 'Newest First';

  transactionsList: TransactionItem[] = [];

  ngOnInit(): void {
    // Subscribe to live transactions stream from shared service
    this.sub = this.txService.transactions$.subscribe((list) => {
      this.transactionsList = list;
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  openAddModal(): void {
    this.txService.openModal();
  }

  getAbs(val: number): number {
    return Math.abs(val);
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.transactionsList.forEach((t) => (t.selected = isChecked));
  }
}