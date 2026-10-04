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
        path: 'blogposts',
        loadChildren: () =>
          import('../BlogPosts/blog-posts.module').then(
            (m) => m.BlogPostsModule,
          ),
      },
      {
        path: 'tourguides',
        loadChildren: () =>
          import('../TourGuides/tour-guides.module').then(
            (m) => m.TourGuidesModule,
          ),
      },
      {
        path: 'services',
        loadChildren: () =>
          import('../Services/services.module').then(
            (m) => m.ServicesModule,
          ),
      },
      {
        path: 'events',
        loadChildren: () =>
          import('../Events/event.module').then(
            (m) => m.EventModule,
          ),
      }
      ,
      {
        path: 'tourisminfo',
        loadChildren: () =>
          import('../TourismInfo/tourism-info.module').then(
            (m) => m.TourismInfoModule,
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
