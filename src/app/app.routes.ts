import { Routes } from '@angular/router';
import { Dashboard } from './Dashboard/Dashboard';
import { Analytics } from './Analytics/Analytics';
import { Settings } from './Settings/Settings';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  {
    path: 'transactions',
    loadComponent: () => import('./Transaction/Transaction').then(m => m.Transaction)
  },
  { path: 'analytics', component: Analytics },
  {
    path: 'budgets',
    loadComponent: () => import('./Budget/Budget').then(m => m.Budget)
  },
  {
    path: 'categories',
    loadComponent: () => import('./Categories/Categories').then(m => m.Categories)
  },
  { path: 'settings', component: Settings },
  { path: '**', redirectTo: 'dashboard' }
];