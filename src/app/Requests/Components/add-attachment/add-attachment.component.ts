import { ChangeDetectorRef, Component, inject, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin, of, switchMap } from 'rxjs';
import { ToastService } from '../../../Shared/Services/toast.service';
import { RequestService } from '../../Services/request.service';
import { ScannerService } from '../../Services/Scanner/scanner.service';

@Component({
  selector: 'app-add-attachment',

  templateUrl: './add-attachment.component.html',
  styleUrl: './add-attachment.component.scss'
})
export class AddAttachmentComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<AddAttachmentComponent>);
  private requestService = inject(RequestService);
  private scannerService = inject(ScannerService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  requestId: number;
  missingTypeIds: number[] = [];

  // الملفات المختارة للمستندات الناقصة ومعايناتها
  selectedFiles: { [typeId: number]: File } = {};
  previewUrls: { [typeId: number]: string } = {};

  // دفعة السكانر
  scannedBatchFiles: File[] = [];
  scannedBatchPreviews: string[] = [];

  isLoadingScan = false;
  isSubmitting = false;

  zoomedImageSrc: string | null = null;
  zoomedImageTitle: string = '';

  attachmentConfig: { [key: number]: { title: string; icon: string; color: string } } = {
    5: { title: 'قرار إيقاف أعمال', icon: 'assignment_late', color: 'mint' },
    6: { title: 'محضر معاينة / مخالفة', icon: 'report_problem', color: 'butter' },
    7: { title: 'قرار إزالة', icon: 'delete_forever', color: 'peach' }
  };

  availableMissingTypes: { id: number; label: string }[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { requestId: number; missingTypeIds: number[] }) {
    this.requestId = data?.requestId;
    this.missingTypeIds = data?.missingTypeIds || [];
  }

  ngOnInit(): void {
    this.availableMissingTypes = this.missingTypeIds.map(id => ({
      id,
      label: this.attachmentConfig[id]?.title || `مستند نوع ${id}`
    }));
  }

  // ==========================================
  // Scanner Integration (مطابق تماماً لـ CreateComponent)
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
        this.cdr.detectChanges();
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
      this.cdr.detectChanges();
    }
  }

  assignScannedFileToType(fileIndex: number, typeId: number): void {
    const file = this.scannedBatchFiles[fileIndex];
    const preview = this.scannedBatchPreviews[fileIndex];

    if (!file) return;

    this.selectedFiles[typeId] = file;
    this.previewUrls[typeId] = preview;
    this.toast.info(`تم تعيين الورقة كـ "${this.attachmentConfig[typeId]?.title}"`);
    this.cdr.detectChanges();
  }

  onFileChange(typeId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFiles[typeId] = file;
      this.previewUrls[typeId] = URL.createObjectURL(file);
      this.cdr.detectChanges();
    }
  }

  removeFile(typeId: number): void {
    delete this.selectedFiles[typeId];
    delete this.previewUrls[typeId];
    this.cdr.detectChanges();
  }

  hasSelectedAnyFile(): boolean {
    return Object.keys(this.selectedFiles).length > 0;
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

  onSubmit(): void {
    const uploadTasks = Object.keys(this.selectedFiles).map(typeId => {
      const id = Number(typeId);
      return this.requestService.uploadMissingAttachment(this.requestId, id, this.selectedFiles[id]);
    });

    if (uploadTasks.length === 0) {
      this.toast.warning('يرجى اختيار أو تعيين ملف واحد على الأقل للرفع');
      return;
    }

    this.isSubmitting = true;
    forkJoin(uploadTasks).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toast.success('تم إرفاق وحفظ المستندات بنجاح');
        this.dialogRef.close('success');
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toast.error(err.error || 'حدث خطأ أثناء رفع المستندات');
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}