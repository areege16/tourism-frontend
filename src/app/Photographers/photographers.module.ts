import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { PhotographersRoutingModule } from './photographers-routing.module';
import { GetAllPhotographersComponent } from './Components/get-all-photographers/get-all-photographers.component';
import { DetailsComponent } from './Components/details/details.component';
import { CreateComponent } from './Components/create/create.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UpdateComponent } from './Components/update/update.component';

@NgModule({
  declarations: [
    GetAllPhotographersComponent,
    DetailsComponent,
    CreateComponent,
    UpdateComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PhotographersRoutingModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
})
export class PhotographersModule {}
