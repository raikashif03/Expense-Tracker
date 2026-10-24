import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TransactionService, TransactionItem } from '../Services/transaction.service';
import { NotificationsDropdown } from '../Notifications/notifications-dropdown';
import { NotificationService } from '../Services/notification.service';
import { LayoutService } from '../Services/layout.service';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationsDropdown],
  templateUrl: './Transaction.html',
  styleUrl: './Transaction.css'
})
export class Transaction implements OnInit, OnDestroy {
  private txService = inject(TransactionService);
  notifService = inject(NotificationService);
  layoutService = inject(LayoutService);
  private sub = new Subscription();

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };

  searchQuery = '';
  selectedType = 'All Types';
  selectedCategory = 'All Categories';
  selectedPeriod = 'All Time';
  sortOrder = 'Newest First';

  transactionsList: TransactionItem[] = [];
  categoriesList: string[] = [];
  currency = '€';
  dateFormat = 'MMM dd, yyyy';

  // Pagination Controls
  currentPage = 1;
  pageSize = 8;

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

  deleteSelected(): void {
    const selectedIds = this.transactionsList.filter(t => t.selected).map(t => t.id);
    if (selectedIds.length > 0) {
      this.txService.deleteTransactions(selectedIds);
    }
  }

  get selectedCount(): number {
    return this.transactionsList.filter(t => t.selected).length;
  }

  get isAllSelected(): boolean {
    const visible = this.filteredTransactions;
    return visible.length > 0 && visible.every(t => t.selected);
  }

  getAbs(val: number): number {
    return Math.abs(val);
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.filteredTransactions.forEach(t => (t.selected = isChecked));
  }

  get filteredTransactions(): TransactionItem[] {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    const filtered = this.transactionsList.filter(item => {
      const matchSearch = !this.searchQuery.trim() ||
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.method.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchType = this.selectedType === 'All Types' ||
        (this.selectedType === 'Income' && item.amount > 0) ||
        (this.selectedType === 'Expense' && item.amount < 0);

      const matchCat = this.selectedCategory === 'All Categories' ||
        item.category.toLowerCase() === this.selectedCategory.toLowerCase();

      let matchPeriod = true;
      if (this.selectedPeriod === 'This Month') {
        const d = new Date(item.date);
        matchPeriod = d.getFullYear() === curYear && d.getMonth() === curMonth;
      } else if (this.selectedPeriod === 'Last Month') {
        const d = new Date(item.date);
        const lastMonth = curMonth === 0 ? 11 : curMonth - 1;
        const lastYear = curMonth === 0 ? curYear - 1 : curYear;
        matchPeriod = d.getFullYear() === lastYear && d.getMonth() === lastMonth;
      } else if (this.selectedPeriod === 'This Year') {
        const d = new Date(item.date);
        matchPeriod = d.getFullYear() === curYear;
      }

      return matchSearch && matchType && matchCat && matchPeriod;
    });

    if (this.sortOrder === 'Newest First') {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (this.sortOrder === 'Oldest First') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (this.sortOrder === 'Highest Amount') {
      filtered.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    } else if (this.sortOrder === 'Lowest Amount') {
      filtered.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
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