import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreateTourismEventDto } from '../../Models/events';
import { EventService } from '../../Services/event.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {
  eventForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private dialogRef: MatDialogRef<CreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initForm();
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

    // التحكم بطلبات التذكرة إذا كانت الفعالية مدفوعة
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

    this.eventService.createEvent(payload, this.selectedFile || undefined).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res?.success) {
          this.dialogRef.close(true);
        } else {
          this.errorMessage = res?.message || 'حدث خطأ أثناء حفظ الفعالية';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً';
        console.error('Create Event Error:', err);
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