import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ServiceService } from '../../Services/service.service';

@Component({
  selector: 'app-service-delete',
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss',
})
export class DeleteComponent {
  constructor(
    private dialogRef: MatDialogRef<DeleteComponent>,
    private serviceService: ServiceService,
    @Inject(MAT_DIALOG_DATA) public data: { id?: string; title?: string },
  ) {}

  confirmDelete(): void {
    if (!this.data.id) {
      this.dialogRef.close(false);
      return;
    }

    this.serviceService.deleteService(this.data.id).subscribe({
      next: (success) => this.dialogRef.close(success),
      error: () => this.dialogRef.close(false),
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
