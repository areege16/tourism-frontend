import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestListComponent } from './Components/request-list/request-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RequestRouteModule } from './request-route.module';
import { CreateComponent } from './Components/create/create.component';
import { MAT_DATE_LOCALE, MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DetailsComponent } from './Components/details/details.component';
import { AddAttachmentComponent } from './Components/add-attachment/add-attachment.component';
import { MatDialogModule } from '@angular/material/dialog';


@NgModule({
  declarations: [RequestListComponent,CreateComponent,DetailsComponent,AddAttachmentComponent],
  imports: [
    CommonModule,
    RequestRouteModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatTooltipModule,
    MatTableModule,
    MatSelectModule,
    MatDatepickerModule,
    MatOptionModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    FormsModule
  ],
  exports: [RequestListComponent]
})
export class RequestModule { }
