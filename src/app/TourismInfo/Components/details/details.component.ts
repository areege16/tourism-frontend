import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TourismInfo } from '../../Models/tourism-info';
import { TourismInfoService } from '../../Services/tourism-info.service';

@Component({
  selector: 'app-tourism-info-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  info?: TourismInfo;
  isLoading = true;

  constructor(
    private tourismInfoService: TourismInfoService,
    private dialogRef: MatDialogRef<DetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { infoId?: string; info?: TourismInfo },
  ) {}

  ngOnInit(): void {
    if (this.data.info) {
      this.info = this.data.info;
      this.isLoading = false;
      return;
    }

    if (this.data.infoId) {
      this.tourismInfoService.getTourismInfoById(this.data.infoId).subscribe({
        next: (response) => {
          this.info = response;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
      return;
    }

    this.isLoading = false;
  }

  getTitle(): string {
    return this.info?.title?.ar || this.info?.title?.en || 'غير محدد';
  }

  getClimate(): string {
    return this.info?.climate?.ar || this.info?.climate?.en || '—';
  }

  getBestTimeToVisit(): string {
    return this.info?.bestTimeToVisit?.ar || this.info?.bestTimeToVisit?.en || '—';
  }

  getWhatToWear(): string {
    return this.info?.whatToWear?.ar || this.info?.whatToWear?.en || '—';
  }

  getNotes(): string {
    return this.info?.notes?.ar || this.info?.notes?.en || '—';
  }

  close(): void {
    this.dialogRef.close();
  }
}
