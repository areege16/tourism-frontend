import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetAllShopsComponent } from './Components/get-all-shops/get-all-shops.component';

const routes: Routes = [{ path: '', component: GetAllShopsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SouvenirsRoutingModule {}
