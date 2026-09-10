import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../services/transaction.service';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Budget.html',
  styleUrl: './Budget.css'
})
export class Budget {
  private txService = inject(TransactionService);

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };

  openAddModal(): void {
    this.txService.openModal();
  }
}