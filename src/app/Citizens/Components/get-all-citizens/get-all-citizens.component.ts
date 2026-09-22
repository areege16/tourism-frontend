import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CitizenResponseDto, CitizenSearchDto } from '../../Models/citizen';
import { CitizenService } from '../../Services/citizen.service';
import { LocationService } from '../../Services/location/location.service';
import { GovernorateDto, RegionDto } from '../../Models/location.models';
import { ViolationForCitizenComponent } from '../violation-for-citizen/violation-for-citizen.component';
import { DialogModule, DialogRef } from '@angular/cdk/dialog';
import { MatDialog } from '@angular/material/dialog';
import { DetailsComponent } from '../details/details.component';
import { EditComponent } from '../edit/edit.component';
import { CreateComponent } from '../create/create.component';
import { DeleteComponent } from '../delete/delete.component';

@Component({
  selector: 'app-get-all-citizens',
  templateUrl: './get-all-citizens.component.html',
  styleUrl: './get-all-citizens.component.scss'
})
export class GetAllCitizensComponent implements OnInit {
  private citizenService = inject(CitizenService);
  private locationService = inject(LocationService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog)

  searchForm!: FormGroup;
  citizens: CitizenResponseDto[] = [];
  displayedColumns: string[] = ['index', 'fullName', 'nationalID', 'governorateName', 'regionName', 'actions'];
  isLoading = false;

  // Lookups Data
  governorates: GovernorateDto[] = [];
  regions: RegionDto[] = [];

  // Filtered Lookups 
  filteredGovernorates: GovernorateDto[] = [];
  filteredRegions: RegionDto[] = [];

  // Controls Dropdowns
  govSearchCtrl = new FormControl('');
  regionSearchCtrl = new FormControl('');

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  stats = {
    totalCitizens: 0,
    activeCitizens: 0,
    uniqueGovernorates: 0,
    uniqueRegions: 0
  };

  ngOnInit(): void {
    this.initForm();
    this.setupDropdownSearch();
    this.loadGovernorates();
    this.loadCitizens();
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      fullName: [''],
      nationalID: [''],
      governorateName: [''],
      regionName: [''],
      isActive: [null]
    });

    this.searchForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadCitizens();
      });
  }


  private loadGovernorates(): void {
    this.locationService.getGovernorates().subscribe({
      next: (data) => {
        this.governorates = data;
        this.filteredGovernorates = data;
      },
      error: (err) => console.error('Error fetching governorates:', err)
    });
  }

  onGovernorateChange(govName: string): void {
    this.searchForm.get('regionName')?.setValue('', { emitEvent: false });
    this.regions = [];
    this.filteredRegions = [];
    this.regionSearchCtrl.setValue('', { emitEvent: false });

    if (!govName) return;

    const selectedGov = this.governorates.find(g => g.governorateName === govName);
    if (selectedGov) {
      this.locationService.getRegions(selectedGov.governorateID).subscribe({
        next: (data) => {
          this.regions = data;
          this.filteredRegions = data;
        },
        error: (err) => console.error('Error fetching regions:', err)
      });
    }
  }

  private setupDropdownSearch(): void {
    this.govSearchCtrl.valueChanges.subscribe(val => {
      const search = (val || '').trim().toLowerCase();
      this.filteredGovernorates = this.governorates.filter(g =>
        g.governorateName.toLowerCase().includes(search)
      );
    });

    this.regionSearchCtrl.valueChanges.subscribe(val => {
      const search = (val || '').trim().toLowerCase();
      this.filteredRegions = this.regions.filter(r =>
        r.regionName.toLowerCase().includes(search)
      );
    });
  }

  // تحديث دالة loadCitizens لتحديث الإحصائيات الحقيقية:
  loadCitizens(): void {
    this.isLoading = true;
    const formVal = this.searchForm.value;

    const dto: CitizenSearchDto = {
      fullName: formVal.fullName || undefined,
      nationalID: formVal.nationalID || undefined,
      governorateName: formVal.governorateName || undefined,
      regionName: formVal.regionName || undefined,
      isActive: formVal.isActive !== null ? formVal.isActive : undefined,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.citizenService.searchCitizens(dto).subscribe({
      next: (res) => {
        this.citizens = res.items;
        this.totalCount = res.totalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);

        this.stats.totalCitizens = res.totalCount;
        this.stats.activeCitizens = this.citizens.length;
        this.stats.uniqueGovernorates = new Set(this.governorates.map(g => g.governorateID)).size;
        this.stats.uniqueRegions = this.regions.length;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching citizens:', err);
        this.isLoading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadCitizens();
    }
  }

  resetFilters(): void {
    this.govSearchCtrl.setValue('', { emitEvent: false });
    this.regionSearchCtrl.setValue('', { emitEvent: false });
    this.regions = [];
    this.filteredRegions = [];
    this.filteredGovernorates = [...this.governorates];
    this.currentPage = 1;


    this.searchForm.reset({
      fullName: '',
      nationalID: '',
      governorateName: '',
      regionName: '',
      isActive: null
    });
  }


  openCitizenViolations(citizen: CitizenResponseDto): void {
    this.dialog.open(ViolationForCitizenComponent, {
      width: '780px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: {
        citizenId: citizen.citizenID,
        citizenName: citizen.fullName,
        nationalID: citizen.nationalID
      }
    });
  }

  openCitizenDetails(nationalID: string): void {
    this.dialog.open(DetailsComponent, {
      width: '650px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { nationalID }
    });
  }

  openCitizenUpdate(citizen: CitizenResponseDto): void {
    const dialogRef = this.dialog.open(EditComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { nationalID: citizen.nationalID }
    });

    dialogRef.afterClosed().subscribe((isUpdated: boolean) => {
      if (isUpdated) {
        this.loadCitizens();
      }
    });
  }

    createCitizen( ): void {
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
    });

    dialogRef.afterClosed().subscribe((isCreated: boolean) => {
      if (isCreated) {
        this.loadCitizens();
      }
    });
  }

  
    deleteCitizen( citizen: CitizenResponseDto): void {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { citizen}
    });

    dialogRef.afterClosed().subscribe((deleted: boolean) => {
      if (deleted) {
        this.loadCitizens();
      }
    });
  }

}