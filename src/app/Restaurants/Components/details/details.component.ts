import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Restaurant } from '../../Models/restaurant';
import { RestaurantService } from '../../Services/restaurant.service';
import { apiUrl } from '../../../Shared/Env/env';

@Component({
  selector: 'app-restaurant-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  private dialogRef = inject(MatDialogRef<DetailsComponent>);

  restaurant: Restaurant | null = null;
  isLoading = false;
  activeImage = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }) {}

  ngOnInit(): void {
    this.loadRestaurant();
  }

  loadRestaurant(): void {
    this.isLoading = true;
    this.restaurantService.getRestaurantById(this.data.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.restaurant = res.data;
          this.activeImage = this.getFullImageUrl(this.restaurant.imageUrl);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching restaurant details:', err);
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

  getGoogleMapsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  close(): void {
    this.dialogRef.close();
  }
}