import { Component, OnInit } from '@angular/core';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { Hotel, UpdateHotelDto } from '../../Models/hotel';
import { HotelService } from '../../Services/hotel.service';
import { MatDialog } from '@angular/material/dialog';
import { UpdateComponent } from '../update/update.component';
import { ToastService } from '../../../Shared/Services/toast.service';
import { CreateComponent } from '../create/create.component';
import { DeleteComponent } from '../delete/delete.component';

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

  constructor(private hotelService: HotelService, private dialog: MatDialog ) {}

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
  openCreate(): void {
  const dialogRef = this.dialog.open(CreateComponent, {
    width: '640px',
    maxWidth: '95vw',
    panelClass: 'clay-dialog',
  });

  dialogRef.afterClosed().subscribe((isCreated: boolean) => {
    if (isCreated) {
      this.loadHotels();
    }
  });
}
  openUpdate(hotel: any): void {
  const dialogRef = this.dialog.open(UpdateComponent, {
    width: '640px',
    maxWidth: '95vw',
    panelClass: 'clay-dialog',
    data: { id: hotel.id } // <--- id بحرف صغير
  });

  dialogRef.afterClosed().subscribe((isUpdated: boolean) => {
    if (isUpdated) {
      this.loadHotels();
    }
  });
}
 

  opendelete(hotel: any): void {
  const dialogRef = this.dialog.open(DeleteComponent, {
    width: '640px',
    maxWidth: '95vw',
    panelClass: 'clay-dialog',
    data: { id: hotel.id } 
  });

  dialogRef.afterClosed().subscribe((isDeleted: boolean) => {
    if (isDeleted) {
      this.loadHotels();
    }
  });
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