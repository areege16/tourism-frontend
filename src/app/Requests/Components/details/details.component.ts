import { Component, inject, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from '../../../Shared/Services/toast.service';
import { RequestItemDto } from '../../Models/request.models';
import { RequestAttachmentDto, RequestDetailsItemDto } from '../../Models/requestDetails';
import { RequestService } from '../../Services/request.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<DetailsComponent>);
  private requestService = inject(RequestService);
  private toast = inject(ToastService);

  requestId: number;
  requestData: RequestDetailsItemDto | null = null;
  isLoading = true;

  // معاينة وتكبير الصور
  zoomedImageSrc: string | null = null;
  zoomedImageTitle: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { requestId: number }) {
    this.requestId = data?.requestId;
  }

  ngOnInit(): void {
    if (this.requestId) {
      this.loadRequestDetails();
    } else {
      this.toast.error('رقم الطلب غير صحيح');
      this.onClose();
    }
  }

  private loadRequestDetails(): void {
    this.isLoading = true;
    this.requestService.getRequestById(this.requestId).subscribe({
      next: (res) => {
        this.requestData = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching request:', err);
        this.toast.error('تعذر تحميل تفاصيل الطلب');
        this.isLoading = false;
      }
    });
  }

  getAttachmentByType(typeId: number): RequestAttachmentDto | undefined {
    return this.requestData?.attachments?.find(a => a.attachmentTypeID === typeId);
  }

  openZoom(src: string | undefined, title: string, event?: Event): void {
    if (!src) return;
    if (event) event.stopPropagation();
    this.zoomedImageSrc = src;
    this.zoomedImageTitle = title;
  }

  closeZoom(): void {
    this.zoomedImageSrc = null;
  }


  printDetails(attachment?: RequestAttachmentDto): void {
    // 1. إذا تم تمرير مرفق محدد، يتم فتح وطباعة الصورة الأصلية مباشرة
    if (attachment && attachment.fileUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${attachment.originalFileName || 'Print Attachment'}</title>
          <style>
            @page { margin: 0; }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
            }
            img {
              display: block;
              width: 100%;
              height: auto;
              max-width: 100%;
            }
          </style>
        </head>
        <body>
          <img src="${attachment.fileUrl}" onload="window.print(); window.close();" />
        </body>
        </html>
      `);
        printWindow.document.close();
      }
      return;
    }

    window.print();
  }
  onClose(): void {
    this.dialogRef.close();
  }


}