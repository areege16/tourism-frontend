import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AttractionsRoutingModule } from './attractions-routing.module';
import { GetAllAttractionsComponent } from './Components/get-all-attractions/get-all-attractions.component';
import { DetailsComponent } from './Components/details/details.component';

@NgModule({
  declarations: [
    GetAllAttractionsComponent,
    // CreateComponent,
    // EditComponent,
    // DeleteComponent,
    DetailsComponent
  ],
  imports: [
    CommonModule,
    AttractionsRoutingModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule
  ]
})
export class AttractionsModule { }