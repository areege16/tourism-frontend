import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SouvenirShop } from '../../Models/souvenir-shop';
import { SouvenirService } from '../../Services/souvenir.service';
import { getFullImageUrl as resolveFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { buildGoogleMapsUrl } from '../../../Shared/utils/maps.util';

@Component({
  selector: 'app-souvenir-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  private souvenirService = inject(SouvenirService);
  private dialogRef = inject(MatDialogRef<DetailsComponent>);
  readonly buildGoogleMapsUrl = buildGoogleMapsUrl;

  shop: SouvenirShop | null = null;
  isLoading = false;
  activeImage = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }) {}

  ngOnInit(): void {
    this.loadShop();
  }

  loadShop(): void {
    this.isLoading = true;
    this.souvenirService.getShopById(this.data.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.shop = res.data;
          this.activeImage = this.getFullImageUrl(this.shop.image);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching shop details:', err);
        this.isLoading = false;
      },
    });
  }

  getFullImageUrl(path: string): string {
    return path ? resolveFullImageUrl(path) : '';
  }

  setActiveImage(path: string): void {
    this.activeImage = this.getFullImageUrl(path);
  }

  close(): void {
    this.dialogRef.close();
  }
}