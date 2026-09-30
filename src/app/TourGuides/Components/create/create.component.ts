import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TourGuideService } from '../../Services/tour-guide.service';

@Component({
  selector: 'app-tour-guide-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateComponent>,
    private tourGuideService: TourGuideService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      bioEn: ['', Validators.required],
      bioAr: ['', Validators.required],
      languages: [''],
      imageUrl: [''],
      phoneEn: ['', Validators.required],
      phoneAr: ['', Validators.required],
      emailEn: ['', [Validators.required, Validators.email]],
      emailAr: ['', [Validators.required]],
      facebook: [''],
      instagram: [''],
      twitter: [''],
      tiktok: [''],
      youtube: [''],
      latitude: [0, [Validators.required]],
      longitude: [0, [Validators.required]],
      addressEn: ['', Validators.required],
      addressAr: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
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

    this.tourGuideService.createTourGuide(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Create tour guide error:', err),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
