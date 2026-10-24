import { Component, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, AppNotification } from '../Services/notification.service';

@Component({
  selector: 'app-notifications-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-dropdown.html',
  styleUrl: './notifications-dropdown.css'
})
export class NotificationsDropdown {
  notifService = inject(NotificationService);
  private elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    const target = event.target as HTMLElement;
    const isTriggerBtn = target.closest('.notif-trigger-btn');
    if (!clickedInside && !isTriggerBtn && this.notifService.isOpen$) {
      this.notifService.close();
    }
  }

  markAll(): void {
    this.notifService.markAllAsRead();
  }

  markRead(n: AppNotification): void {
    this.notifService.markAsRead(n.id);
  }

  remove(event: MouseEvent, id: string): void {
    event.stopPropagation();
    this.notifService.remove(id);
  }

  clearAll(): void {
    this.notifService.clearAll();
  }
}
