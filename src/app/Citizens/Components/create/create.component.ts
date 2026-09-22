import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../../Shared/Services/toast.service';
import { CreateCitizenDto } from '../../Models/citizen';
import { GovernorateDto, RegionDto, AreaDto } from '../../Models/location.models';
import { CitizenService } from '../../Services/citizen.service';
import { LocationService } from '../../Services/location/location.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<CreateComponent>);
  private fb = inject(FormBuilder);
  private citizenService = inject(CitizenService);
  private locationService = inject(LocationService);
  private toast = inject(ToastService);

  createForm!: FormGroup;
  isSubmitting = false;

  governorates: GovernorateDto[] = [];
  regions: RegionDto[] = [];
  areas: AreaDto[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadGovernorates();
  }

  private initForm(): void {
    this.createForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(200)]],
      nationalID: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      governorateID: [null, Validators.required],
      regionID: [{ value: null, disabled: true }, Validators.required],
      areaID: [{ value: null, disabled: true }],
      addressDetails: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  private loadGovernorates(): void {
    this.locationService.getGovernorates().subscribe({
      next: (data) => this.governorates = data,
      error: (err) => console.error('Error fetching governorates:', err)
    });
  }

  onGovernorateChange(govId: number): void {
    const regionCtrl = this.createForm.get('regionID');
    const areaCtrl = this.createForm.get('areaID');

    regionCtrl?.reset();
    areaCtrl?.reset();
    regionCtrl?.disable();
    areaCtrl?.disable();
    this.regions = [];
    this.areas = [];

    if (govId) {
      this.locationService.getRegions(govId).subscribe({
        next: (data) => {
          this.regions = data;
          if (data.length > 0) regionCtrl?.enable();
        }
      });
    }
  }

  onRegionChange(regionId: number): void {
    const areaCtrl = this.createForm.get('areaID');
    areaCtrl?.reset();
    areaCtrl?.disable();
    this.areas = [];

    if (regionId) {
      this.locationService.getAreas(regionId).subscribe({
        next: (data) => {
          this.areas = data;
          if (data.length > 0) areaCtrl?.enable();
        }
      });
    }
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.createForm.getRawValue();

    const dto: CreateCitizenDto = {
      nationalID: formVal.nationalID.trim(),
      fullName: formVal.fullName.trim(),
      regionID: Number(formVal.regionID),
      areaID: formVal.areaID ? Number(formVal.areaID) : null,
      addressDetails: formVal.addressDetails.trim()
    };

    this.citizenService.createCitizen(dto).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toast.success(res.message || 'تم تسجيل بيانات المواطن بنجاح');
          this.dialogRef.close(true);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || err.error || 'حدث خطأ أثناء حفظ بيانات المواطن';
        this.toast.error(msg);
      }
    });
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}