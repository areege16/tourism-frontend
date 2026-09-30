import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { ServiceItem } from '../../Models/service';
import { ServiceService } from '../../Services/service.service';
import { CreateComponent } from '../create/create.component';
import { DeleteComponent } from '../delete/delete.component';
import { DetailsComponent } from '../details/details.component';
import { EditComponent } from '../edit/edit.component';

@Component({
  selector: 'app-services-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  services: ServiceItem[] = [];
  filteredServices: ServiceItem[] = [];
  isLoading = true;
  searchTerm = '';
  failedImages = new Set<string>();

  displayedColumns: string[] = ['index', 'name', 'type', 'rating', 'phone', 'actions'];

  constructor(
    private serviceService: ServiceService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.serviceService.getServices().subscribe({
      next: (data) => {
        this.services = data || [];
        this.filteredServices = [...this.services];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredServices = [...this.services];
      return;
    }

    this.filteredServices = this.services.filter((service) => {
      const name = this.toText(service.name ?? service.nameAr);
      const description = this.toText(service.description ?? service.descriptionAr);
      const type = this.toText(service.type ?? service.typeAr);
      const features = (service.features ?? []).map((item) => this.toText(item)).join(' ');

      return [name, description, type, features].some((value) => this.toText(value).toLowerCase().includes(term));
    });
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

  getLocalizedText(value?: { ar?: string; en?: string } | string): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    return value.ar || value.en || '';
  }

  getArabicName(service: ServiceItem): string {
    return service.nameAr || service.name || 'غير محدد';
  }

  getArabicDescription(service: ServiceItem): string {
    return service.descriptionAr || service.description || '—';
  }

  getArabicType(service: ServiceItem): string {
    return service.typeAr || service.type || '—';
  }

  private toText(value: unknown): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object' && 'ar' in value && 'en' in value) {
      const localized = value as { ar?: string; en?: string };
      return localized.ar || localized.en || '';
    }

    return String(value);
  }

  openCreate(): void {
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '680px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadServices();
      }
    });
  }

  openEdit(service: ServiceItem): void {
    const dialogRef = this.dialog.open(EditComponent, {
      width: '680px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { service },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadServices();
      }
    });
  }

  openDetails(service: ServiceItem): void {
    this.dialog.open(DetailsComponent, {
      width: '760px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { serviceId: service.id },
    });
  }

  openDelete(service: ServiceItem): void {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '420px',
      maxWidth: '92vw',
      panelClass: 'clay-dialog',
      data: {
        id: service.id,
        title: service.nameAr || service.name || 'غير محدد',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadServices();
      }
    });
  }
}
