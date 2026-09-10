import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TransactionItem {
  id: string;
  selected: boolean;
  name: string;
  category: string;
  date: string;
  method: string;
  amount: number;
  status: 'Completed' | 'Pending';
  icon: string;
  iconBg: string;
  iconColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private isModalOpenSubject = new BehaviorSubject<boolean>(false);
  isModalOpen$ = this.isModalOpenSubject.asObservable();

  private transactionsSubject = new BehaviorSubject<TransactionItem[]>([
    {
      id: 'tx-1',
      selected: false,
      name: 'Carrefour',
      category: 'Food & Dining',
      date: 'Aug 31, 2023',
      method: 'Card •••• 4242',
      amount: -54.80,
      status: 'Completed',
      icon: 'shopping_cart',
      iconBg: '#ede9fe',
      iconColor: '#6366f1'
    },
    {
      id: 'tx-2',
      selected: false,
      name: 'Salary',
      category: 'Income',
      date: 'Aug 30, 2023',
      method: 'Bank Transfer',
      amount: 2500.00,
      status: 'Completed',
      icon: 'payments',
      iconBg: '#dcfce7',
      iconColor: '#10b981'
    },
    {
      id: 'tx-3',
      selected: false,
      name: 'Netflix',
      category: 'Entertainment',
      date: 'Aug 28, 2023',
      method: 'Card •••• 4242',
      amount: -17.99,
      status: 'Completed',
      icon: 'movie',
      iconBg: '#ffe4e6',
      iconColor: '#f43f5e'
    },
    {
      id: 'tx-4',
      selected: false,
      name: 'Shell Station',
      category: 'Transportation',
      date: 'Aug 25, 2023',
      method: 'Card •••• 4242',
      amount: -42.50,
      status: 'Completed',
      icon: 'local_gas_station',
      iconBg: '#e0e7ff',
      iconColor: '#3b3bf5'
    }
  ]);

  transactions$ = this.transactionsSubject.asObservable();

  openModal(): void {
    this.isModalOpenSubject.next(true);
  }

  closeModal(): void {
    this.isModalOpenSubject.next(false);
  }

  addTransaction(tx: Omit<TransactionItem, 'id' | 'selected' | 'status'>): void {
    const newTx: TransactionItem = {
      ...tx,
      id: `tx-${Date.now()}`,
      selected: false,
      status: 'Completed'
    };
    const current = this.transactionsSubject.getValue();
    this.transactionsSubject.next([newTx, ...current]);
  }
}