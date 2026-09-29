import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Photographer } from '../../Models/photographer';
import { PhotographerService } from '../../Services/photographer.service';
import { getFullImageUrl as resolveFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { ConfirmDialogComponent } from '../../../Shared/Components/confirm-dialog/confirm-dialog.component';
import { DetailsComponent } from '../details/details.component';
import { UpdateComponent } from '../update/update.component';
import { CreateComponent } from '../create/create.component';

@Component({
  selector: 'app-get-all-photographers',
  templateUrl: './get-all-photographers.component.html',
  styleUrl: './get-all-photographers.component.scss',
})
export class GetAllPhotographersComponent implements OnInit {
  private photographerService = inject(PhotographerService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  photographers: Photographer[] = [];
  displayedColumns: string[] = ['index', 'name', 'phone', 'rating', 'actions'];
  isLoading = false;
  failedImages = new Set<string>();

  ngOnInit(): void {
    this.loadPhotographers();
  }

  loadPhotographers(): void {
    this.isLoading = true;

    this.photographerService.getAllPhotographers().subscribe({
      next: (res) => {
        if (res.success) {
          this.photographers = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching photographers:', err);
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

  createPhotographer(): void {
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((created) => {
      if (created) {
        this.loadPhotographers();
      }
    });
  }

  openDetails(photographer: Photographer): void {
    this.dialog.open(DetailsComponent, {
      data: { id: photographer.id },
      width: '600px',
    });
  }

  openEdit(photographer: Photographer): void {
    const dialogRef = this.dialog.open(UpdateComponent, {
      data: { id: photographer.id },
      width: '700px',
    });

    dialogRef.afterClosed().subscribe((updated: boolean) => {
      if (updated) {
        this.loadPhotographers();
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

      this.photographerService.deletePhotographer(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open('تم حذف المصور بنجاح', 'إغلاق', {
              duration: 3000,
            });
            this.photographers = this.photographers.filter((p) => p.id !== id);
          } else {
            this.snackBar.open(res.message || 'تعذر حذف المصور', 'إغلاق', {
              duration: 3500,
            });
          }
        },
        error: () => {
          this.snackBar.open('حدث خطأ أثناء حذف المصور', 'إغلاق', {
            duration: 3500,
          });
        },
      });
    });
  }
}
