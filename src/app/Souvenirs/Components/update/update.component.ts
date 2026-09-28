import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SouvenirService } from '../../Services/souvenir.service';
import { SouvenirCategory, SouvenirShop } from '../../Models/souvenir-shop';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';

@Component({
  selector: 'app-souvenir-update',
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private souvenirService = inject(SouvenirService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<UpdateComponent>);

  form!: FormGroup;
  loading = true;
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

  // الصورة الرئيسية
  existingImageUrl = '';
  mainImagePreview = '';
  mainImageFile: File | null = null;

  // المعرض: الصور القديمة (مسارات) + الجديدة (ملفات)
  existingImages: string[] = [];
  newImagesFiles: File[] = [];
  newImagesPreviews: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadCategories();
    this.loadShop(this.data.id);
  }

  private loadCategories(): void {
    this.souvenirService.getCategories().subscribe({
      next: (res) => {
        if (res.success) this.categories = res.data;
      },
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      nameAr: ['', Validators.required],
      category: ['', Validators.required],

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

  private loadShop(id: string): void {
    this.loading = true;
    this.souvenirService.getShopById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patchForm(res.data);
        } else {
          this.snackBar.open(res.message || 'تعذر تحميل بيانات المحل', 'إغلاق', {
            duration: 3500,
          });
        }
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('حدث خطأ أثناء تحميل بيانات المحل', 'إغلاق', {
          duration: 3500,
        });
        this.loading = false;
      },
    });
  }

  private patchForm(shop: SouvenirShop): void {
    this.form.patchValue({
      name: shop.name,
      nameAr: shop.nameAr,
      category: shop.category ?? '',
      description: shop.description ?? '',
      descriptionAr: shop.descriptionAr ?? '',
      address: shop.address ?? '',
      addressAr: shop.addressAr ?? '',
      phone: shop.phone ?? '',
      email: shop.email ?? '',
      latitude: shop.latitude ?? null,
      longitude: shop.longitude ?? null,
      distanceKm: shop.distanceKm ?? null,
      rating: shop.rating ?? null,
      reviewCount: shop.reviewCount ?? null,
      priceRange: shop.priceRange ?? null,
      openingHours: shop.openingHours ?? '',
      openingHoursAr: shop.openingHoursAr ?? '',
      isFeatured: shop.isFeatured ?? null,
      acceptsCreditCard: shop.acceptsCreditCard ?? null,
      hasDelivery: shop.hasDelivery ?? null,
      hasOnlineStore: shop.hasOnlineStore ?? null,
    });

    // التخصصات: نزوّج العربي والإنجليزي بالترتيب
    this.specialties.clear();
    const en = shop.specialties ?? [];
    const ar = shop.specialtiesAr ?? [];
    const max = Math.max(en.length, ar.length);
    for (let i = 0; i < max; i++) {
      this.specialties.push(
        this.fb.group({
          en: [en[i] ?? '', Validators.required],
          ar: [ar[i] ?? '', Validators.required],
        }),
      );
    }

    this.existingImageUrl = shop.image ?? '';
    this.mainImagePreview = getFullImageUrl(this.existingImageUrl);
    this.existingImages = [...(shop.images ?? [])];
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

  // ---------- الصورة الرئيسية ----------
  onMainImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.mainImageFile = file;
    this.mainImagePreview = URL.createObjectURL(file);
  }

  // ---------- المعرض ----------
  fullUrl(path: string): string {
    return getFullImageUrl(path);
  }

  removeExistingImage(index: number): void {
    this.existingImages.splice(index, 1);
  }

  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    files.forEach((file) => {
      this.newImagesFiles.push(file);
      const reader = new FileReader();
      reader.onload = () =>
        this.newImagesPreviews.push(reader.result as string);
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeNewImage(index: number): void {
    this.newImagesFiles.splice(index, 1);
    this.newImagesPreviews.splice(index, 1);
  }

  // ---------- الحفظ ----------
  onSubmit(): void {
    this.attemptedSave = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('لا يمكن الحفظ، يرجى مراجعة البيانات المطلوبة', 'إغلاق', {
        duration: 3000,
      });
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
      .updateShop(
        this.data.id,
        payload,
        this.mainImageFile,
        this.existingImageUrl,
        this.newImagesFiles,
        this.existingImages,
      )
      .subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.snackBar.open('تم تحديث بيانات المحل بنجاح', 'إغلاق', {
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