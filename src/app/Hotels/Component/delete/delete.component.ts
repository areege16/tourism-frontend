import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from '../../../Shared/Services/toast.service';
import { HotelService } from '../../Services/hotel.service';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {
  private dialogRef = inject(MatDialogRef<DeleteComponent>);
  private hotelService = inject(HotelService);
  private toastService = inject(ToastService);

  isDeleting: boolean = false;
  hotelId!: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.extractHotelId();
  }
  ngOnInit(): void {
    if (!this.hotelId) {
      this.extractHotelId();
    }

    if (!this.hotelId) {
      console.error('Hotel ID was not provided to UpdateComponent');
      return;
    }

  }

  private extractHotelId(): void {
    this.hotelId =
      this.data?.id ||
      this.data?.Id ||
      this.data?.hotel?.id ||
      this.data?.hotel?.Id;
  }
  onConfirmDelete(): void {
    if (!this.hotelId || this.isDeleting) return;

    this.isDeleting = true;

    this.hotelService.deleteHotel(this.hotelId).subscribe({
      next: (res) => {
        this.isDeleting = false;
        if (res.success) {
          this.toastService.success('تم حذف الفندق بنجاح');
          this.dialogRef.close(true);
        } else {
          this.toastService.error(res.message || 'تعذر حذف الفندق');
        }
      },
      error: (err) => {
        this.isDeleting = false;
        console.error('Error deleting hotel:', err);
        this.toastService.error('حدث خطأ أثناء محاولة حذف الفندق من الخادم');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}