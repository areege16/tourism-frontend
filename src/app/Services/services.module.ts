import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ServicesRoutingModule } from './services-routing.module';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ListComponent } from './Components/list/list.component';
import { CreateComponent } from './Components/create/create.component';
import { DeleteComponent } from './Components/delete/delete.component';
import { DetailsComponent } from './Components/details/details.component';
import { EditComponent } from './Components/edit/edit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ListComponent,CreateComponent,DeleteComponent,DetailsComponent,EditComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DatePipe,
    DecimalPipe,
    MatCheckboxModule,
    ServicesRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ServicesModule {}
