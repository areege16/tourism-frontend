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

import { RestaurantService } from '../../Services/restaurant.service';
import { Restaurant } from '../../Models/restaurant';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';

@Component({
  selector: 'app-restaurant-update',
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
    private restaurantService: RestaurantService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadRestaurant(this.data.id);
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      descriptionEn: ['', Validators.required],
      descriptionAr: ['', Validators.required],
      latitude: [0, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [0, [Validators.required, Validators.min(-180), Validators.max(180)]],
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
      specialties: this.fb.array([]),
      features: this.fb.array([]),
    });
  }

  get specialties(): FormArray {
    return this.form.get('specialties') as FormArray;
  }

  get features(): FormArray {
    return this.form.get('features') as FormArray;
  }

  private loadRestaurant(id: string): void {
    this.loading = true;
    this.restaurantService.getRestaurantById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patchForm(res.data);
        } else {
          this.snackBar.open(res.message || 'تعذر تحميل بيانات المطعم', 'إغلاق', {
            duration: 3500,
          });
        }
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('حدث خطأ أثناء تحميل بيانات المطعم', 'إغلاق', {
          duration: 3500,
        });
        this.loading = false;
      },
    });
  }

  private patchForm(data: Restaurant): void {
    this.form.patchValue({
      nameEn: data.name?.en,
      nameAr: data.name?.ar,
      descriptionEn: data.description?.en,
      descriptionAr: data.description?.ar,
      latitude: data.latitude,
      longitude: data.longitude,
      rating: data.rating,
      reviewCount: data.reviewCount,
      cuisineTypeEn: data.cuisineType?.en,
      cuisineTypeAr: data.cuisineType?.ar,
      priceRangeEn: data.priceRange?.en,
      priceRangeAr: data.priceRange?.ar,
      openingHoursEn: data.openingHours?.en,
      openingHoursAr: data.openingHours?.ar,
      centerEn: data.center?.en,
      centerAr: data.center?.ar,
      menuUrl: data.menuUrl,
      phoneEn: data.contactInfo?.phone?.en,
      phoneAr: data.contactInfo?.phone?.ar,
      email: data.contactInfo?.email,
    });

    this.specialties.clear();
    (data.specialties ?? []).forEach((s) =>
      this.specialties.push(
        this.fb.group({
          en: [s.en, Validators.required],
          ar: [s.ar, Validators.required],
        }),
      ),
    );

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

  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    files.forEach((file) => {
      this.newGalleryFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => this.newGalleryPreviews.push(reader.result as string);
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
      .updateRestaurant(
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
            this.snackBar.open('تم تحديث بيانات المطعم بنجاح', 'إغلاق', {
              duration: 3000,
            });
            this.dialogRef.close(true);
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