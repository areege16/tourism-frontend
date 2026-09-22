import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetAllAttractionsComponent } from './Components/get-all-attractions/get-all-attractions.component';

const routes: Routes = [
  { path: '', component: GetAllAttractionsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttractionsRoutingModule { }