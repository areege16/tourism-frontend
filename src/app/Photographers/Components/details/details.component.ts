import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Photographer } from '../../Models/photographer';
import { PhotographerService } from '../../Services/photographer.service';
import { apiUrl } from '../../../Shared/Env/env';
import { buildGoogleMapsUrl } from '../../../Shared/utils/maps.util';

@Component({
  selector: 'app-photographer-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  private photographerService = inject(PhotographerService);
  private dialogRef = inject(MatDialogRef<DetailsComponent>);
  readonly buildGoogleMapsUrl = buildGoogleMapsUrl;

  photographer: Photographer | null = null;
  isLoading = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }) {}

  ngOnInit(): void {
    this.loadPhotographer();
  }

  loadPhotographer(): void {
    this.isLoading = true;
    this.photographerService.getPhotographerById(this.data.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.photographer = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching photographer details:', err);
        this.isLoading = false;
      },
    });
  }

  getFullImageUrl(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${apiUrl}${path}`;
  }

  close(): void {
    this.dialogRef.close();
  }
}
