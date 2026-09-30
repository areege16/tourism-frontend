import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TourismInfoService } from '../../Services/tourism-info.service';

@Component({
  selector: 'app-tourism-info-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateComponent>,
    private tourismInfoService: TourismInfoService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: this.fb.group({ en: ['', Validators.required], ar: ['', Validators.required] }),
      climate: this.fb.group({ en: [''], ar: [''] }),
      bestTimeToVisit: this.fb.group({ en: [''], ar: [''] }),
      whatToWear: this.fb.group({ en: [''], ar: [''] }),
      notes: this.fb.group({ en: [''], ar: [''] }),
      lastUpdated: [new Date().toISOString()],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      title: this.toLocalized(value.title),
      climate: this.toLocalized(value.climate),
      bestTimeToVisit: this.toLocalized(value.bestTimeToVisit),
      whatToWear: this.toLocalized(value.whatToWear),
      notes: this.toLocalized(value.notes),
      lastUpdated: value.lastUpdated || new Date().toISOString(),
    };

    this.tourismInfoService.createTourismInfo(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Create tourism info error:', err),
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
