import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Settings.html',
  styleUrl: './Settings.css'
})
export class Settings implements OnInit {
  private readonly STORAGE_KEY = 'fintrack_user_settings_v1';

  user = {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com'
  };

  preferences = {
    currency: 'USD ($) - US Dollar',
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
    } catch {
      // Fallback to default state
    }
  }

  setTheme(mode: string): void {
    this.preferences.theme = mode;
  }

  saveSettings(): void {
    const data = {
      user: this.user,
      preferences: this.preferences,
      notifications: this.notifications
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));

    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  cancelSettings(): void {
    this.loadSettings();
  }
}