import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../services/transaction.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Settings.html',
  styleUrl: './Settings.css'
})
export class Settings implements OnInit {
  private readonly STORAGE_KEY = 'fintrack_user_settings_v1';
  private txService = inject(TransactionService);
  private themeService = inject(ThemeService);

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com'
  };

  preferences = {
    currency: 'EUR (€) - Euro',
    weekStart: 'Monday',
    dateFormat: 'MM/DD/YYYY',
    theme: 'Light'
  };

  notifications = {
    budgetWarnings: true,
    weeklySummary: true,
    newFeatures: false
  };

  showToast = false;

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) this.user = { ...this.user, ...parsed.user };
        if (parsed.preferences) this.preferences = { ...this.preferences, ...parsed.preferences };
        if (parsed.notifications) this.notifications = { ...this.notifications, ...parsed.notifications };
      }
    } catch {}
  }

  onCurrencyChange(): void {
    this.txService.setCurrency(this.preferences.currency);
  }

  onDateFormatChange(): void {
    this.txService.setDateFormat(this.preferences.dateFormat);
  }

  setTheme(mode: string): void {
    this.preferences.theme = mode;
    if (mode === 'Dark') {
      document.body.classList.add('dark-mode');
    } else if (mode === 'Light') {
      document.body.classList.remove('dark-mode');
    }
  }

  saveSettings(): void {
    const data = {
      user: this.user,
      preferences: this.preferences,
      notifications: this.notifications
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));

    this.txService.setCurrency(this.preferences.currency);
    this.txService.setDateFormat(this.preferences.dateFormat);

    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  cancelSettings(): void {
    this.loadSettings();
    this.txService.setCurrency(this.preferences.currency);
    this.txService.setDateFormat(this.preferences.dateFormat);
  }
}