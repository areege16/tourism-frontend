import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PhotographerService } from '../../Services/photographer.service';

function minLengthArray(min: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value && control.value.length >= min) {
      return null;
    }
    return { minLengthArray: { requiredLength: min } };
  };
}

@Component({
  selector: 'app-photographer-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  attemptedSave = false;

  mainImagePreview = '';
  mainImageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private photographerService: PhotographerService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateComponent>,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      bioEn: ['', Validators.required],
      bioAr: ['', Validators.required],
      phoneEn: ['', Validators.required],
      phoneAr: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      facebook: [''],
      instagram: [''],
      twitter: [''],
      tiktok: [''],
      youtube: [''],
      latitude: [
        0,
        [Validators.required, Validators.min(-90), Validators.max(90)],
      ],
      longitude: [
        0,
        [Validators.required, Validators.min(-180), Validators.max(180)],
      ],
      addressEn: ['', Validators.required],
      addressAr: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      specialties: this.fb.array([], minLengthArray(1)),
    });
  }

  get specialties(): FormArray {
    return this.form.get('specialties') as FormArray;
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

  removeMainImage(): void {
    this.mainImageFile = null;
    this.mainImagePreview = '';
  }

  onSubmit(): void {
    this.attemptedSave = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open(
        'لا يمكن الحفظ، يرجى مراجعة البيانات المطلوبة',
        'إغلاق',
        { duration: 3000 },
      );
      return;
    }

    const v = this.form.value;

    const formValue = {
      name: { en: v.nameEn, ar: v.nameAr },
      bio: { en: v.bioEn, ar: v.bioAr },
      specialties: v.specialties,
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
      .createPhotographer(formValue, this.mainImageFile)
      .subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.snackBar.open('تم إضافة المصور بنجاح', 'إغلاق', {
              duration: 3000,
            });
            this.dialogRef.close(res.data);
          } else {
            this.snackBar.open(res.message || 'تعذر إضافة المصور', 'إغلاق', {
              duration: 3500,
            });
          }
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('حدث خطأ أثناء إضافة المصور', 'إغلاق', {
            duration: 3500,
          });
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
