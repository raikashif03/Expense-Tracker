import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TransactionService } from '../Services/transaction.service';
import { ThemeService } from '../Services/theme.service';
import { LayoutService } from '../Services/layout.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './Sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  private txService = inject(TransactionService);
  themeService = inject(ThemeService);
  layoutService = inject(LayoutService);

  openAddModal(): void {
    this.layoutService.closeSidebar();
    this.txService.openModal();
  }

  toggleTheme(): void {
    this.themeService.toggleDarkMode();
  }

  closeSidebar(): void {
    this.layoutService.closeSidebar();
  }
}