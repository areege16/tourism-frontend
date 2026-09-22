import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from '../../../Shared/Services/toast.service';
import { CitizenResponseDto } from '../../Models/citizen';
import { CitizenService } from '../../Services/citizen.service';

@Component({
  selector: 'app-delete',

  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {
  private dialogRef = inject(MatDialogRef<DeleteComponent>);
  private citizenService = inject(CitizenService);
  private toast = inject(ToastService);

  citizen: CitizenResponseDto;
  isDeleting = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { citizen: CitizenResponseDto }) {
    this.citizen = data.citizen;
  }

  onConfirmDelete(): void {
    this.isDeleting = true;

    this.citizenService.softDeleteCitizen(this.citizen.nationalID).subscribe({
      next: (message) => {
        this.isDeleting = false;
        this.toast.success(message || 'تم حذف سجل المواطن بنجاح');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isDeleting = false;
        const msg = err.error || 'حدث خطأ أثناء محاولة حذف السجل';
        this.toast.error(msg);
      }
    });
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

}