import { NgModule } from '@angular/core';
import { ListComponent } from './Components/list/list.component';
import { TourGuidesRoutingModule } from './tour-guides-routing.module';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HotelRouteModule } from '../Hotels/hotel-route.module';
import { EditComponent } from './Components/edit/edit.component';
import { CreateComponent } from './Components/create/create.component';
import { DeleteComponent } from './Components/delete/delete.component';
import { DetailsComponent } from './Components/details/details.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BlogPostsRoutingModule } from '../BlogPosts/blog-posts-routing.module';

@NgModule({
  declarations: [ ListComponent,EditComponent,CreateComponent,DeleteComponent,DetailsComponent],
  imports: [
    CommonModule,
     FormsModule,
     ReactiveFormsModule,
     TourGuidesRoutingModule,
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
     MatCheckboxModule
  ],
  exports: [ListComponent]
})

export class TourGuidesModule {}
