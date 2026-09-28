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
        path: 'hotels',
        loadChildren: () =>
          import('../Hotels/hotel.module').then((m) => m.HotelModule),
      },
      {
        path: 'photographers',
        loadChildren: () =>
          import('../Photographers/photographers.module').then(
            (m) => m.PhotographersModule,
          ),
      },
      {
        path: 'restaurants',
        loadChildren: () =>
          import('../Restaurants/restaurants.module').then(
            (m) => m.RestaurantsModule,
          ),
      },
      {
        path: 'souvenirs',
        loadChildren: () =>
          import('../Souvenirs/souvenirs.module').then(
            (m) => m.SouvenirsModule,
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
