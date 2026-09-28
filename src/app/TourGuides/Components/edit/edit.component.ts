import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TourGuide } from '../../Models/tour-guide';
import { TourGuideService } from '../../Services/tour-guide.service';

@Component({
  selector: 'app-tour-guide-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class EditComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditComponent>,
    private tourGuideService: TourGuideService,
    @Inject(MAT_DIALOG_DATA) public data: { guide: TourGuide },
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

    this.form = this.fb.group({
      nameEn: [guide.name?.en || guide.fullName?.en || '', Validators.required],
      nameAr: [guide.name?.ar || guide.fullName?.ar || '', Validators.required],
      bioEn: [guide.bio?.en || '', Validators.required],
      bioAr: [guide.bio?.ar || '', Validators.required],
      languages: [(guide.languages ?? []).join(',')],
      imageUrl: [guide.imageUrl || ''],
      phoneEn: [this.getLocalizedValue(guide.phone), Validators.required],
      phoneAr: [this.getLocalizedValue(guide.phone), Validators.required],
      emailEn: [this.getLocalizedValue(guide.email), [Validators.required, Validators.email]],
      emailAr: [this.getLocalizedValue(guide.email), [Validators.required]],
      facebook: [guide.social?.facebook || ''],
      instagram: [guide.social?.instagram || ''],
      twitter: [guide.social?.twitter || ''],
      tiktok: [guide.social?.tiktok || ''],
      youtube: [guide.social?.youtube || ''],
      latitude: [guide.location?.latitude ?? 0, [Validators.required]],
      longitude: [guide.location?.longitude ?? 0, [Validators.required]],
      addressEn: [guide.location?.address?.en || '', Validators.required],
      addressAr: [guide.location?.address?.ar || '', Validators.required],
      rating: [guide.rating ?? 0, [Validators.required, Validators.min(0), Validators.max(5)]],
      imageFile: [null],
    });
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
      phone: {
        en: value.phoneEn,
        ar: value.phoneAr,
      },
      email: {
        en: value.emailEn,
        ar: value.emailAr,
      },
      social: {
        facebook: value.facebook || '',
        instagram: value.instagram || '',
        twitter: value.twitter || '',
        tiktok: value.tiktok || '',
        youtube: value.youtube || '',
      },
      location: {
        latitude: Number(value.latitude ?? 0),
        longitude: Number(value.longitude ?? 0),
        address: {
          en: value.addressEn,
          ar: value.addressAr,
        },
      },
      rating: Number(value.rating ?? 0),
    };

    this.tourGuideService.updateTourGuide(this.data.guide.id ?? '', payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Update tour guide error:', err),
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.form.patchValue({ imageFile: file });
  }

  close(): void {
    this.dialogRef.close();
  }
}
