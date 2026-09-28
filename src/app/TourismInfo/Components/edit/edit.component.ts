import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TourismInfo } from '../../Models/tourism-info';
import { TourismInfoService } from '../../Services/tourism-info.service';

@Component({
  selector: 'app-tourism-info-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class EditComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditComponent>,
    private tourismInfoService: TourismInfoService,
    @Inject(MAT_DIALOG_DATA) public data: { info: TourismInfo },
  ) {}

  ngOnInit(): void {
    const info = this.data.info;

    this.form = this.fb.group({
      title: this.fb.group({
        en: [info.title?.en ?? '', Validators.required],
        ar: [info.title?.ar ?? '', Validators.required],
      }),
      climate: this.fb.group({
        en: [info.climate?.en ?? ''],
        ar: [info.climate?.ar ?? ''],
      }),
      bestTimeToVisit: this.fb.group({
        en: [info.bestTimeToVisit?.en ?? ''],
        ar: [info.bestTimeToVisit?.ar ?? ''],
      }),
      whatToWear: this.fb.group({
        en: [info.whatToWear?.en ?? ''],
        ar: [info.whatToWear?.ar ?? ''],
      }),
      notes: this.fb.group({
        en: [info.notes?.en ?? ''],
        ar: [info.notes?.ar ?? ''],
      }),
      lastUpdated: [info.lastUpdated ?? new Date().toISOString()],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      id: this.data.info.id ?? '',
      title: this.toLocalized(value.title),
      climate: this.toLocalized(value.climate),
      bestTimeToVisit: this.toLocalized(value.bestTimeToVisit),
      whatToWear: this.toLocalized(value.whatToWear),
      notes: this.toLocalized(value.notes),
      lastUpdated: value.lastUpdated || new Date().toISOString(),
    };

    this.tourismInfoService.updateTourismInfo(this.data.info.id ?? '', payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Update tourism info error:', err),
    });
  }

  private toLocalized(value: any): { en: string; ar: string } {
    return {
      en: value?.en ?? '',
      ar: value?.ar ?? '',
    };
  }

  close(): void {
    this.dialogRef.close();
  }
}
