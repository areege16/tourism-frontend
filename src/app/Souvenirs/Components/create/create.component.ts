import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SouvenirService } from '../../Services/souvenir.service';
import { SouvenirCategory } from '../../Models/souvenir-shop';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private souvenirService = inject(SouvenirService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CreateComponent>);

  form!: FormGroup;
  saving = false;
  attemptedSave = false;

  categories: SouvenirCategory[] = [];

  priceRanges = [
    { value: '$', label: '$ - اقتصادي' },
    { value: '$$', label: '$$ - متوسط' },
    { value: '$$$', label: '$$$ - فاخر' },
  ];

  booleanFields = [
    { control: 'isFeatured', label: 'محل مميز' },
    { control: 'acceptsCreditCard', label: 'يقبل البطاقات الائتمانية' },
    { control: 'hasDelivery', label: 'يوفر خدمة التوصيل' },
    { control: 'hasOnlineStore', label: 'لديه متجر إلكتروني' },
  ];

  // Main image
  mainImagePreview = '';
  mainImageFile: File | null = null;

  // Gallery
  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];

  ngOnInit(): void {
    this.buildForm();
    this.loadCategories();
  }

  private loadCategories(): void {
    this.souvenirService.getCategories().subscribe({
      next: (res) => {
        console.log('categories response:', res);
        if (res.success) this.categories = res.data;
      },
      error: (err) => console.error('categories error:', err),
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      // مطلوبين
      name: ['', Validators.required],
      nameAr: ['', Validators.required],
      category: ['', Validators.required],

      // اختياريين
      description: [''],
      descriptionAr: [''],
      address: [''],
      addressAr: [''],
      phone: [''],
      email: ['', Validators.email],
      latitude: [null, [Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.min(-180), Validators.max(180)]],
      distanceKm: [null, Validators.min(0)],
      rating: [null, [Validators.min(0), Validators.max(5)]],
      reviewCount: [null, Validators.min(0)],
      priceRange: [null],
      openingHours: [''],
      openingHoursAr: [''],
      isFeatured: [null],
      acceptsCreditCard: [null],
      hasDelivery: [null],
      hasOnlineStore: [null],
      specialties: this.fb.array([]),
    });
  }

  get specialties(): FormArray {
    return this.form.get('specialties') as FormArray;
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

  onMainImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
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

    const missingImage = !this.mainImageFile;

    if (this.form.invalid || missingImage) {
      this.form.markAllAsTouched();
      this.snackBar.open(
        missingImage && this.form.valid
          ? 'الصورة الرئيسية مطلوبة'
          : 'لا يمكن الحفظ، يرجى مراجعة البيانات المطلوبة',
        'إغلاق',
        { duration: 3000 },
      );
      return;
    }

    const v = this.form.value;
    const selectedCategory = this.categories.find((c) => c.key === v.category);

    const payload = {
      name: v.name,
      nameAr: v.nameAr,
      description: v.description,
      descriptionAr: v.descriptionAr,
      category: v.category,
      categoryAr: selectedCategory?.nameAr ?? '',
      address: v.address,
      addressAr: v.addressAr,
      phone: v.phone,
      email: v.email,
      latitude: v.latitude,
      longitude: v.longitude,
      distanceKm: v.distanceKm,
      rating: v.rating,
      reviewCount: v.reviewCount,
      priceRange: v.priceRange,
      openingHours: v.openingHours,
      openingHoursAr: v.openingHoursAr,
      isFeatured: v.isFeatured,
      acceptsCreditCard: v.acceptsCreditCard,
      hasDelivery: v.hasDelivery,
      hasOnlineStore: v.hasOnlineStore,
      specialties: v.specialties.map((s: { en: string }) => s.en),
      specialtiesAr: v.specialties.map((s: { ar: string }) => s.ar),
    };

    this.saving = true;
    this.souvenirService
      .createShop(payload, this.mainImageFile, this.galleryFiles)
      .subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.snackBar.open('تم إضافة المحل بنجاح', 'إغلاق', {
              duration: 3000,
            });
            this.dialogRef.close(res.data);
          } else {
            this.snackBar.open(res.message || 'تعذر إضافة المحل', 'إغلاق', {
              duration: 3500,
            });
          }
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('حدث خطأ أثناء إضافة المحل', 'إغلاق', {
            duration: 3500,
          });
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
