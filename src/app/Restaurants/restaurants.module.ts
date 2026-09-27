import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { RestaurantsRoutingModule } from './restaurants-routing.module';
import { GetAllRestaurantsComponent } from './Components/get-all-restaurants/get-all-restaurants.component';
import { CreateComponent } from './Components/create/create.component';
import { DetailsComponent } from './Components/details/details.component';
import { UpdateComponent } from './Components/update/update.component';

@NgModule({
  declarations: [
    DetailsComponent,
  ],
  imports: [
    CommonModule,
    RestaurantsRoutingModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    GetAllRestaurantsComponent,
    CreateComponent,
    UpdateComponent, 
  ],
})
export class RestaurantsModule {}