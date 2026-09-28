// get-all-shops.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SouvenirService } from '../../Services/souvenir.service';
import { SouvenirShop, SouvenirCategory } from '../../Models/souvenir-shop';
import { getFullImageUrl as resolveFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
import { DetailsComponent } from '../details/details.component';
import { UpdateComponent } from '../update/update.component';
import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShopProductsComponent } from '../shop-products/shop-products.component';

@Component({
  selector: 'app-get-all-shops',
  templateUrl: './get-all-shops.component.html',
  styleUrl: './get-all-shops.component.scss',
})
export class GetAllShopsComponent implements OnInit {
  private souvenirService = inject(SouvenirService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  shops: SouvenirShop[] = [];
  categories: SouvenirCategory[] = [];
  selectedCategory = 'all';

  displayedColumns: string[] = [
    'index',
    'name',
    'category',
    'rating',
    'actions',
  ];
  isLoading = false;
  failedImages = new Set<string>();

  get filteredShops(): SouvenirShop[] {
    return this.selectedCategory === 'all'
      ? this.shops
      : this.shops.filter((s) => s.category === this.selectedCategory);
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    forkJoin({
      shops: this.souvenirService.getAllShops(),
      categories: this.souvenirService.getCategories(),
    }).subscribe({
      next: ({ shops, categories }) => {
        if (shops.success) this.shops = shops.data;
        if (categories.success) this.categories = categories.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching souvenirs:', err);
        this.isLoading = false;
      },
    });
  }

  selectCategory(key: string): void {
    this.selectedCategory = key;
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

  createShop(): void {
    const ref = this.dialog.open(CreateComponent, {
      width: '760px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
    });

    ref.afterClosed().subscribe((created) => {
      if (created) this.loadData();
    });
  }

  openDetails(shop: SouvenirShop): void {
    this.dialog.open(DetailsComponent, {
      width: '700px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { id: shop.id },
    });
  }

  openEdit(shop: SouvenirShop): void {
    const ref = this.dialog.open(UpdateComponent, {
      width: '760px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { id: shop.id },
    });

    ref.afterClosed().subscribe((updated) => {
      if (updated) this.loadData();
    });
  }
  openDelete(id: string, name: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: `هل أنت متأكد من حذف "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
        confirmText: 'حذف',
        cancelText: 'إلغاء',
        confirmClass: 'btn-danger',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.souvenirService.deleteShop(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open('تم حذف المحل بنجاح', 'إغلاق', {
              duration: 3000,
            });
            this.shops = this.shops.filter((s) => s.id !== id);
          } else {
            this.snackBar.open(res.message || 'تعذر حذف المحل', 'إغلاق', {
              duration: 3500,
            });
          }
        },
        error: () => {
          this.snackBar.open('حدث خطأ أثناء حذف المحل', 'إغلاق', {
            duration: 3500,
          });
        },
      });
    });
  }

  openProducts(shop: SouvenirShop): void {
    this.dialog.open(ShopProductsComponent, {
      width: '760px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { shopId: shop.id, shopName: shop.nameAr },
    });
  }
}
