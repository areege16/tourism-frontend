import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { Hotel, UpdateHotelDto } from '../../Models/hotel';
import { HotelService } from '../../Services/hotel.service';
import { ToastService } from '../../../Shared/Services/toast.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<UpdateComponent>);
  private fb = inject(FormBuilder);
  private hotelService = inject(HotelService);
  private toastService = inject(ToastService);
  form!: FormGroup;
  isLoadingData: boolean = true;
  isSubmitting: boolean = false;
  hotelId!: string;

  mainImagePreview: string | null = null;
  rawExistingImageUrl: string | null = null;
  selectedMainFile: File | null = null;

  existingGalleryUrls: string[] = [];
  newGalleryFiles: File[] = [];
  newGalleryPreviews: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.extractHotelId();
  }

  ngOnInit(): void {
    if (!this.hotelId) {
      this.extractHotelId();
    }

    if (!this.hotelId) {
      console.error('Hotel ID was not provided to UpdateComponent');
      this.isLoadingData = false;
      return;
    }

    this.initForm();
    this.fetchHotelDetails();
  }

  private extractHotelId(): void {
    this.hotelId =
      this.data?.id ||
      this.data?.Id ||
      this.data?.hotel?.id ||
      this.data?.hotel?.Id;
  }

  private initForm(): void {
    this.form = this.fb.group({
      id: [this.hotelId, Validators.required],
      name: this.fb.group({
        ar: ['', Validators.required],
        en: ['', Validators.required]
      }),
      // Removed Validators.required to allow null/empty
      description: this.fb.group({
        ar: [''],
        en: ['']
      }),
      latitude: [0], // Made optional to match DTO
      longitude: [0], // Made optional to match DTO
      rating: [0, [Validators.min(0), Validators.max(5)]],
      reviewCount: [0, [Validators.min(0)]],
      starRating: [3, [Validators.min(1), Validators.max(7)]],
      // Removed Validators.required
      priceRange: this.fb.group({
        ar: [''],
        en: ['']
      }),
      contactInfo: this.fb.group({
        phone: [''],
        email: ['', [Validators.email]],
        website: ['']
      }),
      amenities: this.fb.array([]),
      roomTypes: this.fb.array([])
    });
  }

  private fetchHotelDetails(): void {
    this.isLoadingData = true;
    this.hotelService.getHotelById(this.hotelId).subscribe({
      next: (hotel) => {
        if (hotel) {
          this.populateForm(hotel);
        }
        this.isLoadingData = false;
      },
      error: (err) => {
        console.error('Failed to load hotel details:', err);
        this.isLoadingData = false;
      }
    });
  }

  private populateForm(h: Hotel): void {
    this.form.patchValue({
      id: h.id,
      name: { ar: h.name?.ar || '', en: h.name?.en || '' },
      description: { ar: h.description?.ar || '', en: h.description?.en || '' },
      latitude: h.latitude || 0,
      longitude: h.longitude || 0,
      rating: h.rating || 0,
      reviewCount: h.reviewCount || 0,
      starRating: h.starRating || 3,
      priceRange: { ar: h.priceRange?.ar || '', en: h.priceRange?.en || '' },
      contactInfo: {
        phone: h.contactInfo?.phone || '',
        email: h.contactInfo?.email || '',
        website: h.contactInfo?.website || ''
      }
    });

    this.rawExistingImageUrl = h.imageUrl || null;
    if (h.imageUrl) {
      this.mainImagePreview = getFullImageUrl(h.imageUrl);
    }

    if (h.imageGallery && h.imageGallery.length > 0) {
      this.existingGalleryUrls = [...h.imageGallery];
    }

    this.amenitiesArray.clear();
    if (h.amenities && h.amenities.length > 0) {
      h.amenities.forEach((a) => this.addAmenity(a.ar, a.en));
    }

    this.roomTypesArray.clear();
    if (h.roomTypes && h.roomTypes.length > 0) {
      h.roomTypes.forEach((r) => this.addRoomType(r.ar, r.en));
    }
  }

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

  onGalleryFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file) => {
        this.newGalleryFiles.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.newGalleryPreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeExistingGalleryImage(index: number): void {
    this.existingGalleryUrls.splice(index, 1);
  }

  removeNewGalleryImage(index: number): void {
    this.newGalleryFiles.splice(index, 1);
    this.newGalleryPreviews.splice(index, 1);
  }

  getImageUrl(path: string): string {
    return getFullImageUrl(path);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const val = this.form.value;

    const dto: UpdateHotelDto = {
      id: val.id,
      name: val.name,
      description: val.description?.ar || val.description?.en ? val.description : undefined,
      imageFile: this.selectedMainFile,
      existingImageUrl: this.selectedMainFile ? null : this.rawExistingImageUrl,
      newImageGalleryFiles: this.newGalleryFiles.length > 0 ? this.newGalleryFiles : null,
      existingGalleryUrls: this.existingGalleryUrls,
      latitude: val.latitude != null ? Number(val.latitude) : undefined,
      longitude: val.longitude != null ? Number(val.longitude) : undefined,
      rating: val.rating != null ? Number(val.rating) : undefined,
      reviewCount: val.reviewCount != null ? Number(val.reviewCount) : undefined,
      starRating: val.starRating != null ? Number(val.starRating) : undefined,
      priceRange: val.priceRange?.ar || val.priceRange?.en ? val.priceRange : undefined,
      amenities: val.amenities?.length ? val.amenities : undefined,
      roomTypes: val.roomTypes?.length ? val.roomTypes : undefined,

      // Updated Contact Info mapping (No more .ar/.en)
      contactInfo: {
        phone: val.contactInfo?.phone || undefined,
        email: val.contactInfo?.email || undefined,
        website: val.contactInfo?.website || undefined
      }
    };

    this.hotelService.updateHotel(val.id, dto).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        if (res.success) {
          // رسالة النجاح وإغلاق النافذة لتحديث الجدول
          this.toastService.success('تم تحديث بيانات الفندق بنجاح');
          this.dialogRef.close(true);
        } else {
          // في حال رد السيرفر بـ 200 ولكن العملية فشلت منطقياً
          this.toastService.error(res.message || 'فشل في تحديث بيانات الفندق');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error updating hotel:', err);

        // رسالة الخطأ في حال حدوث مشكلة في السيرفر أو الشبكة (مثل 400 أو 500)
        this.toastService.error('حدث خطأ أثناء الاتصال بالخادم، لم يتم حفظ التعديلات');
      }
    });
  }
  closeDialog(): void {
    this.dialogRef.close(false);
  }
}