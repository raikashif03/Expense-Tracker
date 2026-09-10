import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../services/transaction.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Analytics.html',
  styleUrl: './Analytics.css'
})
export class Analytics {
  private txService = inject(TransactionService);

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  };

  timeframe: 'Daily' | 'Weekly' | 'Monthly' = 'Weekly';

  openAddModal(): void {
    this.txService.openModal();
  }
}