import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Restaurant } from '../../Models/restaurant';
import { RestaurantService } from '../../Services/restaurant.service';
import { getFullImageUrl as resolveFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { CreateComponent } from '../create/create.component';
import { DetailsComponent } from '../details/details.component';
import { UpdateComponent } from '../update/update.component';
import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-get-all-restaurants',
  templateUrl: './get-all-restaurants.component.html',
  styleUrl: './get-all-restaurants.component.scss',
})
export class GetAllRestaurantsComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  restaurants: Restaurant[] = [];
  displayedColumns: string[] = [
    'index',
    'name',
    'cuisineType',
    'phone',
    'rating',
    'actions',
  ];
  isLoading = false;
  failedImages = new Set<string>();

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.isLoading = true;

    this.restaurantService.getAllRestaurants().subscribe({
      next: (res) => {
        if (res.success) {
          this.restaurants = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching restaurants:', err);
        this.isLoading = false;
      },
    });
  }

  getFullImageUrl(path: string): string {
    return resolveFullImageUrl(path);
  }

  hasImageError(imageUrl: string): boolean {
    return this.failedImages.has(imageUrl);
  }

  onImageError(imageUrl: string): void {
    this.failedImages.add(imageUrl);
  }

  createRestaurant(): void {
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.loadRestaurants();
      }
    });
  }

  openDetails(restaurant: Restaurant): void {
    this.dialog.open(DetailsComponent, {
      data: { id: restaurant.id },
      width: '600px',
    });
  }

  openEdit(restaurant: Restaurant): void {
    const dialogRef = this.dialog.open(UpdateComponent, {
      data: { id: restaurant.id },
      width: '800px',
    });

    dialogRef.afterClosed().subscribe((updated: boolean) => {
      if (updated) {
        this.loadRestaurants();
      }
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

      this.restaurantService.deleteRestaurant(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open('تم حذف المطعم بنجاح', 'إغلاق', {
              duration: 3000,
            });
            this.restaurants = this.restaurants.filter((r) => r.id !== id);
          } else {
            this.snackBar.open(res.message || 'تعذر حذف المطعم', 'إغلاق', {
              duration: 3500,
            });
          }
        },
        error: () => {
          this.snackBar.open('حدث خطأ أثناء حذف المطعم', 'إغلاق', {
            duration: 3500,
          });
        },
      });
    });
  }
}
