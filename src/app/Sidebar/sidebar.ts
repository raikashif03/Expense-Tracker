import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TransactionService } from '../services/transaction.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './Sidebar.html',
  styleUrl: './Sidebar.css'
})
export class Sidebar {
  private txService = inject(TransactionService);
  themeService = inject(ThemeService);

  openAddModal(): void {
    this.txService.openModal();
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }
}