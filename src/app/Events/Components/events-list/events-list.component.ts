import { Component, OnInit } from '@angular/core';
import { TourismEventDto } from '../../Models/events';
import { EventService } from '../../Services/event.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { DeleteComponent } from '../delete/delete.component';
import { UpdateComponent } from '../update/update.component';
import { DetailsComponent } from '../details/details.component';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss'
})
export class EventsListComponent implements OnInit {
  events: TourismEventDto[] = [];
  isLoading = true;
  searchTerm = '';

  displayedColumns: string[] = [
    'index',
    'name',
    'category',
    'location',
    'startDate',
    'ticketPrice',
    'actions'
  ];
  failedImages = new Set<string>();

  constructor(private eventService: EventService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getAllEvents().subscribe({
      next: (res) => {
        if (res?.success) {
          this.events = res.data || [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching events:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredEvents(): TourismEventDto[] {
    if (!this.searchTerm.trim()) {
      return this.events;
    }
    const term = this.searchTerm.toLowerCase();
    return this.events.filter(e =>
      e.name?.ar?.toLowerCase().includes(term) ||
      e.name?.en?.toLowerCase().includes(term) ||
      e.location?.ar?.toLowerCase().includes(term) ||
      e.category?.ar?.toLowerCase().includes(term)
    );
  }
  get freeEventsCount(): number {
    return this.events.filter(e => e.isFree).length;
  }

  getImage(path?: string): string {
    return getFullImageUrl(path || '');
  }

  hasImageError(url?: string): boolean {
    return !url || this.failedImages.has(url);
  }

  onImageError(url?: string): void {
    if (url) {
      this.failedImages.add(url);
    }
  }


  openDetails(event: TourismEventDto): void {
    this.dialog.open(DetailsComponent, {
      width: '680px',
      maxWidth: '92vw',
      panelClass: 'clay-dialog',
      data: event
    });
  }
  openEdit(event: TourismEventDto): void {
    const dialogRef = this.dialog.open(UpdateComponent, {
      width: '720px',
      maxWidth: '92vw',
      panelClass: 'clay-dialog',
      data: event
    });

    dialogRef.afterClosed().subscribe((updated: boolean) => {
      if (updated) {
        this.loadEvents();
      }
    });
  }
  getLocalizedText(value?: { ar?: string; en?: string }): string {
    if (!value) {
      return '';
    }

    return value.ar || value.en || '';
  }

  openCreate(): void {
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '680px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEvents();
      }
    });
  }


  openDelete(event: TourismEventDto): void {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '420px',
      maxWidth: '92vw',
      panelClass: 'clay-dialog',
      data: {
        id: event.id,
        title: this.getLocalizedText(event.name),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // تنفيذ عملية الحذف هنا عند التأكيد
        this.eventService.deleteEvent(event.id).subscribe({
          next: (res) => {
            if (res?.success) {
              this.loadEvents(); // إعادة تحميل البيانات
            }
          },
          error: (err) => {
            console.error('Error deleting event:', err);
          }
        });
      }
    });
  }
}