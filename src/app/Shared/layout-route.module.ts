import { NgModule } from '@angular/core';
import { LayoutComponent } from './layout/layout.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'attractions', pathMatch: 'full' },
      {
        path: 'attractions',
        loadChildren: () =>
          import('../Attractions/attractions.module').then(
            (m) => m.AttractionsModule,
          ),
      },
      {
        path: 'statistics',
        loadComponent: () =>
          import('../Dashboard/Components/dashboard/dashboard.component').then(
            (c) => c.DashboardComponent,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('../Auth/Components/register/register.component').then(
            (c) => c.RegisterComponent,
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRouteModule {}
