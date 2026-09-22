import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from '../../../Shared/Services/toast.service';
import { CitizenResponseDto, UpdateCitizenDto } from '../../Models/citizen';
import { GovernorateDto, RegionDto, AreaDto } from '../../Models/location.models';
import { CitizenService } from '../../Services/citizen.service';
import { LocationService } from '../../Services/location/location.service';

@Component({
  selector: 'app-edit',

  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<EditComponent>);
  private fb = inject(FormBuilder);
  private citizenService = inject(CitizenService);
  private locationService = inject(LocationService);
  private toast = inject(ToastService);

  editForm!: FormGroup;
  citizen: CitizenResponseDto | null = null;
  nationalID: string = '';
  
  isLoading = true;
  isSubmitting = false;

  governorates: GovernorateDto[] = [];
  regions: RegionDto[] = [];
  areas: AreaDto[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { nationalID: string }) {
    this.nationalID = data.nationalID;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadCitizenData();
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      fullName: [{ value: '', disabled: true }],
      nationalID: [{ value: '', disabled: true }],
      governorateID: [null, Validators.required],
      regionID: [{ value: null, disabled: true }, Validators.required],
      areaID: [{ value: null, disabled: true }],
      addressDetails: ['', [Validators.required, Validators.maxLength(300)]]
    });
  }

  // 1. جلب بيانات المواطن عبر الرقم القومي
  private loadCitizenData(): void {
    this.isLoading = true;
    this.citizenService.getByNationalId(this.nationalID).subscribe({
      next: (citizenData) => {
        this.citizen = citizenData;
        this.populateForm(citizenData);
        this.loadGovernoratesAndCascade(citizenData);
      },
      error: (err) => {
        console.error('Error fetching citizen by nationalId:', err);
        this.toast.error('تعذر جلب بيانات المواطن للتعديل');
        this.isLoading = false;
      }
    });
  }

  private populateForm(c: CitizenResponseDto): void {
    this.editForm.patchValue({
      fullName: c.fullName,
      nationalID: c.nationalID,
      addressDetails: c.addressDetails || ''
    });
  }

  private loadGovernoratesAndCascade(c: CitizenResponseDto): void {
    this.locationService.getGovernorates().subscribe({
      next: (govs) => {
        this.governorates = govs;
        
        // تحديد المحافظة الحالية
        const currentGov = govs.find(g => g.governorateName === c.governorateName);
        if (currentGov) {
          this.editForm.patchValue({ governorateID: currentGov.governorateID });
          this.loadRegions(currentGov.governorateID, c);
        } else {
          this.isLoading = false;
        }
      },
      error: () => this.isLoading = false
    });
  }

  onGovernorateChange(govId: number): void {
    this.editForm.patchValue({ regionID: null, areaID: null });
    this.editForm.get('regionID')?.disable();
    this.editForm.get('areaID')?.disable();
    this.regions = [];
    this.areas = [];

    if (govId) {
      this.loadRegions(govId);
    }
  }

  private loadRegions(govId: number, c?: CitizenResponseDto): void {
    this.locationService.getRegions(govId).subscribe({
      next: (regions) => {
        this.regions = regions;
        this.editForm.get('regionID')?.enable();

        if (c) {
          const currentRegion = regions.find(r => r.regionName === c.regionName || r.regionID === c.regionID);
          if (currentRegion) {
            this.editForm.patchValue({ regionID: currentRegion.regionID });
            this.loadAreas(currentRegion.regionID, c);
          } else {
            this.isLoading = false;
          }
        }
      },
      error: () => this.isLoading = false
    });
  }

  onRegionChange(regionId: number): void {
    this.editForm.patchValue({ areaID: null });
    this.editForm.get('areaID')?.disable();
    this.areas = [];

    if (regionId) {
      this.loadAreas(regionId);
    }
  }

  private loadAreas(regionId: number, c?: CitizenResponseDto): void {
    this.locationService.getAreas(regionId).subscribe({
      next: (areas) => {
        this.areas = areas;
        if (areas.length > 0) {
          this.editForm.get('areaID')?.enable();
        }

        if (c && c.areaID) {
          this.editForm.patchValue({ areaID: c.areaID });
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

onSubmit(): void {
  if (this.editForm.invalid || !this.citizen) {
    this.editForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;
  const formVal = this.editForm.getRawValue();

  const dto: UpdateCitizenDto = {
    regionID: Number(formVal.regionID),
    areaID: formVal.areaID ? Number(formVal.areaID) : null,
    addressDetails: formVal.addressDetails
  };

  this.citizenService.updateCitizen(this.citizen.citizenID, this.citizen.nationalID, dto).subscribe({
    next: (responseMsg: string) => {
      this.isSubmitting = false;
      this.toast.success(responseMsg || 'تم تحديث بيانات المواطن بنجاح');
      this.dialogRef.close(true);
    },
    error: (err) => {
      this.isSubmitting = false;
      this.toast.error(err.error || 'حدث خطأ أثناء تعديل البيانات');
    }
  });
}
  onClose(): void {
    this.dialogRef.close(false);
  }
}