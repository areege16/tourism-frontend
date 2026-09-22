import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

import { GovernorateDto, RegionDto, AreaDto, CreateAreaDto } from '../../../Citizens/Models/location.models';
import { LocationService } from '../../../Citizens/Services/location/location.service';
import { RequestService } from '../../Services/request.service';
import { ScannerService } from '../../Services/Scanner/scanner.service';
import { ToastService } from '../../../Shared/Services/toast.service';
import { OcrResponseDto, RequestFormPayload } from '../../Models/request-form.models';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'ar-EG' }
  ],
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateComponent>);
  private locationService = inject(LocationService);
  private requestService = inject(RequestService);
  private scannerService = inject(ScannerService);
  private toast = inject(ToastService);

  createForm!: FormGroup;
  isProcessingOcr = false;
  isLoadingScan = false;
  isSubmitting = false;

  // المرفقات
  fileStopDecision: File | null = null;
  fileInspectionReport: File | null = null;
  fileRemovalDecision: File | null = null;

  // القوائم الجغرافية
  governorates: GovernorateDto[] = [];
  filteredGovernorates: GovernorateDto[] = [];
  regions: RegionDto[] = [];
  filteredRegions: RegionDto[] = [];
  areas: AreaDto[] = [];
  filteredAreas: AreaDto[] = [];

  // فلاتر البحث
  govSearchCtrl = new FormControl('');
  regionSearchCtrl = new FormControl('');
  areaSearchCtrl = new FormControl('');

  // إضافة منطقة جديدة
  showAddAreaModal = false;
  newAreaName = '';
  newAreaCode = '';
  isAddingArea = false;
  similarAreaWarning: string | null = null;
  matchedSimilarAreas: AreaDto[] = [];

  // المعاينة
  previewStopDecision: string | null = null;
  previewInspectionReport: string | null = null;
  previewRemovalDecision: string | null = null;

  zoomedImageSrc: string | null = null;
  zoomedImageTitle: string = '';

  scannedBatchFiles: File[] = [];
  scannedBatchPreviews: string[] = [];

  readonly DOC_TYPES = [
    { id: 5, label: 'قرار إيقاف أعمال' },
    { id: 6, label: 'محضر معاينة / مخالفة' },
    { id: 7, label: 'قرار إزالة' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.initDropdownFilters();
    this.loadGovernorates();
  }

  private initForm(): void {
    this.createForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      nationalID: ['', [Validators.required, Validators.pattern(/^[0-9]{14}$/)]],
      citizenAddress: ['', Validators.required],
      citizenRegionID: [null],
      stopDecisionNo: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      stopDecisionDate: [new Date().toISOString().split('T')[0], Validators.required],
      reportNo: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      reportDate: [new Date().toISOString().split('T')[0], Validators.required],
      announcementDate: [new Date().toISOString().split('T')[0]],
      governorateID: [null, Validators.required],
      regionID: [{ value: null, disabled: true }, Validators.required],
      areaID: [{ value: null, disabled: true }, Validators.required],
      propertyAddress: ['', Validators.required],
      violationDetails: ['', Validators.required]
    });
  }

  private initDropdownFilters(): void {
    this.govSearchCtrl.valueChanges.subscribe(val => {
      const s = (val || '').trim().toLowerCase();
      this.filteredGovernorates = this.governorates.filter(g => g.governorateName.toLowerCase().includes(s));
    });
    this.regionSearchCtrl.valueChanges.subscribe(val => {
      const s = (val || '').trim().toLowerCase();
      this.filteredRegions = this.regions.filter(r => r.regionName.toLowerCase().includes(s));
    });
    this.areaSearchCtrl.valueChanges.subscribe(val => {
      const s = (val || '').trim().toLowerCase();
      this.filteredAreas = this.areas.filter(a => a.areaName.toLowerCase().includes(s));
    });
  }

  private loadGovernorates(onLoaded?: () => void): void {
    this.locationService.getGovernorates().subscribe({
      next: (data) => {
        this.governorates = data;
        this.filteredGovernorates = data;
        if (onLoaded) onLoaded();
      },
      error: (err) => console.error('Error loading governorates:', err)
    });
  }

  onGovernorateChange(govId: number | null, onLoaded?: () => void): void {
    const regionCtrl = this.createForm.get('regionID');
    const areaCtrl = this.createForm.get('areaID');
    regionCtrl?.reset();
    areaCtrl?.reset();
    regionCtrl?.disable();
    areaCtrl?.disable();

    this.regions = [];
    this.filteredRegions = [];
    this.areas = [];
    this.filteredAreas = [];

    if (!govId) return;

    this.locationService.getRegions(govId).subscribe({
      next: (data) => {
        this.regions = data;
        this.filteredRegions = data;
        if (data.length > 0) {
          regionCtrl?.enable();
          if (onLoaded) onLoaded();
        }
      },
      error: (err) => console.error('Error loading regions:', err)
    });
  }

  onRegionChange(regionId: number | null, onLoaded?: () => void): void {
    const areaCtrl = this.createForm.get('areaID');
    areaCtrl?.reset();
    areaCtrl?.disable();

    this.areas = [];
    this.filteredAreas = [];

    if (!regionId) return;

    this.locationService.getAreas(regionId).subscribe({
      next: (data) => {
        this.areas = data;
        this.filteredAreas = data;
        if (data.length > 0) {
          areaCtrl?.enable();
          if (onLoaded) onLoaded();
        }
      },
      error: (err) => console.error('Error loading areas:', err)
    });
  }

  // ==========================================
  // منطق إضافة وفحص المنطقة الجديدة
  // ==========================================

  openAddAreaDialog(): void {
    const regionId = this.createForm.get('regionID')?.value;
    if (!regionId) {
      this.toast.warning('يرجى اختيار المحافظة والمركز أولاً لتتمكن من إضافة قرية / منطقة.');
      return;
    }
    this.newAreaName = (this.areaSearchCtrl.value || '').trim();
    this.newAreaCode = '';
    this.similarAreaWarning = null;
    this.matchedSimilarAreas = [];
    this.showAddAreaModal = true;
  }

  closeAddAreaDialog(): void {
    this.showAddAreaModal = false;
    this.newAreaName = '';
    this.newAreaCode = '';
    this.similarAreaWarning = null;
    this.matchedSimilarAreas = [];
  }

  // فحص التشابه وتطبيع النصوص العربية
  private normalizeArabic(text: string): string {
    return (text || '')
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[\u064B-\u065F]/g, '') // إزالة التشكيل
      .replace(/\s+/g, ' ');
  }

  checkAndSaveArea(forceSave = false): void {
    const name = this.newAreaName.trim();
    if (!name) {
      this.toast.error('يرجى إدخال اسم المنطقة أو القرية');
      return;
    }

    const regionId = this.createForm.get('regionID')?.value;
    if (!regionId) return;

    const normalizedTarget = this.normalizeArabic(name);

    // 1. التطابق التام
    const exactMatch = this.areas.find(a => this.normalizeArabic(a.areaName) === normalizedTarget);
    if (exactMatch) {
      this.toast.warning(`المنطقة "${exactMatch.areaName}" موجودة بالفعل في هذا المركز وتم تحديدها.`);
      this.createForm.patchValue({ areaID: exactMatch.areaID });
      this.closeAddAreaDialog();
      return;
    }

    // 2. البحث عن أسماء مشابهة (Fuzzy Match)
    if (!forceSave) {
      const similar = this.areas.filter(a => {
        const normExisting = this.normalizeArabic(a.areaName);
        return normExisting.includes(normalizedTarget) || 
               normalizedTarget.includes(normExisting) ||
               this.calculateLevenshteinDistance(normExisting, normalizedTarget) <= 2;
      });

      if (similar.length > 0) {
        this.matchedSimilarAreas = similar;
        this.similarAreaWarning = `يوجد مناطق مسجلة مشابهة لهذا الاسم: (${similar.map(s => s.areaName).join(' ، ')}). هل أنت متأكد من رغبتك في إضافة اسم جديد؟`;
        return;
      }
    }

    // 3. الإضافة على السيرفر
    this.isAddingArea = true;
    const payload: CreateAreaDto = {
      regionID: regionId,
      areaName: name,
    };

    this.locationService.createArea(payload).subscribe({
      next: (createdArea) => {
        this.isAddingArea = false;
        this.toast.success(`تمت إضافة القرية "${createdArea.areaName}" بنجاح.`);

        // تحديث القوائم محلياً وتحديد المنطقة المضافة مباشرة
        this.areas.push(createdArea);
        this.filteredAreas = [...this.areas];
        this.createForm.patchValue({ areaID: createdArea.areaID });
        this.createForm.get('areaID')?.enable();

        this.closeAddAreaDialog();
      },
      error: (err) => {
        this.isAddingArea = false;
        this.toast.error(err.error?.message || err.error || 'حدث خطأ أثناء إضافة المنطقة.');
      }
    });
  }

  // حساب المسافة النصية البسيطة لتقارب الكلمات
  private calculateLevenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // ==========================================
  // دوال التحقق والإدخال
  // ==========================================

  onlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  get hasAtLeastOneFile(): boolean {
    return !!(this.fileStopDecision || this.fileInspectionReport || this.fileRemovalDecision);
  }

  // ==========================================
  // المسح الضوئي (Scanner)
  // ==========================================

  async loadLatestScanBatch(): Promise<void> {
    this.isLoadingScan = true;
    this.scannedBatchFiles = [];
    this.scannedBatchPreviews = [];

    try {
      const batch = await this.scannerService.getLatestBatchAsPromise();

      if (!batch || !batch.files || batch.files.length === 0) {
        this.toast.warning('لا توجد ملفات ماسح ضوئي متاحة.');
        this.isLoadingScan = false;
        return;
      }

      for (const fileItem of batch.files) {
        const file = await this.scannerService.downloadLatestScanFile(fileItem);
        this.scannedBatchFiles.push(file);
        this.scannedBatchPreviews.push(URL.createObjectURL(file));
      }

      this.toast.success(`تم سحب ${this.scannedBatchFiles.length} ورقة من السكانر.`);
    } catch (err: any) {
      console.error('Scanner Error:', err);
      this.toast.error(err.message || 'حدث خطأ أثناء سحب ملفات السكانر.');
    } finally {
      this.isLoadingScan = false;
    }
  }

  assignScannedFileToType(fileIndex: number, typeId: number): void {
    const file = this.scannedBatchFiles[fileIndex];
    const preview = this.scannedBatchPreviews[fileIndex];

    if (typeId === 5) {
      this.fileStopDecision = file;
      this.previewStopDecision = preview;
    } else if (typeId === 6) {
      this.fileInspectionReport = file;
      this.previewInspectionReport = preview;
    } else if (typeId === 7) {
      this.fileRemovalDecision = file;
      this.previewRemovalDecision = preview;
    }

    this.toast.info(`تم تعيين الورقة رقم (${fileIndex + 1}) بنجاح`);
  }

  openZoom(src: string | null, title: string, event?: Event): void {
    if (!src) return;
    if (event) event.stopPropagation();
    this.zoomedImageSrc = src;
    this.zoomedImageTitle = title;
  }

  closeZoom(): void {
    this.zoomedImageSrc = null;
  }

  onFileSelected(event: any, type: 5 | 6 | 7): void {
    const file = event.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (type === 5) {
      this.fileStopDecision = file;
      this.previewStopDecision = previewUrl;
    }
    if (type === 6) {
      this.fileInspectionReport = file;
      this.previewInspectionReport = previewUrl;
    }
    if (type === 7) {
      this.fileRemovalDecision = file;
      this.previewRemovalDecision = previewUrl;
    }
  }

  removeFile(type: 5 | 6 | 7, event?: Event): void {
    if (event) event.stopPropagation();

    if (type === 5) {
      this.fileStopDecision = null;
      this.previewStopDecision = null;
    }
    if (type === 6) {
      this.fileInspectionReport = null;
      this.previewInspectionReport = null;
    }
    if (type === 7) {
      this.fileRemovalDecision = null;
      this.previewRemovalDecision = null;
    }
  }

  triggerOcr(): void {
    const selectedFiles: File[] = [];
    if (this.fileStopDecision) selectedFiles.push(this.fileStopDecision);
    if (this.fileInspectionReport) selectedFiles.push(this.fileInspectionReport);
    if (this.fileRemovalDecision) selectedFiles.push(this.fileRemovalDecision);

    if (selectedFiles.length === 0) {
      this.toast.warning('يرجى اختيار أو سحب صورة واحدة على الأقل.');
      return;
    }

    this.isProcessingOcr = true;
    this.requestService.processOcrImages(selectedFiles).subscribe({
      next: (res) => {
        this.mapOcrToForm(res);
        this.toast.success('تم استخراج البيانات من الصور بنجاح');
        this.isProcessingOcr = false;
      },
      error: (err) => {
        console.error('OCR Error:', err);
        this.toast.warning('تعذر القراءة الآلية، يمكنك إكمال النموذج يدوياً.');
        this.isProcessingOcr = false;
      }
    });
  }

  private mapOcrToForm(ocr: OcrResponseDto): void {
    const cleanNumber = (val?: string | null) => (val || '').replace(/[^0-9]/g, '');
    const formatDate = (dateStr?: string | null) => {
      if (!dateStr) return new Date().toISOString().split('T')[0];
      const parsed = new Date(dateStr.replace(/\//g, '-'));
      return isNaN(parsed.getTime()) ? new Date().toISOString().split('T')[0] : parsed.toISOString().split('T')[0];
    };

    const propertyAddressParts = [
      ocr.property_street,
      ocr.property_city_village,
      ocr.property_district,
      ocr.property_zone
    ].filter(Boolean);

    const reportNo = cleanNumber(ocr.violation_report_number) || cleanNumber(ocr.registration_number);

    this.createForm.patchValue({
      fullName: ocr.owner_name || '',
      nationalID: cleanNumber(ocr.owner_national_id),
      citizenAddress: ocr.owner_street || ocr.owner_district || '',
      stopDecisionNo: cleanNumber(ocr.suspension_decision_number),
      stopDecisionDate: formatDate(ocr.suspension_decision_date),
      reportNo: reportNo,
      reportDate: formatDate(ocr.violation_report_date),
      announcementDate: formatDate(ocr.announcement_date),
      propertyAddress: propertyAddressParts.join(' - '),
      violationDetails: ocr.violating_works || ''
    });

    if (ocr.property_zone) {
      const matchedGov = this.governorates.find(g =>
        g.governorateName.includes(ocr.property_zone!) || ocr.property_zone!.includes(g.governorateName)
      );

      if (matchedGov) {
        this.createForm.patchValue({ governorateID: matchedGov.governorateID });
        this.onGovernorateChange(matchedGov.governorateID, () => {
          if (ocr.property_district) {
            const matchedRegion = this.regions.find(r =>
              r.regionName.includes(ocr.property_district!) || ocr.property_district!.includes(r.regionName)
            );
            if (matchedRegion) {
              this.createForm.patchValue({
                regionID: matchedRegion.regionID,
                citizenRegionID: matchedRegion.regionID
              });
              this.onRegionChange(matchedRegion.regionID);
            }
          }
        });
      }
    }
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.toast.error('يرجى التأكد من استكمال كافة الحقول الإلزامية.');
      return;
    }

    if (!this.hasAtLeastOneFile) {
      this.toast.warning('يجب إرفاق ملف واحد على الأقل لفتح المحضر.');
      return;
    }

    this.isSubmitting = true;
    const val = this.createForm.getRawValue();

    const payload: RequestFormPayload = {
      citizen: {
        fullName: val.fullName.trim(),
        nationalID: val.nationalID.trim(),
        addressDetails: val.citizenAddress.trim(),
        regionID: val.citizenRegionID || val.regionID
      },
      header: {
        stopDecisionNo: val.stopDecisionNo.trim(),
        stopDecisionDate: this.toDateString(val.stopDecisionDate),
        reportNo: val.reportNo.trim(),
        reportDate: this.toDateString(val.reportDate),
        announcementDate: val.announcementDate ? this.toDateString(val.announcementDate) : null
      },
      details: {
        governorateID: val.governorateID,
        regionID: val.regionID,
        areaID: val.areaID,
        propertyAddress: val.propertyAddress.trim(),
        violationDetails: val.violationDetails.trim()
      },
      attachment5: this.fileStopDecision,
      attachment6: this.fileInspectionReport,
      attachment7: this.fileRemovalDecision
    };

    this.requestService.createFormWithAttachments(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toast.success('تم حفظ المحضر وتأكيد المستندات بنجاح');
        this.dialogRef.close('success');
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        console.error('Submission Error:', err);

        if (err.status === 400 && err.error?.errors) {
          const errorEntries = Object.entries(err.error.errors);
          const firstErrorMessage = (errorEntries[0]?.[1] as string[])?.[0] || 'بيانات الإدخال غير صالحة';
          this.toast.error(firstErrorMessage);
        } else {
          this.toast.error(err.error?.title || err.error?.message || err.error || 'حدث خطأ أثناء حفظ المحضر.');
        }
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private toDateString(val: any): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}