
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { GovernorateDto, RegionDto, AreaDto } from '../../../Citizens/Models/location.models';
import { LocationService } from '../../../Citizens/Services/location/location.service';
import { RequestItemDto, RequestSearchDto } from '../../Models/request.models';
import { RequestService } from '../../Services/request.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from '../create/create.component';
import { ToastService } from '../../../Shared/Services/toast.service';
import { DetailsComponent } from '../details/details.component';
import { RequestDetailsItemDto } from '../../Models/requestDetails';
import { AddAttachmentComponent } from '../add-attachment/add-attachment.component';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrl: './request-list.component.scss'
})
export class RequestListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private requestService = inject(RequestService);
  private locationService = inject(LocationService);
  private toast = inject(ToastService);

  // Form & Table State
  searchForm!: FormGroup;
  requests: RequestItemDto[] = [];
  displayedColumns: string[] = [
    'requestID',
    'citizenName',
    'nationalID',
    'stopDecisionNo',
    'stopDecisionDate',
    'reportNo',
    'reportDate',
    'announcementDate',
    'isCompleted',
    'actions'
  ];

  // Pagination & Counts
  isLoading = false;
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  completedCount = 0;
  pendingCount = 0;

  // Locations Lookup Lists
  governorates: GovernorateDto[] = [];
  filteredGovernorates: GovernorateDto[] = [];
  regions: RegionDto[] = [];
  filteredRegions: RegionDto[] = [];
  areas: AreaDto[] = [];
  filteredAreas: AreaDto[] = [];

  // Dropdown Search Controls
  govSearchCtrl = new FormControl('');
  regionSearchCtrl = new FormControl('');
  areaSearchCtrl = new FormControl('');

  readonly REQUIRED_ATTACHMENTS = [
    { id: 5, label: 'قرار إيقاف' },
    { id: 6, label: 'محضر مخالفة' },
    { id: 7, label: 'قرار إزالة' }
  ];


  missingAttachmentsMap: { [requestId: number]: string[] } = {};
  ngOnInit(): void {
    this.initForm();
    this.initDropdownFilters();
    this.loadGovernorates();
    this.loadRequests();
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      searchText: [''],
      nationalID: [''],
      governorateID: [null],
      regionID: [{ value: null, disabled: true }],
      areaID: [{ value: null, disabled: true }],
      isCompleted: [null],
      fromDate: [null],
      toDate: [null]
    });

    this.searchForm.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadRequests();
      });
  }

  private initDropdownFilters(): void {
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

    this.areaSearchCtrl.valueChanges.subscribe(val => {
      const search = (val || '').trim().toLowerCase();
      this.filteredAreas = this.areas.filter(a =>
        a.areaName.toLowerCase().includes(search)
      );
    });
  }

  // --- Location Cascading Handlers ---

  private loadGovernorates(): void {
    this.locationService.getGovernorates().subscribe({
      next: (data) => {
        this.governorates = data;
        this.filteredGovernorates = data;
      },
      error: (err) => {
        console.error('Error fetching governorates:', err)
        this.toast.error('err');
      }
    });
  }

  onGovernorateChange(govId: number | null): void {
    const regionControl = this.searchForm.get('regionID');
    const areaControl = this.searchForm.get('areaID');

    regionControl?.setValue(null, { emitEvent: false });
    areaControl?.setValue(null, { emitEvent: false });
    regionControl?.disable();
    areaControl?.disable();

    this.regions = [];
    this.filteredRegions = [];
    this.areas = [];
    this.filteredAreas = [];
    this.regionSearchCtrl.setValue('', { emitEvent: false });
    this.areaSearchCtrl.setValue('', { emitEvent: false });

    if (!govId) {
      this.loadRequests();
      return;
    }

    this.locationService.getRegions(govId).subscribe({
      next: (data) => {
        this.regions = data;
        this.filteredRegions = data;
        if (data.length > 0) {
          regionControl?.enable();
        }
      },
      error: (err) => {
        console.error('Error fetching regions:', err)
        this.toast.error(err);
      }
    });
  }

  onRegionChange(regionId: number | null): void {
    const areaControl = this.searchForm.get('areaID');
    areaControl?.setValue(null, { emitEvent: false });
    areaControl?.disable();

    this.areas = [];
    this.filteredAreas = [];
    this.areaSearchCtrl.setValue('', { emitEvent: false });

    if (!regionId) {
      this.loadRequests();
      return;
    }

    this.locationService.getAreas(regionId).subscribe({
      next: (data) => {
        this.areas = data;
        this.filteredAreas = data;
        if (data.length > 0) {
          areaControl?.enable();
        }
      },
      error: (err) => {
        console.error('Error fetching areas:', err)
        this.toast.error(err);
      }
    });
  }

  // --- Requests API Fetching ---

  loadRequests(): void {
    this.isLoading = true;
    const formValues = this.searchForm.getRawValue();

    const filterDto: RequestSearchDto = {
      searchText: formValues.searchText,
      nationalID: formValues.nationalID,
      governorateID: formValues.governorateID,
      regionID: formValues.regionID,
      areaID: formValues.areaID,
      isCompleted: formValues.isCompleted,
      fromDate: formValues.fromDate,
      toDate: formValues.toDate,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.requestService.searchRequests(filterDto).subscribe({
      next: (res) => {
        this.requests = res.items || [];
        this.totalCount = res.totalCount;
        this.totalPages = res.totalPages;

        this.completedCount = this.requests.filter(r => r.isCompleted).length;
        this.pendingCount = this.requests.filter(r => !r.isCompleted).length;

        // تصفير القاموس وجلب نواقص الطلبات غير المكتملة
        this.missingAttachmentsMap = {};
        this.requests.forEach(req => {
          if (!req.isCompleted) {
            this.fetchMissingAttachments(req.requestID);
          }
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching requests:', err);
        this.toast.error('تعذر جلب الطلبات');
        this.isLoading = false;
      }
    });
  }

  // --- Pagination & Actions ---

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadRequests();
    }
  }

  clearFilters(): void {
    this.searchForm.reset({
      searchText: '',
      nationalID: '',
      governorateID: null,
      regionID: null,
      areaID: null,
      isCompleted: null,
      fromDate: null,
      toDate: null
    });
    this.searchForm.get('regionID')?.disable();
    this.searchForm.get('areaID')?.disable();
    this.currentPage = 1;
    this.loadRequests();
  }

  createRequest(): void {
    this.dialog.open(CreateComponent, {
      width: '600px',
      disableClose: true
    }).afterClosed().subscribe(result => {
      if (result === 'success') {
        this.toast.success('تم اضافة الطلب بنجاح')
        this.loadRequests();
      }
    });
  }

  openRequestDetails(requestId: number): void {
    this.dialog.open(DetailsComponent, {
      width: '850px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      disableClose: true,
      data: { requestId }
    });
  }

  fetchMissingAttachments(requestId: number): void {

    if (this.missingAttachmentsMap[requestId] !== undefined) return;

    this.requestService.getRequestById(requestId).subscribe({
      next: (details: RequestDetailsItemDto) => {
        if (details.isCompleted) {
          this.missingAttachmentsMap[requestId] = [];
          return;
        }
        const existingTypeIds = new Set(details.attachments?.map(a => a.attachmentTypeID) || []);
        this.missingAttachmentsMap[requestId] = this.REQUIRED_ATTACHMENTS
          .filter(req => !existingTypeIds.has(req.id))
          .map(req => req.label);
      },
      error: () => {
        this.missingAttachmentsMap[requestId] = [];
      }
    });
  }

  addMissingAttachments(requestId: number): void {
    this.isLoading = true;

    // جلب تفاصيل الطلب لمعرفة المرفقات الموجودة بالفعل
    this.requestService.getRequestById(requestId).subscribe({
      next: (details) => {
        this.isLoading = false;

        const existingTypeIds = new Set(details.attachments?.map(a => a.attachmentTypeID) || []);

        // تحديد المرفقات الناقصة فقط (IDs: 5, 6, 7)
        const missingTypeIds = [5, 6, 7].filter(id => !existingTypeIds.has(id));

        if (missingTypeIds.length === 0) {
          this.toast.info('جميع المستندات مكتملة بالفعل');
          return;
        }

        // فتح المودال وتمرير رقم الطلب والأنواع الناقصة فقط
        this.dialog.open(AddAttachmentComponent, {
          width: '750px',
          maxWidth: '95vw',
          panelClass: 'clay-dialog',
          disableClose: true,
          data: {
            requestId: requestId,
            missingTypeIds: missingTypeIds // [5], [6, 7], أو [5, 6, 7] ... إلخ
          }
        }).afterClosed().subscribe(result => {
          if (result === 'success') {
            this.toast.success('تم إرفاق المستندات بنجاح');
            this.loadRequests();
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.toast.error('تعذر جلب بيانات المرفقات للطلب');
      }
    });
  }
}