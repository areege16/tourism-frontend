// shop-products.component.ts
import { Component, inject, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SouvenirService } from '../../Services/souvenir.service';
import { SouvenirProduct } from '../../Models/souvenir-shop';
import { getFullImageUrl as resolveFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';
import { CreateProductComponent } from '../create-product/create-product.component';

@Component({
  selector: 'app-shop-products',
  templateUrl: './shop-products.component.html',
  styleUrl: './shop-products.component.scss',
})
export class ShopProductsComponent implements OnInit {
  private souvenirService = inject(SouvenirService);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<ShopProductsComponent>);
  private snackBar = inject(MatSnackBar);

  products: SouvenirProduct[] = [];
  isLoading = false;
  failedImages = new Set<string>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { shopId: string; shopName: string },
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.souvenirService.getShopProducts(this.data.shopId).subscribe({
      next: (res) => {
        if (res.success) this.products = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.isLoading = false;
      },
    });
  }

  getFullImageUrl(path: string): string {
    return path ? resolveFullImageUrl(path) : '';
  }

  hasImageError(url: string): boolean {
    return this.failedImages.has(url);
  }

  onImageError(url: string): void {
    this.failedImages.add(url);
  }

  addProduct(): void {
    const ref = this.dialog.open(CreateProductComponent, {
      width: '700px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { shopId: this.data.shopId },
    });

    ref.afterClosed().subscribe((created) => {
      if (created) this.loadProducts();
    });
  }
  openDelete(product: SouvenirProduct): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: `هل أنت متأكد من حذف المنتج "${product.nameAr}"؟`,
        confirmText: 'حذف',
        cancelText: 'إلغاء',
        confirmClass: 'btn-danger',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.souvenirService.deleteProduct(product.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open('تم حذف المنتج بنجاح', 'إغلاق', {
              duration: 3000,
            });
            this.products = this.products.filter((p) => p.id !== product.id);
          } else {
            this.snackBar.open(res.message || 'تعذر حذف المنتج', 'إغلاق', {
              duration: 3500,
            });
          }
        },
        error: () => {
          this.snackBar.open('حدث خطأ أثناء حذف المنتج', 'إغلاق', {
            duration: 3500,
          });
        },
      });
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
