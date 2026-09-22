import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { apiUrl, BaseAPI } from '../../Shared/Env/env';
import { RequestSearchDto, PagedRequestResult, RequestItemDto } from '../Models/request.models';
import { OcrResponseDto, RequestFormPayload } from '../Models/request-form.models';
import { RequestDetailsItemDto } from '../Models/requestDetails';
import { RequestAttachmentResponseDto } from '../Models/requestAttachments';
import { CitizenViolationDto } from '../../Citizens/Models/citizen-violation.model';
import { RequestAttachmentReportDto, RequestDateFilterDto, RequestReportDto } from '../Models/request-report.models';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  private http = inject(HttpClient);
  private readonly baseUrl = `${BaseAPI}/Request`;
  private readonly ocrUrl = 'http://172.36.1.90:8200/process';
  private serverRoot = apiUrl.replace(/\/api\/?$/, '');

  private attachmentUrl = `${BaseAPI}/RequestAttachment`

  searchRequests(filter: RequestSearchDto): Observable<PagedRequestResult<RequestItemDto>> {
    let params = new HttpParams()
      .set('Page', (filter.page ?? 1).toString())
      .set('PageSize', (filter.pageSize ?? 10).toString());

    // 1. البحث النصي العام
    if (filter.searchText && filter.searchText.trim()) {
      params = params.set('SearchText', filter.searchText.trim());
    }

    // 2. الرقم القومي
    if (filter.nationalID && filter.nationalID.trim()) {
      params = params.set('NationalID', filter.nationalID.trim());
    }

    // 3. الفلاتر الجغرافية (المحافظة، المركز، القرية)
    if (filter.governorateID != null) {
      params = params.set('GovernorateID', filter.governorateID.toString());
    }

    if (filter.regionID != null) {
      params = params.set('RegionID', filter.regionID.toString());
    }

    if (filter.areaID != null) {
      params = params.set('AreaID', filter.areaID.toString());
    }

    // 4. حالة الاكتمال
    if (filter.isCompleted !== undefined && filter.isCompleted !== null) {
      params = params.set('IsCompleted', filter.isCompleted.toString());
    }

    // 5. فلترة التاريخ (من - إلى) بصيغة ISO Date
    if (filter.fromDate) {
      const fromStr = filter.fromDate instanceof Date
        ? filter.fromDate.toISOString().split('T')[0]
        : filter.fromDate.toString();
      params = params.set('FromDate', fromStr);
    }

    if (filter.toDate) {
      const toStr = filter.toDate instanceof Date
        ? filter.toDate.toISOString().split('T')[0]
        : filter.toDate.toString();
      params = params.set('ToDate', toStr);
    }

    return this.http.get<PagedRequestResult<RequestItemDto>>(`${this.baseUrl}/search`, { params });
  }

  /**
   * إرسال الصور للـ OCR لاستخراج البيانات
   */
  processOcrImages(files: File[]): Observable<OcrResponseDto> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<OcrResponseDto>(this.ocrUrl, formData);
  }

  /**
   * إنشاء الطلب مع المرفقات وإرساله كـ multipart/form-data
   */
  createFormWithAttachments(payload: RequestFormPayload): Observable<any> {
    const formData = new FormData();

    // 1. Citizen Data
    formData.append('Citizen.NationalID', payload.citizen.nationalID);
    formData.append('Citizen.FullName', payload.citizen.fullName);
    formData.append('Citizen.AddressDetails', payload.citizen.addressDetails);
    formData.append('Citizen.RegionID', payload.citizen.regionID.toString());

    // 2. Header Data
    formData.append('Header.StopDecisionNo', payload.header.stopDecisionNo);
    formData.append('Header.StopDecisionDate', payload.header.stopDecisionDate);
    formData.append('Header.ReportNo', payload.header.reportNo);
    formData.append('Header.ReportDate', payload.header.reportDate);
    if (payload.header.announcementDate) {
      formData.append('Header.AnnouncementDate', payload.header.announcementDate);
    }

    // 3. Details Data
    formData.append('Details.GovernorateID', payload.details.governorateID.toString());
    formData.append('Details.RegionID', payload.details.regionID.toString());
    formData.append('Details.AreaID', payload.details.areaID.toString());
    formData.append('Details.PropertyAddress', payload.details.propertyAddress);
    formData.append('Details.ViolationDetails', payload.details.violationDetails);

    // 4. Attachments (Files)
    if (payload.attachment5) formData.append('Attachment5', payload.attachment5, payload.attachment5.name);
    if (payload.attachment6) formData.append('Attachment6', payload.attachment6, payload.attachment6.name);
    if (payload.attachment7) formData.append('Attachment7', payload.attachment7, payload.attachment7.name);

    return this.http.post(`${this.baseUrl}/create-form-with-attachments`, formData);
  }


  /* get by ID */
  getRequestById(id: number): Observable<RequestDetailsItemDto> {
    return this.http.get<RequestDetailsItemDto>(`${this.baseUrl}/${id}`).pipe(
      map(request => {
        if (request && request.attachments) {

          request.attachments = request.attachments.map(att => ({
            ...att,
            fileUrl: att.filePath?.startsWith('http')
              ? att.filePath
              : `${this.serverRoot}${att.filePath.startsWith('/') ? '' : '/'}${att.filePath}`
          }));
        }
        return request;
      })
    );
  }
  /* upload missing attachments  */
  /**
    * رفع مستند ناقص أو استبدال مستند حالي لطلب محدد
    * @param requestId رقم الطلب
    * @param attachmentTypeId نوع المرفق (5: إيقاف أعمال | 6: محضر | 7: إزالة)
    * @param file الملف المراد رفعه (IFormFile)
    */
  uploadMissingAttachment(
    requestId: number,
    attachmentTypeId: number,
    file: File
  ): Observable<RequestAttachmentResponseDto> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<RequestAttachmentResponseDto>(
      `${this.attachmentUrl}/upload/${requestId}/${attachmentTypeId}`,
      formData
    );
  }

  getViolationsByCitizenId(citizenId: number): Observable<CitizenViolationDto[]> {
    return this.http.get<CitizenViolationDto[]>(`${this.baseUrl}/citizen/${citizenId}`);
  }

  /**
   * جلب تقرير المحاضر والمخالفات حسب النطاق الزمني والموقع الجغرافي
   * @param filter معايير التصفية (من تاريخ، إلى تاريخ، المحافظة، المركز، القرية)
   */
  getReport(filter: RequestDateFilterDto): Observable<RequestReportDto[]> {
    let params = new HttpParams();

    // 1. تحويل التاريخ إلى صيغة YYYY-MM-DD
    const fromStr = filter.fromDate instanceof Date
      ? filter.fromDate.toISOString().split('T')[0]
      : filter.fromDate.toString();

    const toStr = filter.toDate instanceof Date
      ? filter.toDate.toISOString().split('T')[0]
      : filter.toDate.toString();

    params = params.set('FromDate', fromStr);
    params = params.set('ToDate', toStr);

    // 2. الفلاتر الجغرافية الاختيارية
    if (filter.governorateID !== undefined && filter.governorateID !== null) {
      params = params.set('GovernorateID', filter.governorateID.toString());
    }

    if (filter.regionID !== undefined && filter.regionID !== null) {
      params = params.set('RegionID', filter.regionID.toString());
    }

    if (filter.areaID !== undefined && filter.areaID !== null) {
      params = params.set('AreaID', filter.areaID.toString());
    }

    return this.http.get<RequestReportDto[]>(`${this.baseUrl}/report`, { params });
  }


  /**
 * جلب تقرير مرفقات ومستندات المحاضر حسب النطاق الزمني والموقع الجغرافي
 * @param filter معايير التصفية (من تاريخ، إلى تاريخ، المحافظة، المركز، القرية)
 */
  getReportAttachments(filter: RequestDateFilterDto): Observable<RequestAttachmentReportDto[]> {
    let params = new HttpParams();

    const formatDate = (val: any): string => {
      if (!val) return '';
      const d = new Date(val);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    params = params.set('FromDate', formatDate(filter.fromDate));
    params = params.set('ToDate', formatDate(filter.toDate));

    if (filter.governorateID !== undefined && filter.governorateID !== null) {
      params = params.set('GovernorateID', filter.governorateID.toString());
    }

    if (filter.regionID !== undefined && filter.regionID !== null) {
      params = params.set('RegionID', filter.regionID.toString());
    }

    if (filter.areaID !== undefined && filter.areaID !== null) {
      params = params.set('AreaID', filter.areaID.toString());
    }

    return this.http.get<RequestAttachmentReportDto[]>(`${this.baseUrl}/report/attachments`, { params }).pipe(
      map((attachments) =>
        attachments.map((att) => ({
          ...att,
          fileUrl: att.filePath?.startsWith('http')
            ? att.filePath
            : `${this.serverRoot}${att.filePath?.startsWith('/') ? '' : '/'}${att.filePath}`
        }))
      )
    );
  }
}
