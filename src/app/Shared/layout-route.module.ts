import { NgModule } from '@angular/core';
import { LayoutComponent } from './layout/layout.component';
import { Routes, RouterModule } from '@angular/router';



const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'citizens', pathMatch: 'full' },
    {
        path: 'citizens',
        loadChildren: () =>
            import('../Citizens/citizen.module').then(m => m.CitizenModule)
    },
    {
        path: 'violations',
        loadChildren: () =>
            import('../Requests/request.module').then(m => m.RequestModule)
    },
    {
      path:'statistics',
      loadComponent :() =>  import ('../Dashboard/Components/dashboard/dashboard.component') .then(c=>c.DashboardComponent)
    }
    ,
    {
      path:'register',
      loadComponent :() =>  import ('../Auth/Components/register/register.component') .then(c=>c.RegisterComponent)
    },
    {
      path : 'reports',
            loadComponent :() =>  import ('../Requests/Components/reports/reports.component') .then(c=>c.ReportsComponent)

    }
    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRouteModule { }
