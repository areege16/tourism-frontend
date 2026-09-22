import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetAllCitizensComponent } from './Components/get-all-citizens/get-all-citizens.component';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [

  { path: 'list', component: GetAllCitizensComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CitizenRouteModule { }
