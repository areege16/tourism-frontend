import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Hotel } from '../../Models/hotel';
import { HotelService } from '../../Services/hotel.service';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<DetailsComponent>);
  public data = inject<{ id: string }>(MAT_DIALOG_DATA);
  private hotelService = inject(HotelService);

  hotel: Hotel | null = null;
  isLoading = true;
  hasError = false;
  imageErrors = new Set<string>();
  // معاينة الصورة الكبيرة عند النقر على صورة من المعرض
  selectedPreviewImage = '';
  readonly defaultPlaceholder = 'assets/images/placeholder-hotel.png'; // أو أي مسار صورة بديلة لديك
  ngOnInit(): void {
    if (this.data?.id) {
      this.fetchHotelDetails(this.data.id);
    } else {
      this.isLoading = false;
      this.hasError = true;
    }
  }

  fetchHotelDetails(id: string): void {
    this.isLoading = true;
    this.hasError = false;

    this.hotelService.getHotelById(id).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result) {
          this.hotel = result;
          this.selectedPreviewImage = result.imageUrl || '';
        } else {
          this.hasError = true;
        }
      },
      error: (err) => {
        console.error('Failed to load hotel details:', err);
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }
  getImage(path?: string): string {
    if (!path || this.imageErrors.has(path)) {
      return this.defaultPlaceholder;
    }
    return getFullImageUrl(path);
  }

  hasImageError(path?: string): boolean {
    return !path || this.imageErrors.has(path);
  }

  onImageError(path?: string, event?: Event): void {
    if (path) {
      this.imageErrors.add(path);
    }
    // تبديل المسار في عنصر الصورة مباشرة لمنع تكرار الـ loop في المتصفح
    if (event?.target) {
      (event.target as HTMLImageElement).src = this.defaultPlaceholder;
    }
  }

  selectImage(path: string): void {
    this.selectedPreviewImage = path;
  }

  openGoogleMaps(lat: number, lng: number, event: MouseEvent): void {
    event.stopPropagation();
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  }




  close(): void {
    this.dialogRef.close();
  }
}