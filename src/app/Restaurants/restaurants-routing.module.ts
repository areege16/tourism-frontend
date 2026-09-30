import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetAllRestaurantsComponent } from './Components/get-all-restaurants/get-all-restaurants.component';

const routes: Routes = [
  {
    path: '',
    component: GetAllRestaurantsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RestaurantsRoutingModule {}