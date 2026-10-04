import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DeleteDialogData } from '../../Models/events';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent{
  constructor(
    private dialogRef: MatDialogRef<DeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true); // إرجاع true عند التأكيد
  }

  onCancel(): void {
    this.dialogRef.close(false); // إرجاع false عند الإلغاء
  }
}