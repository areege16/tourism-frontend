import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../../Shared/Services/toast.service';
import { CreateHotelDto } from '../../Models/hotel';
import { HotelService } from '../../Services/hotel.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<CreateComponent>);
  private fb = inject(FormBuilder);
  private hotelService = inject(HotelService);
  private toastService = inject(ToastService);

  form!: FormGroup;
  isSubmitting: boolean = false;

  // حالات تحميل الصور
  mainImagePreview: string | null = null;
  selectedMainFile: File | null = null;

  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: this.fb.group({
        ar: ['', Validators.required],
        en: ['', Validators.required]
      }),
      description: this.fb.group({
        ar: [''],
        en: ['']
      }),
      latitude: [null],
      longitude: [null],
      rating: [null, [Validators.min(0), Validators.max(5)]],
      reviewCount: [null, [Validators.min(0)]],
      starRating: [3, [Validators.required, Validators.min(1), Validators.max(7)]],
      priceRange: this.fb.group({
        ar: [''],
        en: ['']
      }),
      contactInfo: this.fb.group({
        phone: [''],
        // التحقق من صيغة الإيميل فقط إذا كتب المستخدم قيمة
        email: ['', [(c: any) => (c.value && c.value.trim() !== '' ? Validators.email(c) : null)]],
        website: ['']
      }),
      amenities: this.fb.array([]),
      roomTypes: this.fb.array([])
    });
  }

  // --- مصفوفة المرافق Amenities ---
  get amenitiesArray(): FormArray {
    return this.form.get('amenities') as FormArray;
  }

  addAmenity(ar: string = '', en: string = ''): void {
    this.amenitiesArray.push(
      this.fb.group({
        ar: [ar, Validators.required],
        en: [en, Validators.required]
      })
    );
  }

  removeAmenity(index: number): void {
    this.amenitiesArray.removeAt(index);
  }

  // --- مصفوفة الغرف Room Types ---
  get roomTypesArray(): FormArray {
    return this.form.get('roomTypes') as FormArray;
  }

  addRoomType(ar: string = '', en: string = ''): void {
    this.roomTypesArray.push(
      this.fb.group({
        ar: [ar, Validators.required],
        en: [en, Validators.required]
      })
    );
  }

  removeRoomType(index: number): void {
    this.roomTypesArray.removeAt(index);
  }

  // --- إدارة رفع الصور ---
  onMainImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedMainFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.mainImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedMainFile);
    }
  }

  removeMainImage(): void {
    this.selectedMainFile = null;
    this.mainImagePreview = null;
  }

  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file) => {
        this.galleryFiles.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.galleryPreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
    input.value = '';
  }

  removeGalleryImage(index: number): void {
    this.galleryFiles.splice(index, 1);
    this.galleryPreviews.splice(index, 1);
  }

  // فحص واستخراج كل البيانات الناقصة أو غير الصحيحة
  private getMissingValidationFields(): string[] {
    const missing: string[] = [];

    if (this.form.get('name.ar')?.invalid) {
      missing.push('اسم الفندق بالعربية');
    }
    if (this.form.get('name.en')?.invalid) {
      missing.push('اسم الفندق بالإنجليزية');
    }
    if (this.form.get('starRating')?.invalid) {
      missing.push('تصنيف النجوم (بين 1 و 7)');
    }
    if (this.form.get('rating')?.invalid) {
      missing.push('التقييم (بين 0 و 5)');
    }
    if (this.form.get('reviewCount')?.invalid) {
      missing.push('عدد المراجعات (قيمة موجبة)');
    }
    if (this.form.get('contactInfo.email')?.invalid) {
      missing.push('صيغة البريد الإلكتروني');
    }

    this.amenitiesArray.controls.forEach((item, i) => {
      if (item.invalid) {
        missing.push(`المرفق رقم (${i + 1}) غير مكتمل (عربي وإنجليزي)`);
      }
    });

    this.roomTypesArray.controls.forEach((item, i) => {
      if (item.invalid) {
        missing.push(`نوع الغرفة رقم (${i + 1}) غير مكتمل (عربي وإنجليزي)`);
      }
    });

    return missing;
  }

  // --- حفظ البيانات ---
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const missingFields = this.getMissingValidationFields();
      if (missingFields.length > 0) {
        this.toastService.error(`يرجى استكمال أو تصحيح: ${missingFields.join('، ')}`);
      }
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const val = this.form.value;

    const phone = val.contactInfo?.phone?.trim() || undefined;
    const email = val.contactInfo?.email?.trim() || undefined;
    const website = val.contactInfo?.website?.trim() || undefined;
    const hasContactInfo = !!(phone || email || website);

    const validAmenities = val.amenities?.filter((a: any) => a.ar?.trim() || a.en?.trim());
    const validRoomTypes = val.roomTypes?.filter((r: any) => r.ar?.trim() || r.en?.trim());

    const dto: CreateHotelDto = {
      name: {
        ar: val.name.ar.trim(),
        en: val.name.en.trim()
      },
      description: (val.description?.ar?.trim() || val.description?.en?.trim())
        ? { ar: val.description.ar?.trim() || '', en: val.description.en?.trim() || '' }
        : undefined,
      imageFile: this.selectedMainFile,
      imageGalleryFiles: this.galleryFiles.length > 0 ? this.galleryFiles : null,
      latitude: val.latitude != null && val.latitude !== '' ? Number(val.latitude) : undefined,
      longitude: val.longitude != null && val.longitude !== '' ? Number(val.longitude) : undefined,
      rating: val.rating != null && val.rating !== '' ? Number(val.rating) : undefined,
      reviewCount: val.reviewCount != null && val.reviewCount !== '' ? Number(val.reviewCount) : undefined,
      starRating: val.starRating != null && val.starRating !== '' ? Number(val.starRating) : 3,
      priceRange: (val.priceRange?.ar?.trim() || val.priceRange?.en?.trim())
        ? { ar: val.priceRange.ar?.trim() || '', en: val.priceRange.en?.trim() || '' }
        : undefined,
      amenities: validAmenities?.length > 0 ? validAmenities : undefined,
      roomTypes: validRoomTypes?.length > 0 ? validRoomTypes : undefined,
      contactInfo: hasContactInfo ? { phone, email, website } : undefined
    };

    this.hotelService.createHotel(dto).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastService.success('تم إضافة الفندق بنجاح');
          this.dialogRef.close(true);
        } else {
          this.toastService.error(res.message || 'فشل في حفظ الفندق');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error creating hotel:', err);
        const serverErrors = err?.error?.errors;
        if (serverErrors) {
          const firstKey = Object.keys(serverErrors)[0];
          this.toastService.error(serverErrors[firstKey][0]);
        } else {
          this.toastService.error('حدث خطأ أثناء الاتصال بالخادم، لم يتم حفظ الفندق');
        }
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}