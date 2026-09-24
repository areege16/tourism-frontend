import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Attraction } from '../../Models/attraction';
import { AttractionService } from '../../Services/attraction.service';
import { DetailsComponent } from '../details/details.component';
import { getFullImageUrl as resolveFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { UpdateComponent } from '../update/update.component';
import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-get-all-attractions',
  templateUrl: './get-all-attractions.component.html',
  styleUrl: './get-all-attractions.component.scss',
})
export class GetAllAttractionsComponent implements OnInit {
  private attractionService = inject(AttractionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  attractions: Attraction[] = [];
  displayedColumns: string[] = [
    'index',
    'name',
    'category',
    'rating',
    'actions',
  ];
  isLoading = false;
  failedImages = new Set<string>();

  ngOnInit(): void {
    this.loadAttractions();
  }

  loadAttractions(): void {
    this.isLoading = true;

    this.attractionService.getAllAttractions().subscribe({
      next: (res) => {
        if (res.success) {
          this.attractions = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching attractions:', err);
        this.isLoading = false;
      },
    });
  }

  getFullImageUrl(path: string): string {
    if (!path) return '';
    return resolveFullImageUrl(path);
  }

  hasImageError(imageUrl: string): boolean {
    return this.failedImages.has(imageUrl);
  }

  onImageError(imageUrl: string): void {
    this.failedImages.add(imageUrl);
  }

  createAttraction(): void {}
  openDetails(attraction: Attraction): void {
    this.dialog.open(DetailsComponent, {
      width: '700px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { id: attraction.id },
    });
  }
  openEdit(attraction: Attraction): void {
    const ref = this.dialog.open(UpdateComponent, {
      width: '760px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { id: attraction.id },
    });

    ref.afterClosed().subscribe((updated) => {
      if (updated) {
        this.loadAttractions(); // ترجع تحمّل القائمة بعد التحديث
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

      this.attractionService.deleteAttraction(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open('تم حذف المعلم السياحي بنجاح', 'إغلاق', {
              duration: 3000,
            });
            // هنا تعملي refresh للقايمة أو تشيلي العنصر من الـ array المحلي
          } else {
            this.snackBar.open(res.message || 'تعذر حذف المعلم', 'إغلاق', {
              duration: 3500,
            });
          }
        },
        error: () => {
          this.snackBar.open('حدث خطأ أثناء حذف المعلم', 'إغلاق', {
            duration: 3500,
          });
        },
      });
    });
  }
}
