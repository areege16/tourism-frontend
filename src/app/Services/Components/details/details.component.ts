import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { ServiceItem } from '../../Models/service';
import { ServiceService } from '../../Services/service.service';

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  service!: ServiceItem;
  isLoading = true;

  constructor(
    private dialogRef: MatDialogRef<DetailsComponent>,
    private serviceService: ServiceService,
    @Inject(MAT_DIALOG_DATA) public data: { service?: ServiceItem; serviceId?: string },
  ) {}

  ngOnInit(): void {
    const service = this.data.service;
    const serviceId = this.data.serviceId;

    if (service) {
      this.service = service;
      this.isLoading = false;
      return;
    }

    if (serviceId) {
      this.serviceService.getServiceById(serviceId).subscribe({
        next: (result) => {
          this.service = result ?? this.service;
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
      return value;
    }

    return value.ar || value.en || '';
  }

  getName(): string {
    return this.service?.nameAr || this.service?.name || 'غير محدد';
  }

  getType(): string {
    return this.service?.typeAr || this.service?.type || 'غير محدد';
  }

  getDescription(): string {
    return this.service?.descriptionAr || this.service?.description || 'لا يوجد وصف';
  }

  getAddress(): string {
    return this.service?.addressAr || this.service?.address || 'لا يوجد عنوان';
  }

  getSpecialty(): string {
    return this.service?.specialtyAr || this.service?.specialty || 'غير محدد';
  }

  getFeatures(): string[] {
    return (this.service?.featuresAr?.length ? this.service.featuresAr : this.service?.features ?? []).filter(Boolean);
  }

  getImage(path?: string): string {
    return getFullImageUrl(path || '');
  }

  close(): void {
    this.dialogRef.close();
  }
}
