import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PhotographerService } from '../../Services/photographer.service';
import { Photographer } from '../../Models/photographer';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';

@Component({
  selector: 'app-photographer-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;

  mainImagePreview = '';
  mainImageFile: File | null = null;
  existingImageUrl = '';

  constructor(
    private fb: FormBuilder,
    private photographerService: PhotographerService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadPhotographer(this.data.id);
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      bioEn: ['', Validators.required],
      bioAr: ['', Validators.required],
      phoneEn: ['', Validators.required],
      phoneAr: ['', Validators.required],
      email: ['', Validators.required],
      facebook: [''],
      instagram: [''],
      twitter: [''],
      tiktok: [''],
      youtube: [''],
      latitude: [0, Validators.required],
      longitude: [0, Validators.required],
      addressEn: [''],
      addressAr: [''],
      rating: [0, [Validators.min(0), Validators.max(5)]],
      specialties: this.fb.array([]),
    });
  }

  get specialties(): FormArray {
    return this.form.get('specialties') as FormArray;
  }

  private loadPhotographer(id: string): void {
    this.loading = true;
    this.photographerService.getPhotographerById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patchForm(res.data);
        } else {
          this.snackBar.open(
            res.message || 'تعذر تحميل بيانات المصور',
            'إغلاق',
            { duration: 3500 },
          );
        }
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('حدث خطأ أثناء تحميل بيانات المصور', 'إغلاق', {
          duration: 3500,
        });
        this.loading = false;
      },
    });
  }

  private patchForm(data: Photographer): void {
    this.form.patchValue({
      nameEn: data.name?.en,
      nameAr: data.name?.ar,
      bioEn: data.bio?.en,
      bioAr: data.bio?.ar,
      phoneEn: data.phone?.en,
      phoneAr: data.phone?.ar,
      email: data.email?.ar || data.email?.en,
      facebook: data.social?.facebook,
      instagram: data.social?.instagram,
      twitter: data.social?.twitter,
      tiktok: data.social?.tiktok,
      youtube: data.social?.youtube,
      latitude: data.location?.latitude,
      longitude: data.location?.longitude,
      addressEn: data.location?.address?.en,
      addressAr: data.location?.address?.ar,
      rating: data.rating,
    });

    this.specialties.clear();
    (data.specialties ?? []).forEach((s) =>
      this.specialties.push(this.fb.control(s, Validators.required)),
    );

    this.existingImageUrl = data.imageUrl ?? '';
    this.mainImagePreview = getFullImageUrl(this.existingImageUrl);
  }

  addSpecialty(): void {
    this.specialties.push(this.fb.control('', Validators.required));
  }

  removeSpecialty(index: number): void {
    this.specialties.removeAt(index);
  }

  onMainImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.mainImageFile = file;
    this.mainImagePreview = URL.createObjectURL(file);
  }

  fullUrl(path: string): string {
    return getFullImageUrl(path);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('من فضلك راجعي الحقول المطلوبة', 'إغلاق', {
        duration: 3000,
      });
      return;
    }

    const v = this.form.value;

    const formValue = {
      id: this.data.id,
      name: { en: v.nameEn, ar: v.nameAr },
      bio: { en: v.bioEn, ar: v.bioAr },
      specialties: v.specialties,
      imageUrl: this.existingImageUrl,
      phone: { en: v.phoneEn, ar: v.phoneAr },
      email: { en: v.email, ar: v.email },
      social: {
        facebook: v.facebook,
        instagram: v.instagram,
        twitter: v.twitter,
        tiktok: v.tiktok,
        youtube: v.youtube,
      },
      location: {
        latitude: v.latitude,
        longitude: v.longitude,
        address: { en: v.addressEn, ar: v.addressAr },
      },
      rating: v.rating,
    };

    this.saving = true;
    this.photographerService
      .updatePhotographer(
        this.data.id,
        formValue,
        this.mainImageFile,
        this.existingImageUrl,
      )
      .subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.snackBar.open('تم تحديث بيانات المصور بنجاح', 'إغلاق', {
              duration: 3000,
            });
            this.dialogRef.close(true); // res.data بقى bool بس، مش object
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
