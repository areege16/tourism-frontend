import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TourismInfo } from '../../Models/tourism-info';
import { TourismInfoService } from '../../Services/tourism-info.service';
import { CreateComponent } from '../create/create.component';
import { DeleteComponent } from '../delete/delete.component';
import { DetailsComponent } from '../details/details.component';
import { EditComponent } from '../edit/edit.component';

@Component({
  selector: 'app-tourism-info-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  items: TourismInfo[] = [];
  filteredItems: TourismInfo[] = [];
  isLoading = true;
  searchTerm = '';

  displayedColumns: string[] = ['index', 'title', 'category', 'status', 'actions'];

  constructor(
    private tourismInfoService: TourismInfoService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.isLoading = true;
    this.tourismInfoService.getTourismInfo().subscribe({
      next: (data) => {
        this.items = data || [];
        this.filteredItems = [...this.items];
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
      this.filteredItems = [...this.items];
      return;
    }

    this.filteredItems = this.items.filter((item) => {
      const title = this.toText(item.title?.ar ?? item.title?.en);
      const climate = this.toText(item.climate?.ar ?? item.climate?.en);
      const notes = this.toText(item.notes?.ar ?? item.notes?.en);

      return [title, climate, notes].some((value) => value.toLowerCase().includes(term));
    });
  }

  getDisplayTitle(item: TourismInfo): string {
    return item.title?.ar || item.title?.en || 'غير محدد';
  }

  getDisplayClimate(item: TourismInfo): string {
    return item.climate?.ar || item.climate?.en || '—';
  }

  private toText(value: unknown): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    return String(value);
  }

  openCreate(): void {
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '780px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadItems();
      }
    });
  }

  openEdit(info: TourismInfo): void {
    const dialogRef = this.dialog.open(EditComponent, {
      width: '780px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { info },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadItems();
      }
    });
  }

  openDetails(info: TourismInfo): void {
    this.dialog.open(DetailsComponent, {
      width: '760px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { infoId: info.id },
    });
  }

  openDelete(info: TourismInfo): void {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '420px',
      maxWidth: '92vw',
      panelClass: 'clay-dialog',
      data: {
        id: info.id,
        title: this.getDisplayTitle(info),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadItems();
      }
    });
  }
}
