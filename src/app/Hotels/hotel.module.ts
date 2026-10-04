import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './Component/list/list.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HotelRouteModule } from './hotel-route.module';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DetailsComponent } from './Component/details/details.component';
import { CreateComponent } from './Component/create/create.component';
import { DeleteComponent } from './Component/delete/delete.component';
import { UpdateComponent } from './Component/update/update.component';



@NgModule({
  declarations: [ ListComponent,DetailsComponent,CreateComponent,UpdateComponent,DeleteComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    HotelRouteModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule
  ],
  exports: [ListComponent]
})

export class HotelModule { }
