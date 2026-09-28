import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Attraction } from '../../Models/attraction';
import { AttractionService } from '../../Services/attraction.service';
import { apiUrl } from '../../../Shared/Env/env';
import { buildGoogleMapsUrl } from '../../../Shared/utils/maps.util';

@Component({
  selector: 'app-attraction-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  private attractionService = inject(AttractionService);
  private dialogRef = inject(MatDialogRef<DetailsComponent>);

  readonly buildGoogleMapsUrl = buildGoogleMapsUrl;
  attraction: Attraction | null = null;
  isLoading = false;
  activeImage = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }) {}

  ngOnInit(): void {
    this.loadAttraction();
  }

  loadAttraction(): void {
    this.isLoading = true;
    this.attractionService.getAttractionById(this.data.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.attraction = res.data;
          this.activeImage = this.getFullImageUrl(this.attraction.imageUrl);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching attraction details:', err);
        this.isLoading = false;
      },
    });
  }

  getFullImageUrl(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${apiUrl}${path}`;
  }

  setActiveImage(path: string): void {
    this.activeImage = this.getFullImageUrl(path);
  }

  close(): void {
    this.dialogRef.close();
  }
}
