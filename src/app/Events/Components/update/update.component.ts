import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreateTourismEventDto, TourismEventDto } from '../../Models/events';
import { EventService } from '../../Services/event.service';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent implements OnInit {
  eventForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private dialogRef: MatDialogRef<UpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public eventData: TourismEventDto
  ) { }

  ngOnInit(): void {
    this.initForm();
    if (this.eventData) {
      this.patchFormValues();
    }
  }

  private initForm(): void {
    this.eventForm = this.fb.group({
      nameAr: ['', [Validators.required]],
      nameEn: [''],
      descriptionAr: ['', [Validators.required]],
      descriptionEn: [''],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      locationAr: ['', [Validators.required]],
      locationEn: [''],
      latitude: [null],
      longitude: [null],
      categoryAr: ['', [Validators.required]],
      categoryEn: [''],
      organizerAr: [''],
      organizerEn: [''],
      isFree: [true],
      ticketPriceAr: [''],
      ticketPriceEn: [''],
      phone: [''],
      email: ['', [Validators.email]],
      website: ['']
    });

    this.eventForm.get('isFree')?.valueChanges.subscribe((isFree: boolean) => {
      const priceAr = this.eventForm.get('ticketPriceAr');
      if (!isFree) {
        priceAr?.setValidators([Validators.required]);
      } else {
        priceAr?.clearValidators();
      }
      priceAr?.updateValueAndValidity();
    });
  }

  private patchFormValues(): void {
    const e = this.eventData;

    this.imagePreview = e.imageUrl || null;

    this.eventForm.patchValue({
      nameAr: e.name?.ar || '',
      nameEn: e.name?.en || '',
      descriptionAr: e.description?.ar || '',
      descriptionEn: e.description?.en || '',
      startDate: e.startDate ? this.formatDateForInput(e.startDate) : '',
      endDate: e.endDate ? this.formatDateForInput(e.endDate) : '',
      locationAr: e.location?.ar || '',
      locationEn: e.location?.en || '',
      latitude: e.latitude || null,
      longitude: e.longitude || null,
      categoryAr: e.category?.ar || '',
      categoryEn: e.category?.en || '',
      organizerAr: e.organizer?.ar || '',
      organizerEn: e.organizer?.en || '',
      isFree: e.isFree ?? true,
      ticketPriceAr: e.ticketPrice?.ar || '',
      ticketPriceEn: e.ticketPrice?.en || '',
      phone: e.contactInfo?.phone || '',
      email: e.contactInfo?.email || '',
      website: e.contactInfo?.website || ''
    });
  }

  getImage(path?: string): string {
    return getFullImageUrl(path || '');
  }

  private formatDateForInput(dateStr: string): string {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

   onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }


  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const val = this.eventForm.value;

    const payload: CreateTourismEventDto = {
      name: { ar: val.nameAr, en: val.nameEn },
      description: { ar: val.descriptionAr, en: val.descriptionEn },
      startDate: new Date(val.startDate).toISOString(),
      endDate: new Date(val.endDate).toISOString(),
      location: { ar: val.locationAr, en: val.locationEn },
      latitude: val.latitude ? Number(val.latitude) : undefined,
      longitude: val.longitude ? Number(val.longitude) : undefined,
      category: { ar: val.categoryAr, en: val.categoryEn },
      isFree: val.isFree,
      ticketPrice: !val.isFree ? { ar: val.ticketPriceAr, en: val.ticketPriceEn } : undefined,
      organizer: (val.organizerAr || val.organizerEn) ? { ar: val.organizerAr, en: val.organizerEn } : undefined,
      contactInfo: {
        phone: val.phone,
        email: val.email,
        website: val.website
      }
    };

    this.eventService.updateEvent(this.eventData.id, payload, this.selectedFile || undefined).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res?.success) {
          this.dialogRef.close(true);
        } else {
          this.errorMessage = res?.message || 'حدث خطأ أثناء تعديل بيانات الفعالية';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً';
        console.error('Update Event Error:', err);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}