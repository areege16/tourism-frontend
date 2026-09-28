import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SouvenirsRoutingModule } from './souvenirs-routing.module';
import { GetAllShopsComponent } from './Components/get-all-shops/get-all-shops.component';
import { CreateComponent } from './Components/create/create.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DetailsComponent } from './Components/details/details.component';
import { UpdateComponent } from './Components/update/update.component';
import { ShopProductsComponent } from './Components/shop-products/shop-products.component';
import { CreateProductComponent } from './Components/create-product/create-product.component';

@NgModule({
  declarations: [GetAllShopsComponent, CreateComponent, DetailsComponent,UpdateComponent, ShopProductsComponent, CreateProductComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SouvenirsRoutingModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
})
export class SouvenirsModule {}
