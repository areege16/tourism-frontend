import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AttractionService } from '../../Services/attraction.service';
import { Attraction } from '../../Models/attraction';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;

  // Main image
  mainImagePreview = '';
  mainImageFile: File | null = null;
  existingImageUrl = '';

  // Gallery
  existingGalleryUrls: string[] = [];
  newGalleryFiles: File[] = [];
  newGalleryPreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private attractionService: AttractionService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadAttraction(this.data.id);
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      latitude: [0, Validators.required],
      longitude: [0, Validators.required],
      openingHoursEn: [''],
      openingHoursAr: [''],
      ticketPriceEn: [''],
      ticketPriceAr: [''],
      bookingUrl: [''],
      rating: [0, [Validators.min(0), Validators.max(5)]],
      reviewCount: [0, Validators.min(0)],
      categoryEn: ['', Validators.required],
      categoryAr: ['', Validators.required],
      historicalPeriodEn: [''],
      historicalPeriodAr: [''],
      significanceEn: [''],
      significanceAr: [''],
      features: this.fb.array([]),
    });
  }

  get features(): FormArray {
    return this.form.get('features') as FormArray;
  }

  private loadAttraction(id: string): void {
    this.loading = true;
    this.attractionService.getAttractionById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patchForm(res.data);
        } else {
          this.snackBar.open(
            res.message || 'تعذر تحميل بيانات المعلم',
            'إغلاق',
            { duration: 3500 },
          );
        }
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('حدث خطأ أثناء تحميل بيانات المعلم', 'إغلاق', {
          duration: 3500,
        });
        this.loading = false;
      },
    });
  }

  private patchForm(data: Attraction): void {
    this.form.patchValue({
      nameEn: data.name?.en,
      nameAr: data.name?.ar,
      descriptionEn: data.description?.en,
      descriptionAr: data.description?.ar,
      latitude: data.latitude,
      longitude: data.longitude,
      openingHoursEn: data.openingHours?.en,
      openingHoursAr: data.openingHours?.ar,
      ticketPriceEn: data.ticketPrice?.en,
      ticketPriceAr: data.ticketPrice?.ar,
      bookingUrl: data.bookingUrl,
      rating: data.rating,
      reviewCount: data.reviewCount,
      categoryEn: data.category?.en,
      categoryAr: data.category?.ar,
      historicalPeriodEn: data.historicalPeriod?.en,
      historicalPeriodAr: data.historicalPeriod?.ar,
      significanceEn: data.significance?.en,
      significanceAr: data.significance?.ar,
    });

    this.features.clear();
    (data.features ?? []).forEach((f) =>
      this.features.push(
        this.fb.group({
          en: [f.en, Validators.required],
          ar: [f.ar, Validators.required],
        }),
      ),
    );

    this.existingImageUrl = data.imageUrl ?? '';
    this.mainImagePreview = getFullImageUrl(this.existingImageUrl);
    this.existingGalleryUrls = [...(data.imageGallery ?? [])];
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

  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    files.forEach((file) => {
      this.newGalleryFiles.push(file);
      const reader = new FileReader();
      reader.onload = () =>
        this.newGalleryPreviews.push(reader.result as string);
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeExistingGalleryImage(index: number): void {
    this.existingGalleryUrls.splice(index, 1);
  }

  removeNewGalleryImage(index: number): void {
    this.newGalleryFiles.splice(index, 1);
    this.newGalleryPreviews.splice(index, 1);
  }

  fullUrl(path: string): string {
    return getFullImageUrl(path);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('من فضلك راجعي الحقول المطلوبة', 'إغلاق', {
        duration: 3000,
      });
      return;
    }

    const v = this.form.value;

    const formValue = {
      id: this.data.id,
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
      .updateAttraction(
        this.data.id,
        formValue,
        this.mainImageFile,
        this.existingImageUrl,
        this.newGalleryFiles,
        this.existingGalleryUrls,
      )
      .subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.snackBar.open('تم تحديث المعلم السياحي بنجاح', 'إغلاق', {
              duration: 3000,
            });
            this.dialogRef.close(res.data);
          } else {
            this.snackBar.open(res.message || 'تعذر حفظ التعديلات', 'إغلاق', {
              duration: 3500,
            });
          }
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('حدث خطأ أثناء حفظ التعديلات', 'إغلاق', {
            duration: 3500,
          });
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
