import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SouvenirService } from '../../Services/souvenir.service';

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.scss',
})
export class CreateProductComponent implements OnInit {
  private fb = inject(FormBuilder);
  private souvenirService = inject(SouvenirService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CreateProductComponent>);

  form!: FormGroup;
  saving = false;
  attemptedSave = false;

  currencies = [
    { value: 'EGP', label: 'جنيه مصري (EGP)' },
    { value: 'USD', label: 'دولار (USD)' },
    { value: 'EUR', label: 'يورو (EUR)' },
  ];

  // الصورة الرئيسية
  mainImagePreview = '';
  mainImageFile: File | null = null;

  // المعرض
  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { shopId: string }) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      // مطلوبين
      name: ['', Validators.required],
      nameAr: ['', Validators.required],
      category: ['', Validators.required],
      categoryAr: ['', Validators.required],
      currency: ['EGP', Validators.required],

      // اختياريين
      description: [''],
      descriptionAr: [''],
      price: [null, Validators.min(0)],
      inStock: [null],
      handmade: [null],
      material: [''],
      materialAr: [''],
      origin: [''],
      originAr: [''],
    });
  }

  // ---------- الصورة الرئيسية ----------
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

  // ---------- المعرض ----------
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

  // ---------- الحفظ ----------
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

    const payload = {
      shopId: this.data.shopId,
      name: v.name,
      nameAr: v.nameAr,
      description: v.description,
      descriptionAr: v.descriptionAr,
      category: v.category,
      categoryAr: v.categoryAr,
      price: v.price,
      currency: v.currency,
      inStock: v.inStock,
      handmade: v.handmade,
      material: v.material,
      materialAr: v.materialAr,
      origin: v.origin,
      originAr: v.originAr,
    };

    this.saving = true;
    this.souvenirService
      .createProduct(payload, this.mainImageFile, this.galleryFiles)
      .subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.snackBar.open('تم إضافة المنتج بنجاح', 'إغلاق', {
              duration: 3000,
            });
            this.dialogRef.close(res.data);
          } else {
            this.snackBar.open(res.message || 'تعذر إضافة المنتج', 'إغلاق', {
              duration: 3500,
            });
          }
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('حدث خطأ أثناء إضافة المنتج', 'إغلاق', {
            duration: 3500,
          });
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}