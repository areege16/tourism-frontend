import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ListComponent } from './Components/list/list.component';
import { BlogPostsRoutingModule } from './blog-posts-routing.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CreateComponent } from './Components/create/create.component';
import { DeleteComponent } from './Components/delete/delete.component';
import { DetailsComponent } from './Components/details/details.component';
import { EditComponent } from './Components/edit/edit.component';

@NgModule({
  declarations: [ListComponent,CreateComponent,DeleteComponent,DetailsComponent,EditComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BlogPostsRoutingModule,
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BlogPostsModule {}
