import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'warning' | 'success' | 'info';
  icon: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly STORAGE_KEY = 'fintrack_notifications_v1';

  private defaultNotifications: AppNotification[] = [
    {
      id: 'n-1',
      title: 'Budget Limit Warning',
      message: 'Shopping budget has reached 88% of your monthly allocation.',
      time: '15m ago',
      type: 'warning',
      icon: 'warning',
      read: false
    },
    {
      id: 'n-2',
      title: 'Salary Credited',
      message: 'Monthly Salary of +€4,850.00 from Acme Corp was deposited.',
      time: '2h ago',
      type: 'success',
      icon: 'payments',
      read: false
    },
    {
      id: 'n-3',
      title: 'Upcoming Utility Bill',
      message: 'City Power & Electric bill of €142.30 is due in 3 days.',
      time: '1d ago',
      type: 'info',
      icon: 'receipt_long',
      read: false
    },
    {
      id: 'n-4',
      title: 'Weekly Financial Insight',
      message: 'Great work! You reduced dining out expenses by 18% this week.',
      time: '3d ago',
      type: 'info',
      icon: 'trending_up',
      read: true
    }
  ];

  private notificationsSubject = new BehaviorSubject<AppNotification[]>(
    this.loadStorage()
  );
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(
    this.calcUnread(this.notificationsSubject.getValue())
  );
  unreadCount$ = this.unreadCountSubject.asObservable();

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  private loadStorage(): AppNotification[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return this.defaultNotifications;
  }

  private saveStorage(list: AppNotification[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }

  private calcUnread(list: AppNotification[]): number {
    return list.filter(n => !n.read).length;
  }

  private updateState(list: AppNotification[]): void {
    this.notificationsSubject.next(list);
    this.unreadCountSubject.next(this.calcUnread(list));
    this.saveStorage(list);
  }

  toggle(): void {
    this.isOpenSubject.next(!this.isOpenSubject.getValue());
  }

  open(): void {
    this.isOpenSubject.next(true);
  }

  close(): void {
    this.isOpenSubject.next(false);
  }

  get unreadCount(): number {
    return this.unreadCountSubject.getValue();
  }

  get notifications(): AppNotification[] {
    return this.notificationsSubject.getValue();
  }

  markAllAsRead(): void {
    const updated = this.notificationsSubject.getValue().map(n => ({ ...n, read: true }));
    this.updateState(updated);
  }

  markAsRead(id: string): void {
    const updated = this.notificationsSubject.getValue().map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.updateState(updated);
  }

  remove(id: string): void {
    const updated = this.notificationsSubject.getValue().filter(n => n.id !== id);
    this.updateState(updated);
  }

  clearAll(): void {
    this.updateState([]);
  }
}
