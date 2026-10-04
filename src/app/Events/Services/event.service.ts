import { Injectable } from '@angular/core';
import { BaseAPI } from '../../Shared/Env/env';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Shared/Models/ApiResponse';
import { TourismEventDto, CreateTourismEventDto } from '../Models/events';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiUrl = `${BaseAPI}/TourismEvents`;

  constructor(private http: HttpClient) { }

  /**
   * جلب جميع الفعاليات السياحية
   */
  getAllEvents(): Observable<ApiResponse<TourismEventDto[]>> {
    return this.http.get<ApiResponse<TourismEventDto[]>>(this.apiUrl);
  }

  /**
   * إنشاء فعالية جديدة برفع الصورة والبيانات بتنسيق FormData
   * @param eventData بيانات الفعالية
   * @param imageFile ملف الصورة (اختياري)
   */
  createEvent(eventData: CreateTourismEventDto, imageFile?: File): Observable<ApiResponse<TourismEventDto>> {
    const formData = new FormData();
    
    // تحويل الكائن إلى JSON String كما يتوقع الـ API (TourismEventFormRequest)
    formData.append('EventDataJson', JSON.stringify(eventData));
    
    if (imageFile) {
      formData.append('Image', imageFile, imageFile.name);
    }

    return this.http.post<ApiResponse<TourismEventDto>>(this.apiUrl, formData);
  }

  /**
   * تحديث بيانات فعالية بواسطة المعرف (ID)
   * @param id معرف الفعالية
   * @param eventData البيانات المحدثة
   * @param imageFile ملف الصورة الجديد (اختياري)
   */
  updateEvent(id: string, eventData: CreateTourismEventDto, imageFile?: File): Observable<ApiResponse<TourismEventDto>> {
    const formData = new FormData();
    
    formData.append('EventDataJson', JSON.stringify(eventData));
    
    if (imageFile) {
      formData.append('Image', imageFile, imageFile.name);
    }

    return this.http.put<ApiResponse<TourismEventDto>>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * حذف فعالية بواسطة المعرف (ID)
   * @param id معرف الفعالية
   */
  deleteEvent(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }
}
