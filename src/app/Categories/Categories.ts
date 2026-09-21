import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TransactionService, CategoryItem } from '../services/transaction.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Categories.html',
  styleUrl: './Categories.css'
})
export class Categories implements OnInit, OnDestroy {
  private txService = inject(TransactionService);
  private sub = new Subscription();

  categories: CategoryItem[] = [];
  currency = '€';

  isDeleteModalOpen = false;
  categoryToDelete: CategoryItem | null = null;

  isAddEditModalOpen = false;
  isEditMode = false;
  currentEditId: string | null = null;
  formCategoryName = '';
  formCategoryIcon = 'category';
  formCategoryType: 'spent' | 'earned' = 'spent';

  ngOnInit(): void {
    this.sub.add(
      this.txService.categories$.subscribe(cats => (this.categories = cats))
    );
    this.sub.add(
      this.txService.currency$.subscribe(curr => (this.currency = curr))
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  openCreateCategoryModal(): void {
    this.isEditMode = false;
    this.currentEditId = null;
    this.formCategoryName = '';
    this.formCategoryIcon = 'category';
    this.formCategoryType = 'spent';
    this.isAddEditModalOpen = true;
  }

  openEditCategoryModal(cat: CategoryItem): void {
    this.isEditMode = true;
    this.currentEditId = cat.id;
    this.formCategoryName = cat.name;
    this.formCategoryIcon = cat.icon;
    this.formCategoryType = cat.type;
    this.isAddEditModalOpen = true;
  }

  closeAddEditModal(): void {
    this.isAddEditModalOpen = false;
  }

  saveCategory(): void {
    if (!this.formCategoryName.trim()) return;

    const isIncome = this.formCategoryType === 'earned';
    const existing = this.categories.find(c => c.id === this.currentEditId);

    const itemToSave: CategoryItem = {
      id: this.currentEditId || `cat-${Date.now()}`,
      name: this.formCategoryName.trim(),
      transactionsCount: existing ? existing.transactionsCount : 0,
      spentAmount: existing ? existing.spentAmount : 0,
      type: this.formCategoryType,
      icon: this.formCategoryIcon,
      iconBg: isIncome ? '#dcfce7' : '#ede9fe',
      iconColor: isIncome ? '#10b981' : '#6366f1'
    };

    this.txService.saveCategory(itemToSave);
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
      this.txService.deleteCategory(this.categoryToDelete.id);
    }
    this.closeDeleteModal();
  }
}