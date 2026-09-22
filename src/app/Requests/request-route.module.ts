import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { RequestListComponent } from './Components/request-list/request-list.component';
import { CreateComponent } from './Components/create/create.component';



const routes: Routes = [

  { path: 'list', component: RequestListComponent },
  { path: 'create', component: CreateComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class RequestRouteModule { }
