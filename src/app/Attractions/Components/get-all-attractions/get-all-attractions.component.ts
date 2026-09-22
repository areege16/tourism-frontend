import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Attraction } from '../../Models/attraction';
import { AttractionService } from '../../Services/attraction.service';
import { apiUrl } from '../../../Shared/Env/env';
import { DetailsComponent  } from '../details/details.component';

@Component({
  selector: 'app-get-all-attractions',
  templateUrl: './get-all-attractions.component.html',
  styleUrl: './get-all-attractions.component.scss'
})
export class GetAllAttractionsComponent implements OnInit {
  private attractionService = inject(AttractionService);
  private dialog = inject(MatDialog);

  attractions: Attraction[] = [];
  displayedColumns: string[] = ['index', 'name', 'category', 'rating', 'actions'];
  isLoading = false;
  failedImages = new Set<string>();

  ngOnInit(): void {
    this.loadAttractions();
  }

  loadAttractions(): void {
    this.isLoading = true;

    this.attractionService.getAllAttractions().subscribe({
      next: (res) => {
        if (res.success) {
          this.attractions = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching attractions:', err);
        this.isLoading = false;
      }
    });
  }

  getFullImageUrl(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${apiUrl}${path}`;
  }

  hasImageError(imageUrl: string): boolean {
    return this.failedImages.has(imageUrl);
  }

  onImageError(imageUrl: string): void {
    this.failedImages.add(imageUrl);
  }

  createAttraction(): void { }
  openDetails(attraction: Attraction): void {
  this.dialog.open(DetailsComponent, {
    width: '700px',
    maxWidth: '95vw',
    panelClass: 'clay-dialog',
    data: { id: attraction.id }
  });
}
  openEdit(attraction: Attraction): void { }
  openDelete(attraction: Attraction): void { }
}