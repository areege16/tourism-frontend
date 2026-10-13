import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TourGuideDto } from '../../Models/tour-guide';
import { TourGuideService } from '../../Services/tour-guide.service';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';

@Component({
  selector: 'app-tour-guide-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class EditComponent implements OnInit {
  form!: FormGroup;
  imagePreview: string | null = null; // لمعاينة الصورة (سواء القديمة أو الجديدة)

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditComponent>,
    private tourGuideService: TourGuideService,
    @Inject(MAT_DIALOG_DATA) public data: { guide: TourGuideDto },
  ) {}

  private getLocalizedValue(value: unknown): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const localized = value as { ar?: string; en?: string };
      return localized.ar || localized.en || '';
    }

    return String(value);
  }

  ngOnInit(): void {
    const guide = this.data.guide;

    // تهيئة معاينة الصورة بالصورة الحالية للمرشد (بعد معالجتها بالرابط الكامل)
    if (guide.imageUrl) {
      this.imagePreview = getFullImageUrl(guide.imageUrl);
    }

    this.form = this.fb.group({
      nameEn: [guide.name?.en || '', Validators.required],
      nameAr: [guide.name?.ar  || '', Validators.required],
      bioEn: [guide.bio?.en || '', Validators.required],
      bioAr: [guide.bio?.ar || '', Validators.required],
      languages: [(guide.languages ?? []).join(',')],
      imageUrl: [guide.imageUrl || ''],
      phone: [this.getLocalizedValue(guide.phone), Validators.required],
      email: [this.getLocalizedValue(guide.email), [Validators.required, Validators.email]],
      facebook: [guide.social?.facebook || ''],
      instagram: [guide.social?.instagram || ''],
      twitter: [guide.social?.twitter || ''],
      tiktok: [guide.social?.tiktok || ''],
      youtube: [guide.social?.youtube || ''],
      rating: [guide.rating ?? 0, [Validators.required, Validators.min(0), Validators.max(5)]],
      imageFile: [null],
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.form.patchValue({ imageFile: file });

      // بناء رابط معاينة مؤقت للملف الجديد
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(fileInput: HTMLInputElement): void {
    this.form.patchValue({ imageFile: null, imageUrl: '' });
    this.imagePreview = null;
    fileInput.value = ''; // تصفير حقل الرفع
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    const languages = (value.languages ?? '')
      .split(',')
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);

    const payload = {
      id: this.data.guide.id ?? '',
      name: {
        en: value.nameEn,
        ar: value.nameAr,
      },
      bio: {
        en: value.bioEn,
        ar: value.bioAr,
      },
      languages,
      imageUrl: value.imageUrl || '',
      imageFile: value.imageFile, // الملف الجديد (إن وجد)
      phone: value.phone || '',
      email: value.email || '',
      social: {
        facebook: value.facebook || '',
        instagram: value.instagram || '',
        twitter: value.twitter || '',
        tiktok: value.tiktok || '',
        youtube: value.youtube || '',
      },
      rating: Number(value.rating ?? 0),
    };

    this.tourGuideService.update(this.data.guide.id ?? '', payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Update tour guide error:', err),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}