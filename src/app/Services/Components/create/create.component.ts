import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ServiceService } from '../../Services/service.service';

@Component({
  selector: 'app-service-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateComponent>,
    private serviceService: ServiceService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      nameAr: ['', Validators.required],
      type: ['', Validators.required],
      typeAr: ['', Validators.required],
      description: [''],
      descriptionAr: [''],
      address: [''],
      addressAr: [''],
      phone: [''],
      email: [''],
      image: [''],
      imageFile: [null],
      latitude: [0],
      longitude: [0],
      distanceKm: [0],
      rating: [0],
      is24h: [false],
      isEmergency: [false],
      isFeatured: [false],
      features: [''],
      featuresAr: [''],
      commentsCount: [0],
      specialty: [''],
      specialtyAr: [''],
      hasDelivery: [false],
      acceptsInsurance: [false],
      openingHoursEnMonday: [''],
      openingHoursEnTuesday: [''],
      openingHoursEnWednesday: [''],
      openingHoursEnThursday: [''],
      openingHoursEnFriday: [''],
      openingHoursEnSaturday: [''],
      openingHoursEnSunday: [''],
      openingHoursArMonday: [''],
      openingHoursArTuesday: [''],
      openingHoursArWednesday: [''],
      openingHoursArThursday: [''],
      openingHoursArFriday: [''],
      openingHoursArSaturday: [''],
      openingHoursArSunday: [''],
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
    appendText('Image', value.image);
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

    this.serviceService.createService(formData).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Create service error:', err),
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
