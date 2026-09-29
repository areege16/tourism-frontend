import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { RestaurantService } from '../../Services/restaurant.service';
import { minLengthArray } from '../../../Shared/utils/validators.util';

@Component({
  selector: 'app-restaurant-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  attemptedSave = false;

  // Main image
  mainImagePreview = '';
  mainImageFile: File | null = null;

  // Gallery
  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateComponent>,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      latitude: [
        0,
        [Validators.required, Validators.min(-90), Validators.max(90)],
      ],
      longitude: [
        0,
        [Validators.required, Validators.min(-180), Validators.max(180)],
      ],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      reviewCount: [0, [Validators.required, Validators.min(0)]],
      cuisineTypeEn: ['', Validators.required],
      cuisineTypeAr: ['', Validators.required],
      priceRangeEn: ['', Validators.required],
      priceRangeAr: ['', Validators.required],
      openingHoursEn: ['', Validators.required],
      openingHoursAr: ['', Validators.required],
      centerEn: ['', Validators.required],
      centerAr: ['', Validators.required],
      menuUrl: [''],
      phoneEn: ['', Validators.required],
      phoneAr: ['', Validators.required],
      email: ['', Validators.email],
      specialties: this.fb.array([], minLengthArray(1)),
      features: this.fb.array([], minLengthArray(1)),
    });
  }

  get specialties(): FormArray {
    return this.form.get('specialties') as FormArray;
  }

  get features(): FormArray {
    return this.form.get('features') as FormArray;
  }

  addSpecialty(): void {
    this.specialties.push(
      this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required],
      }),
    );
  }

  removeSpecialty(index: number): void {
    this.specialties.removeAt(index);
  }

  addFeature(): void {
    this.features.push(
      this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required],
      }),
    );
  }

  removeFeature(index: number): void {
    this.features.removeAt(index);
  }

  onMainImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.mainImageFile = file;
    this.mainImagePreview = URL.createObjectURL(file);
  }

  removeMainImage(): void {
    this.mainImageFile = null;
    this.mainImagePreview = '';
  }

  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    files.forEach((file) => {
      this.galleryFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => this.galleryPreviews.push(reader.result as string);
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeGalleryImage(index: number): void {
    this.galleryFiles.splice(index, 1);
    this.galleryPreviews.splice(index, 1);
  }

  onSubmit(): void {
    this.attemptedSave = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open(
        'لا يمكن الحفظ، يرجى مراجعة البيانات المطلوبة',
        'إغلاق',
        { duration: 3000 },
      );
      return;
    }

    const v = this.form.value;

    const formValue = {
      name: { en: v.nameEn, ar: v.nameAr },
      description: { en: v.descriptionEn, ar: v.descriptionAr },
      latitude: v.latitude,
      longitude: v.longitude,
      rating: v.rating,
      reviewCount: v.reviewCount,
      cuisineType: { en: v.cuisineTypeEn, ar: v.cuisineTypeAr },
      priceRange: { en: v.priceRangeEn, ar: v.priceRangeAr },
      openingHours: { en: v.openingHoursEn, ar: v.openingHoursAr },
      specialties: v.specialties,
      center: { en: v.centerEn, ar: v.centerAr },
      menuUrl: v.menuUrl,
      contactInfoPhone: { en: v.phoneEn, ar: v.phoneAr },
      contactInfoEmail: v.email,
      features: v.features,
    };

    this.saving = true;
    this.restaurantService
      .createRestaurant(formValue, this.mainImageFile, this.galleryFiles)
      .subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.snackBar.open('تم إضافة المطعم بنجاح', 'إغلاق', {
              duration: 3000,
            });
            this.dialogRef.close(res.data);
          } else {
            this.snackBar.open(res.message || 'تعذر إضافة المطعم', 'إغلاق', {
              duration: 3500,
            });
          }
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('حدث خطأ أثناء إضافة المطعم', 'إغلاق', {
            duration: 3500,
          });
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}