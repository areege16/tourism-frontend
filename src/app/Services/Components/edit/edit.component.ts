import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ServiceItem } from '../../Models/service';
import { ServiceService } from '../../Services/service.service';

@Component({
  selector: 'app-service-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class EditComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditComponent>,
    private serviceService: ServiceService,
    @Inject(MAT_DIALOG_DATA) public data: { service: ServiceItem },
  ) {}

  private getLocalizedValue(value: unknown): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const localized = value as { ar?: string; en?: string };
      return localized.ar || localized.en || '';
    }

    return String(value);
  }

  ngOnInit(): void {
    const service = this.data.service;
    const openingHours = service.openingHours ?? {};
    const openingHoursEn = openingHours.en ?? openingHours.EN ?? {};
    const openingHoursAr = openingHours.ar ?? openingHours.AR ?? {};

    this.form = this.fb.group({
      name: [service.name || '', Validators.required],
      nameAr: [service.nameAr || service.name || '', Validators.required],
      type: [service.type || '', Validators.required],
      typeAr: [service.typeAr || service.type || '', Validators.required],
      description: [service.description || ''],
      descriptionAr: [service.descriptionAr || service.description || ''],
      address: [service.address || ''],
      addressAr: [service.addressAr || service.address || ''],
      phone: [service.phone || ''],
      email: [service.email || ''],
      image: [service.image || ''],
      existingImage: [service.image || ''],
      imageFile: [null],
      latitude: [service.latitude ?? 0],
      longitude: [service.longitude ?? 0],
      distanceKm: [service.distanceKm ?? 0],
      rating: [service.rating ?? 0],
      is24h: [Boolean(service.is24h)],
      isEmergency: [Boolean(service.isEmergency)],
      isFeatured: [Boolean(service.isFeatured)],
      features: [(service.features ?? []).join(',')],
      featuresAr: [(service.featuresAr ?? []).join(',')],
      commentsCount: [service.commentsCount ?? 0],
      specialty: [service.specialty || ''],
      specialtyAr: [service.specialtyAr || service.specialty || ''],
      hasDelivery: [Boolean(service.hasDelivery)],
      acceptsInsurance: [Boolean(service.acceptsInsurance)],
      openingHoursEnMonday: [openingHoursEn.Monday ?? ''],
      openingHoursEnTuesday: [openingHoursEn.Tuesday ?? ''],
      openingHoursEnWednesday: [openingHoursEn.Wednesday ?? ''],
      openingHoursEnThursday: [openingHoursEn.Thursday ?? ''],
      openingHoursEnFriday: [openingHoursEn.Friday ?? ''],
      openingHoursEnSaturday: [openingHoursEn.Saturday ?? ''],
      openingHoursEnSunday: [openingHoursEn.Sunday ?? ''],
      openingHoursArMonday: [openingHoursAr.Monday ?? ''],
      openingHoursArTuesday: [openingHoursAr.Tuesday ?? ''],
      openingHoursArWednesday: [openingHoursAr.Wednesday ?? ''],
      openingHoursArThursday: [openingHoursAr.Thursday ?? ''],
      openingHoursArFriday: [openingHoursAr.Friday ?? ''],
      openingHoursArSaturday: [openingHoursAr.Saturday ?? ''],
      openingHoursArSunday: [openingHoursAr.Sunday ?? ''],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const formData = new FormData();

    const appendText = (key: string, fieldValue: any): void => {
      if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
        formData.append(key, String(fieldValue));
      }
    };

    const appendArray = (key: string, fieldValue: unknown): void => {
      const list = Array.isArray(fieldValue)
        ? fieldValue
        : String(fieldValue ?? '')
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0);

      list.forEach((item: string) => formData.append(key, item));
    };

    appendText('Id', this.data.service.id ?? '');
    appendText('Name', value.name);
    appendText('NameAr', value.nameAr);
    appendText('Type', value.type);
    appendText('TypeAr', value.typeAr);
    appendText('Description', value.description);
    appendText('DescriptionAr', value.descriptionAr);
    appendText('Address', value.address);
    appendText('AddressAr', value.addressAr);
    appendText('Phone', value.phone);
    appendText('Email', value.email);
    appendText('ExistingImage', this.data.service.image || value.image || '');
    appendText('Latitude', Number(value.latitude ?? 0));
    appendText('Longitude', Number(value.longitude ?? 0));
    appendText('DistanceKm', Number(value.distanceKm ?? 0));
    appendText('Rating', Number(value.rating ?? 0));
    appendText('Is24h', Boolean(value.is24h));
    appendText('IsEmergency', Boolean(value.isEmergency));
    appendText('IsFeatured', Boolean(value.isFeatured));
    appendArray('Features', value.features);
    appendArray('FeaturesAr', value.featuresAr);
    appendText('CommentsCount', Number(value.commentsCount ?? 0));
    appendText('Specialty', value.specialty);
    appendText('SpecialtyAr', value.specialtyAr);
    appendText('OpeningHours.En.Monday', value.openingHoursEnMonday);
    appendText('OpeningHours.En.Tuesday', value.openingHoursEnTuesday);
    appendText('OpeningHours.En.Wednesday', value.openingHoursEnWednesday);
    appendText('OpeningHours.En.Thursday', value.openingHoursEnThursday);
    appendText('OpeningHours.En.Friday', value.openingHoursEnFriday);
    appendText('OpeningHours.En.Saturday', value.openingHoursEnSaturday);
    appendText('OpeningHours.En.Sunday', value.openingHoursEnSunday);
    appendText('OpeningHours.Ar.Monday', value.openingHoursArMonday);
    appendText('OpeningHours.Ar.Tuesday', value.openingHoursArTuesday);
    appendText('OpeningHours.Ar.Wednesday', value.openingHoursArWednesday);
    appendText('OpeningHours.Ar.Thursday', value.openingHoursArThursday);
    appendText('OpeningHours.Ar.Friday', value.openingHoursArFriday);
    appendText('OpeningHours.Ar.Saturday', value.openingHoursArSaturday);
    appendText('OpeningHours.Ar.Sunday', value.openingHoursArSunday);
    appendText('HasDelivery', Boolean(value.hasDelivery));
    appendText('AcceptsInsurance', Boolean(value.acceptsInsurance));

    if (value.imageFile instanceof File) {
      formData.append('ImageFile', value.imageFile, value.imageFile.name);
    }

    this.serviceService.updateService(this.data.service.id ?? '', formData).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Update service error:', err),
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.form.patchValue({ imageFile: file });
  }

  close(): void {
    this.dialogRef.close();
  }
}
