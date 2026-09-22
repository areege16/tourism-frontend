import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DATE_LOCALE, MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { firstValueFrom } from 'rxjs';

import { GovernorateDto, RegionDto, AreaDto } from '../../../Citizens/Models/location.models';
import { LocationService } from '../../../Citizens/Services/location/location.service';
import { ToastService } from '../../../Shared/Services/toast.service';
import { RequestReportDto, RequestDateFilterDto, RequestAttachmentReportDto } from '../../Models/request-report.models';
import { RequestService } from '../../Services/request.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'ar-EG' }
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatTooltipModule,
    MatTableModule,
    MatSelectModule,
    MatDatepickerModule,
    MatOptionModule,
    MatDialogModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private requestService = inject(RequestService);
  private locationService = inject(LocationService);
  private toast = inject(ToastService);

  filterForm!: FormGroup;
  reports: RequestReportDto[] = [];
  isLoading = false;
  hasSearched = false;
  isDownloadingZip = false;

  governorates: GovernorateDto[] = [];
  regions: RegionDto[] = [];
  areas: AreaDto[] = [];

  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.initForm();
    this.loadGovernorates();
    this.fetchReports();
  }

  private initForm(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm = this.fb.group({
      fromDate: [firstDayOfMonth, Validators.required],
      toDate: [today, Validators.required],
      governorateID: [null],
      regionID: [{ value: null, disabled: true }],
      areaID: [{ value: null, disabled: true }]
    });
  }

  private loadGovernorates(): void {
    this.locationService.getGovernorates().subscribe({
      next: (data) => (this.governorates = data),
      error: (err) => console.error('Error loading governorates:', err)
    });
  }

  onGovernorateChange(govId: number | null): void {
    const regionCtrl = this.filterForm.get('regionID');
    const areaCtrl = this.filterForm.get('areaID');

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

  onRegionChange(regionId: number | null): void {
    const areaCtrl = this.filterForm.get('areaID');
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

  private getFilterPayload(): RequestDateFilterDto {
    const val = this.filterForm.getRawValue();
    return {
      fromDate: val.fromDate,
      toDate: val.toDate,
      governorateID: val.governorateID || null,
      regionID: val.regionID || null,
      areaID: val.areaID || null
    };
  }

  // جلب العناصر المعروضة في الصفحة الحالية فقط
  get pagedReports(): RequestReportDto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.reports.slice(startIndex, startIndex + this.pageSize);
  }

  // إجمالي عدد الصفحات
  get totalPages(): number {
    return Math.ceil(this.reports.length / this.pageSize) || 1;
  }

  // رقم أول وآخر عنصر معروض حالياً (لأغراض العرض والإحصاء)
  get startItemIndex(): number {
    return this.reports.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItemIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.reports.length);
  }

  // دوال التنقل
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1; // العودة للصفحة الأولى عند تغيير حجم الصفحة
  }

  // تعديل fetchReports لضبط الصفحة الأولى عند كل بحث جديد
  fetchReports(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      this.toast.error('يرجى تحديد الفترة الزمنية بشكل صحيح');
      return;
    }

    const val = this.filterForm.getRawValue();
    if (new Date(val.fromDate) > new Date(val.toDate)) {
      this.toast.error('تاريخ البداية يجب أن يكون أقل من أو يساوي تاريخ النهاية');
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;

    this.requestService.getReport(this.getFilterPayload()).subscribe({
      next: (data) => {
        this.reports = data;
        this.currentPage = 1; // إعادة الضبط للصفحة الأولى
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error || 'حدث خطأ أثناء تحميل التقرير';
        this.toast.error(msg);
      }
    });
  }
  resetFilters(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm.reset({
      fromDate: firstDayOfMonth,
      toDate: today,
      governorateID: null,
      regionID: null,
      areaID: null
    });

    this.filterForm.get('regionID')?.disable();
    this.filterForm.get('areaID')?.disable();
    this.regions = [];
    this.areas = [];
    this.fetchReports();
  }

  get totalCount(): number {
    return this.reports.length;
  }

  get completedCount(): number {
    return this.reports.filter((r) => r.isCompleted).length;
  }

  get pendingCount(): number {
    return this.reports.filter((r) => !r.isCompleted).length;
  }

  exportToExcel(): void {
    if (!this.reports || this.reports.length === 0) {
      this.toast.error('لا توجد بيانات متاحة للتصدير');
      return;
    }

    const excelData = this.reports.map((item, index) => ({
      'م': index + 1,
      'رقم الطلب': item.requestID,
      'اسم المواطن': item.citizenName || '—',
      'الرقم القومي': item.nationalID || '—',
      'رقم قرار الإيقاف': item.stopDecisionNo || '—',
      'تاريخ قرار الإيقاف': item.stopDecisionDate ? item.stopDecisionDate.split('T')[0] : '—',
      'رقم محضر المخالفة': item.reportNo || '—',
      'تاريخ محضر المخالفة': item.reportDate ? item.reportDate.split('T')[0] : '—',
      'تاريخ الإعلان': item.announcementDate ? item.announcementDate.split('T')[0] : 'لم يعلن',
      'حالة اكتمال المستندات': item.isCompleted ? 'مكتمل' : 'معلق (نواقص)',
      'المحافظة': item.details?.governorateName || '—',
      'المركز / الحي': item.details?.regionName || '—',
      'القرية / المنطقة': item.details?.areaName || '—',
      'عنوان العقار المخالف': item.details?.propertyAddress || '—',
      'تفاصيل المخالفة': item.details?.violationDetails || '—',
      'تاريخ التسجيل بالمنظومة': item.createdAt ? item.createdAt.split('T')[0] : '—'
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    if (!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'].push({ RTL: true });

    worksheet['!cols'] = [
      { wch: 6 }, { wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 18 },
      { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 20 },
      { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 30 }, { wch: 40 }, { wch: 22 }
    ];

    const workbook: XLSX.WorkBook = {
      Sheets: { 'تقرير المحاضر والمخالفات': worksheet },
      SheetNames: ['تقرير المحاضر والمخالفات']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blobData: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    const todayStr = new Date().toISOString().split('T')[0];
    saveAs(blobData, `تقرير_المحاضر_والمخالفات_${todayStr}.xlsx`);
    this.toast.success('تم تصدير ملف الإكسيل بنجاح');
  }

  // دالة تحميل وتجميع كافة المرفقات في ملف ZIP
  async downloadAttachmentsZip(): Promise<void> {
    if (this.filterForm.invalid) {
      this.toast.error('يرجى التأكد من صحة الفلاتر المختارة');
      return;
    }

    this.isDownloadingZip = true;
    this.toast.info('جاري جلب بيانات المرفقات وتجهيز المجلدات...');

    try {
      const attachments = await firstValueFrom(
        this.requestService.getReportAttachments(this.getFilterPayload())
      );

      if (!attachments || attachments.length === 0) {
        this.toast.error('لا توجد مرفقات مطابقة للفترة المحددة');
        this.isDownloadingZip = false;
        return;
      }

      const zip = new JSZip();
      let successCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < attachments.length; i++) {
        const att = attachments[i];

        // تخطي السجلات التي لا تحتوي على مسار ملف أو رابط فارغ
        if (!att.filePath || !att.filePath.trim() || !att.fileUrl || !att.fileUrl.trim()) {
          skippedCount++;
          continue;
        }

        try {
          const fileBlob = await firstValueFrom(
            this.http.get(att.fileUrl, { responseType: 'blob' })
          );

          // 1. تنظيف الأسماء من الرموز الممنوعة في أنظمة التشغيل
          const cleanCitizenName = (att.citizenName || 'مواطن_غير_معروف').replace(/[\\/:*?"<>|]/g, '_').trim();
          const cleanNationalId = (att.nationalID || 'بدون_رقم_قومي').trim();
          const cleanTypeName = (att.attachmentTypeName || 'مستند').replace(/[\\/:*?"<>|]/g, '_').trim();
          const ext = att.fileExtension?.startsWith('.') ? att.fileExtension : `.${att.fileExtension || 'jpg'}`;

          // 2. اسم مجلد المواطن داخل الـ ZIP: [اسم المواطن]_[الرقم القومي]_طلب_[رقم الطلب]
          const citizenFolderName = `${cleanCitizenName}_${cleanNationalId}_طلب_${att.requestID}`;
          const citizenFolder = zip.folder(citizenFolderName);

          // 3. اسم الملف داخل مجلد المواطن: [نوع المرفق]_قرار_[رقم القرار].[الامتداد]
          const stopDecision = att.stopDecisionNo ? `_قرار_${att.stopDecisionNo}` : '';
          const fileNameInsideFolder = `${cleanTypeName}${stopDecision}${ext}`;

          // 4. حفظ الملف داخل مجلد المواطن الخاص به
          if (citizenFolder) {
            citizenFolder.file(fileNameInsideFolder, fileBlob);
            successCount++;
          }
        } catch (downloadErr) {
          console.warn(`تعذر تحميل الملف رقم ${att.attachmentID}:`, downloadErr);
          skippedCount++;
          continue;
        }
      }

      if (successCount === 0) {
        this.toast.error('لم يتم العثور على ملفات فعلية صالحة للتحميل');
        this.isDownloadingZip = false;
        return;
      }

      // توليد ملف الـ ZIP وتنزيله
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const todayStr = new Date().toISOString().split('T')[0];
      saveAs(zipContent, `مرفقات_المواطنين_${todayStr}.zip`);

      if (skippedCount > 0) {
        this.toast.warning(`تم تنظيم وتحميل ${successCount} ملف (تم تخطي ${skippedCount} ملف غير متاح)`);
      } else {
        this.toast.success(`تم إنشاء مجلدات المواطنين وضغط ${successCount} ملف بنجاح`);
      }

    } catch (err) {
      console.error('ZIP Generation Error:', err);
      this.toast.error('حدث خطأ أثناء معالجة ملفات الـ ZIP');
    } finally {
      this.isDownloadingZip = false;
    }
  }
}