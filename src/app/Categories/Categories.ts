import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../services/transaction.service';

export interface CategoryItem {
  id: string;
  name: string;
  transactionsCount: number;
  spentAmount: number;
  type: 'spent' | 'earned';
  icon: string;
  iconBg: string;
  iconColor: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Categories.html',
  styleUrl: './Categories.css'
})
export class Categories {
  private txService = inject(TransactionService);

  categories: CategoryItem[] = [
    {
      id: 'cat-1',
      name: 'Food & Dining',
      transactionsCount: 42,
      spentAmount: 1240.50,
      type: 'spent',
      icon: 'restaurant',
      iconBg: '#ede9fe',
      iconColor: '#6366f1'
    },
    {
      id: 'cat-2',
      name: 'Transport',
      transactionsCount: 18,
      spentAmount: 340.00,
      type: 'spent',
      icon: 'directions_car',
      iconBg: '#ede9fe',
      iconColor: '#6366f1'
    },
    {
      id: 'cat-3',
      name: 'Shopping',
      transactionsCount: 24,
      spentAmount: 890.20,
      type: 'spent',
      icon: 'shopping_bag',
      iconBg: '#ede9fe',
      iconColor: '#6366f1'
    },
    {
      id: 'cat-4',
      name: 'Bills & Utilities',
      transactionsCount: 8,
      spentAmount: 450.00,
      type: 'spent',
      icon: 'receipt_long',
      iconBg: '#ede9fe',
      iconColor: '#6366f1'
    },
    {
      id: 'cat-5',
      name: 'Entertainment',
      transactionsCount: 12,
      spentAmount: 210.00,
      type: 'spent',
      icon: 'movie',
      iconBg: '#ede9fe',
      iconColor: '#6366f1'
    },
    {
      id: 'cat-6',
      name: 'Health & Wellness',
      transactionsCount: 5,
      spentAmount: 150.00,
      type: 'spent',
      icon: 'favorite',
      iconBg: '#ede9fe',
      iconColor: '#6366f1'
    },
    {
      id: 'cat-7',
      name: 'Education',
      transactionsCount: 2,
      spentAmount: 80.00,
      type: 'spent',
      icon: 'school',
      iconBg: '#ede9fe',
      iconColor: '#6366f1'
    },
    {
      id: 'cat-8',
      name: 'Travel',
      transactionsCount: 4,
      spentAmount: 1850.00,
      type: 'spent',
      icon: 'flight',
      iconBg: '#ede9fe',
      iconColor: '#6366f1'
    },
    {
      id: 'cat-9',
      name: 'Income',
      transactionsCount: 3,
      spentAmount: 4500.00,
      type: 'earned',
      icon: 'payments',
      iconBg: '#dcfce7',
      iconColor: '#10b981'
    }
  ];

  // Delete Modal State
  isDeleteModalOpen = false;
  categoryToDelete: CategoryItem | null = null;

  // Add / Edit Modal State
  isAddEditModalOpen = false;
  isEditMode = false;
  currentEditId: string | null = null;
  formCategoryName = '';
  formCategoryAmount: number | null = null;
  formCategoryIcon = 'category';
  formCategoryType: 'spent' | 'earned' = 'spent';

  openAddModal(): void {
    this.txService.openModal();
  }

  openCreateCategoryModal(): void {
    this.isEditMode = false;
    this.currentEditId = null;
    this.formCategoryName = '';
    this.formCategoryAmount = null;
    this.formCategoryIcon = 'category';
    this.formCategoryType = 'spent';
    this.isAddEditModalOpen = true;
  }

  openEditCategoryModal(cat: CategoryItem): void {
    this.isEditMode = true;
    this.currentEditId = cat.id;
    this.formCategoryName = cat.name;
    this.formCategoryAmount = cat.spentAmount;
    this.formCategoryIcon = cat.icon;
    this.formCategoryType = cat.type;
    this.isAddEditModalOpen = true;
  }

  closeAddEditModal(): void {
    this.isAddEditModalOpen = false;
  }

  saveCategory(): void {
    if (!this.formCategoryName.trim()) return;

    const assignedAmount = this.formCategoryAmount ? Math.abs(this.formCategoryAmount) : 0;

    if (this.isEditMode && this.currentEditId) {
      const existing = this.categories.find(c => c.id === this.currentEditId);
      if (existing) {
        existing.name = this.formCategoryName.trim();
        existing.spentAmount = assignedAmount;
        existing.icon = this.formCategoryIcon;
        existing.type = this.formCategoryType;
      }
    } else {
      const isIncome = this.formCategoryType === 'earned';
      const newCategory: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: this.formCategoryName.trim(),
        transactionsCount: 0,
        spentAmount: assignedAmount,
        type: this.formCategoryType,
        icon: this.formCategoryIcon,
        iconBg: isIncome ? '#dcfce7' : '#ede9fe',
        iconColor: isIncome ? '#10b981' : '#6366f1'
      };
      this.categories.push(newCategory);
    }
    this.closeAddEditModal();
  }

  openDeleteModal(cat: CategoryItem): void {
    this.categoryToDelete = cat;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.categoryToDelete = null;
  }

  confirmDelete(): void {
    if (this.categoryToDelete) {
      this.categories = this.categories.filter(c => c.id !== this.categoryToDelete!.id);
    }
    this.closeDeleteModal();
  }
}