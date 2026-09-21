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
  private sub = new Subscription();

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };

  searchQuery = '';
  selectedType = 'All Types';
  selectedCategory = 'All Categories';
  selectedPeriod = 'This Month';
  sortOrder = 'Newest First';

  transactionsList: TransactionItem[] = [];
  categoriesList: string[] = [];
  currency = '€';
  dateFormat = 'MMM dd, yyyy';

  // Pagination Controls
  currentPage = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.sub.add(
      this.txService.transactions$.subscribe(list => {
        this.transactionsList = list;
        this.clampPage();
      })
    );

    this.sub.add(
      this.txService.categories$.subscribe(cats => {
        this.categoriesList = cats.map(c => c.name);
      })
    );

    this.sub.add(
      this.txService.currency$.subscribe(curr => (this.currency = curr))
    );

    this.sub.add(
      this.txService.dateFormat$.subscribe(fmt => (this.dateFormat = fmt))
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
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
    const filtered = this.transactionsList.filter(item => {
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

    if (this.sortOrder === 'Newest First') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return filtered;
  }

  get paginatedTransactions(): TransactionItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTransactions.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTransactions.length / this.pageSize) || 1;
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get startEntryIndex(): number {
    if (this.filteredTransactions.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endEntryIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredTransactions.length);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  private clampPage(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }
}