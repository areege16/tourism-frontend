import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TourGuideService } from '../../Services/tour-guide.service';
import { CreateTourGuideCommand } from '../../Models/tour-guide';

@Component({
  selector: 'app-tour-guide-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  form!: FormGroup;
  selectedFile?: File;
  imagePreview: string | null = null; // رابط المعاينة

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
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      facebook: [''],
      instagram: [''],
      twitter: [''],
      tiktok: [''],
      youtube: [''],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;

      // إنشاء رابط المعاينة
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(fileInput: HTMLInputElement): void {
    this.selectedFile = undefined;
    this.imagePreview = null;
    fileInput.value = ''; // إزالة الملف من المدخل
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

    const payload: CreateTourGuideCommand = {
      name: {
        en: value.nameEn,
        ar: value.nameAr,
      },
      bio: {
        en: value.bioEn,
        ar: value.bioAr,
      },
      languages,
      imageFile: this.selectedFile,
      phone: value.phone,
      email: value.email,
      social: {
        facebook: value.facebook || undefined,
        instagram: value.instagram || undefined,
        twitter: value.twitter || undefined,
        tiktok: value.tiktok || undefined,
        youtube: value.youtube || undefined,
      },
      rating: Number(value.rating ?? 0),
    };

    this.tourGuideService.create(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Create tour guide error:', err),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}