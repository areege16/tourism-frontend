import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { TourGuide } from '../../Models/tour-guide';
import { TourGuideService } from '../../Services/tour-guide.service';

@Component({
  selector: 'app-tour-guide-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  guide!: TourGuide;
  isLoading = true;

  constructor(
    private dialogRef: MatDialogRef<DetailsComponent>,
    private tourGuideService: TourGuideService,
    @Inject(MAT_DIALOG_DATA) public data: { guide?: TourGuide; guideId?: string },
  ) {}

  ngOnInit(): void {
    const guide = this.data.guide;
    const guideId = this.data.guideId;

    if (guide) {
      this.guide = guide;
      this.isLoading = false;
      return;
    }

    if (guideId) {
      this.tourGuideService.getTourGuideById(guideId).subscribe({
        next: (result) => {
          this.guide = result ?? this.guide;
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

  getLocalizedText(value?: { ar?: string; en?: string } | string): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      const normalized = value.trim();
      if (!normalized || normalized.toLowerCase() === 'string' || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined' || normalized.toLowerCase().includes('localhost:4200/string')) {
        return '';
      }
      return normalized;
    }

    const localized = value.ar || value.en || '';
    return localized.trim() && localized.toLowerCase() !== 'string' ? localized : '';
  }

  getDisplayName(): string {
    return this.getLocalizedText(this.guide?.name ?? this.guide?.fullName) || 'بدون اسم';
  }

  getDisplayBio(): string {
    return this.getLocalizedText(this.guide?.bio) || '—';
  }

  getDisplayEmail(): string {
    return this.getLocalizedText(this.guide?.email) || '—';
  }

  getDisplayPhone(): string {
    return this.getLocalizedText(this.guide?.phone) || '—';
  }

  getDisplayAddress(): string {
    return this.getLocalizedText(this.guide?.location?.address) || '—';
  }

  getLanguages(): string[] {
    return this.guide?.languages?.length ? this.guide.languages : [];
  }

  getImage(path?: string): string {
    return getFullImageUrl(path || '');
  }

  getLocationAddress(): string {
    return this.getDisplayAddress();
  }

  close(): void {
    this.dialogRef.close();
  }
}
