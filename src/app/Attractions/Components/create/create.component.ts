import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AttractionService } from '../../Services/attraction.service';
import { minLengthArray } from '../../../Shared/utils/validators.util';

@Component({
  selector: 'app-create',
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
    private attractionService: AttractionService,
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
      openingHoursEn: ['', Validators.required],
      openingHoursAr: ['', Validators.required],
      ticketPriceEn: ['', Validators.required],
      ticketPriceAr: ['', Validators.required],
      bookingUrl: ['', Validators.pattern(/^https?:\/\/.+/)],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      reviewCount: [0, [Validators.required, Validators.min(0)]],
      categoryEn: ['', Validators.required],
      categoryAr: ['', Validators.required],
      historicalPeriodEn: ['', Validators.required],
      historicalPeriodAr: ['', Validators.required],
      significanceEn: ['', Validators.required],
      significanceAr: ['', Validators.required],
      features: this.fb.array([], minLengthArray(1)),
    });
  }

  get features(): FormArray {
    return this.form.get('features') as FormArray;
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
        {
          duration: 3000,
        },
      );
      return;
    }

    const v = this.form.value;

    const formValue = {
      name: { en: v.nameEn, ar: v.nameAr },
      description: { en: v.descriptionEn, ar: v.descriptionAr },
      latitude: v.latitude,
      longitude: v.longitude,
      openingHours: { en: v.openingHoursEn, ar: v.openingHoursAr },
      ticketPrice: { en: v.ticketPriceEn, ar: v.ticketPriceAr },
      bookingUrl: v.bookingUrl,
      rating: v.rating,
      reviewCount: v.reviewCount,
      category: { en: v.categoryEn, ar: v.categoryAr },
      features: v.features,
      historicalPeriod: { en: v.historicalPeriodEn, ar: v.historicalPeriodAr },
      significance: { en: v.significanceEn, ar: v.significanceAr },
    };

    this.saving = true;
    this.attractionService
      .createAttraction(formValue, this.mainImageFile, this.galleryFiles)
      .subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.snackBar.open('تم إضافة المعلم السياحي بنجاح', 'إغلاق', {
              duration: 3000,
            });
            this.dialogRef.close(res.data);
          } else {
            this.snackBar.open(res.message || 'تعذر إضافة المعلم', 'إغلاق', {
              duration: 3500,
            });
          }
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('حدث خطأ أثناء إضافة المعلم', 'إغلاق', {
            duration: 3500,
          });
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
