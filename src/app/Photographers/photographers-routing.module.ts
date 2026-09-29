import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetAllPhotographersComponent } from './Components/get-all-photographers/get-all-photographers.component';

const routes: Routes = [
  {
    path: '',
    component: GetAllPhotographersComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PhotographersRoutingModule {}
