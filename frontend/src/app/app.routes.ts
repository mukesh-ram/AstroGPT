import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'chart',
    loadComponent: () => import('./features/chart/chart.component').then(m => m.ChartComponent)
  },
  { path: '**', redirectTo: '' }
];
