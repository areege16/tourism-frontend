import { Component, OnInit } from '@angular/core';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { Hotel } from '../../Models/hotel';
import { HotelService } from '../../Services/hotel.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  hotels: Hotel[] = [];
  filteredHotels: Hotel[] = [];
  isLoading: boolean = true;
  searchTerm: string = '';
  
  // Set لتسجيل الصور التي تفشل في التحميل لمنع تكرار الخطأ وعرض الـ fallback
  imageErrors = new Set<string>();

  displayedColumns: string[] = ['index', 'name', 'rating', 'priceRange', 'actions'];

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(refresh: boolean = false): void {
    this.isLoading = true;
    this.hotelService.getHotels(refresh).subscribe({
      next: (data) => {
        this.hotels = data || [];
        this.filteredHotels = [...this.hotels];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredHotels = [...this.hotels];
      return;
    }

    this.filteredHotels = this.hotels.filter(hotel =>
      hotel.name?.ar?.toLowerCase().includes(term) ||
      hotel.name?.en?.toLowerCase().includes(term) ||
      hotel.priceRange?.ar?.toLowerCase().includes(term) ||
      hotel.priceRange?.en?.toLowerCase().includes(term)
    );
  }

  getImage(path?: string): string {
    return getFullImageUrl(path || '');
  }

  hasImageError(url?: string): boolean {
    return !url || this.imageErrors.has(url);
  }

  onImageError(url?: string): void {
    if (url) {
      this.imageErrors.add(url);
    }
  }

  openGoogleMaps(lat: number, lng: number, event: MouseEvent): void {
    event.stopPropagation();
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  }

  onDelete(id: string): void {
    console.log('Delete hotel:', id);
  }
}