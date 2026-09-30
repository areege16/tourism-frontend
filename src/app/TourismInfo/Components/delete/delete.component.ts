import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TourismInfoService } from '../../Services/tourism-info.service';

@Component({
  selector: 'app-tourism-info-delete',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss',
})
export class DeleteComponent implements OnInit {
  title = 'عنصر';

  constructor(
    private tourismInfoService: TourismInfoService,
    private dialogRef: MatDialogRef<DeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id?: string; title?: string },
  ) {}

  ngOnInit(): void {
    this.title = this.data.title || this.title;
  }

  confirm(): void {
    if (!this.data.id) {
      this.dialogRef.close(false);
      return;
    }

    this.tourismInfoService.deleteTourismInfo(this.data.id).subscribe({
      next: (success) => this.dialogRef.close(success),
      error: () => this.dialogRef.close(false),
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
