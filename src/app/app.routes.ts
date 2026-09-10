import { Routes } from '@angular/router';
import { Dashboard } from './Dashboard/Dashboard';
import { Transaction } from './Transaction/Transaction';
import { Analytics } from './Analytics/Analytics';
import { Budget } from './Budget/Budget';
import { Categories } from './Categories/Categories';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'transactions', component: Transaction },
  { path: 'analytics', component: Analytics },
  { path: 'budget', component: Budget },
  { path: 'categories', component: Categories }
];