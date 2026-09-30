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
import { TourGuide } from '../../Models/tour-guide';
import { TourGuideService } from '../../Services/tour-guide.service';
import { CreateComponent } from '../create/create.component';
import { DeleteComponent } from '../delete/delete.component';
import { DetailsComponent } from '../details/details.component';
import { EditComponent } from '../edit/edit.component';

@Component({
  selector: 'app-tour-guides-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  guides: TourGuide[] = [];
  filteredGuides: TourGuide[] = [];
  isLoading = true;
  searchTerm = '';
  failedImages = new Set<string>();

  displayedColumns: string[] = ['index', 'name', 'expertise', 'phone', 'languages', 'actions'];

  constructor(
    private tourGuideService: TourGuideService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadGuides();
  }

  loadGuides(): void {
    this.isLoading = true;
    this.tourGuideService.getTourGuides().subscribe({
      next: (data) => {
        this.guides = data || [];
        this.filteredGuides = [...this.guides];
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
      this.filteredGuides = [...this.guides];
      return;
    }

    this.filteredGuides = this.guides.filter((guide) => {
      const fullName = this.toText(guide.name ?? guide.fullName);
      const expertise = this.toText(guide.expertise);
      const email = this.toText(guide.email);
      const languages = (guide.languages ?? []).map((item) => this.toText(item)).join(' ');

      return [fullName, expertise, email, languages].some((value) => this.toText(value).toLowerCase().includes(term));
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
        this.loadGuides();
      }
    });
  }

  openEdit(guide: TourGuide): void {
    const dialogRef = this.dialog.open(EditComponent, {
      width: '680px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { guide },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadGuides();
      }
    });
  }

  openDetails(guide: TourGuide): void {
    this.dialog.open(DetailsComponent, {
      width: '760px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { guideId: guide.id },
    });
  }

  openDelete(guide: TourGuide): void {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '420px',
      maxWidth: '92vw',
      panelClass: 'clay-dialog',
      data: {
        id: guide.id,
        title: this.getLocalizedText(guide.fullName),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadGuides();
      }
    });
  }
}
