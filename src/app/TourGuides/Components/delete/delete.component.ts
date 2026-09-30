import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TourGuideService } from '../../Services/tour-guide.service';

@Component({
  selector: 'app-tour-guide-delete',
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss',
})
export class DeleteComponent {
  constructor(
    private dialogRef: MatDialogRef<DeleteComponent>,
    private tourGuideService: TourGuideService,
    @Inject(MAT_DIALOG_DATA) public data: { id?: string; title?: string },
  ) {}

  confirmDelete(): void {
    if (!this.data.id) {
      this.dialogRef.close(false);
      return;
    }

    this.tourGuideService.deleteTourGuide(this.data.id).subscribe({
      next: (success) => this.dialogRef.close(success),
      error: () => this.dialogRef.close(false),
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
