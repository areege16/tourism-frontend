import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, shareReplay, catchError, of, tap } from 'rxjs';
import { ApiResponse } from '../../Shared/Models/ApiResponse';
import { CreateHotelDto, Hotel, UpdateHotelDto } from '../Models/hotel';
import { BaseAPI } from '../../Shared/Env/env';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private readonly apiUrl = `${BaseAPI}/Hotels`;

  private hotelsCache$?: Observable<Hotel[]>;

  constructor(private http: HttpClient) { }

  /**
   * جلب جميع الفنادق
   * @param refresh لتخطي الكاش وإعادة الجلب من السيرفر
   */
  getHotels(refresh: boolean = false): Observable<Hotel[]> {
    if (!this.hotelsCache$ || refresh) {
      this.hotelsCache$ = this.http.get<ApiResponse<Hotel[]>>(this.apiUrl).pipe(
        map(response => (response && response.success ? response.data : [])),
        shareReplay(1),
        catchError(err => {
          console.error('Error fetching hotels:', err);
          return of([]);
        })
      );
    }
    return this.hotelsCache$;
  }

  /**
   * جلب فندق محدد بواسطة الـ ID
   * @param id معرف الفندق
   */
  getHotelById(id: string): Observable<Hotel | undefined> {
    return this.http.get<ApiResponse<Hotel>>(`${this.apiUrl}/${id}`).pipe(
      map(response => (response && response.success ? response.data : undefined)),
      catchError(err => {
        console.error(`Error fetching hotel with ID: ${id}`, err);
        return of(undefined);
      })
    );
  }

  /**
     * إنشاء فندق جديد مع رفع الملفات (FormData)
     */
  createHotel(dto: CreateHotelDto): Observable<ApiResponse<Hotel>> {
    const formData = this.buildCreateFormData(dto);

    return this.http.post<ApiResponse<Hotel>>(this.apiUrl, formData).pipe(
      tap(response => {
        if (response && response.success) {
          this.hotelsCache$ = undefined; // تفريغ الكاش لإعادة جلب البيانات المحدثة
        }
      })
    );
  }

  /**
   * بناء FormData لإضافة فندق متوافق مع ASP.NET Core Model Binder
   */
  private buildCreateFormData(dto: CreateHotelDto): FormData {
    const formData = new FormData();

    // 1. Name (إجباري)
    formData.append('Name.Ar', dto.name.ar ?? '');
    formData.append('Name.En', dto.name.en ?? '');

    // 2. Description (اختياري - نرسله فقط لو له قيمة)
    if (dto.description?.ar || dto.description?.en) {
      if (dto.description.ar) formData.append('Description.Ar', dto.description.ar);
      if (dto.description.en) formData.append('Description.En', dto.description.en);
    }

    // 3. Main Image
    if (dto.imageFile) {
      formData.append('ImageFile', dto.imageFile, dto.imageFile.name);
    }
    if (dto.imageUrl) {
      formData.append('ImageUrl', dto.imageUrl);
    }

    // 4. Gallery Files
    if (dto.imageGalleryFiles && dto.imageGalleryFiles.length > 0) {
      dto.imageGalleryFiles.forEach(file => {
        formData.append('ImageGalleryFiles', file, file.name);
      });
    }

    // 5. Gallery Urls
    if (dto.imageGallery && dto.imageGallery.length > 0) {
      dto.imageGallery.forEach((url, index) => {
        formData.append(`ImageGallery[${index}]`, url);
      });
    }

    // 6. Numbers & Ratings
    if (dto.latitude != null) formData.append('Latitude', dto.latitude.toString());
    if (dto.longitude != null) formData.append('Longitude', dto.longitude.toString());
    if (dto.rating != null) formData.append('Rating', dto.rating.toString());
    if (dto.reviewCount != null) formData.append('ReviewCount', dto.reviewCount.toString());
    if (dto.starRating != null) formData.append('StarRating', dto.starRating.toString());

    // 7. Price Range (نرسله فقط إذا كان مكتوباً)
    if (dto.priceRange?.ar || dto.priceRange?.en) {
      if (dto.priceRange.ar) formData.append('PriceRange.Ar', dto.priceRange.ar);
      if (dto.priceRange.en) formData.append('PriceRange.En', dto.priceRange.en);
    }

    // 8. Amenities
    if (dto.amenities && dto.amenities.length > 0) {
      dto.amenities.forEach((item, index) => {
        if (item.ar) formData.append(`Amenities[${index}].Ar`, item.ar);
        if (item.en) formData.append(`Amenities[${index}].En`, item.en);
      });
    }

    // 9. Room Types
    if (dto.roomTypes && dto.roomTypes.length > 0) {
      dto.roomTypes.forEach((item, index) => {
        if (item.ar) formData.append(`RoomTypes[${index}].Ar`, item.ar);
        if (item.en) formData.append(`RoomTypes[${index}].En`, item.en);
      });
    }

    // 10. Contact Info (نرسل الحقول التي تحتوي على قيم فقط حتى لا يفشل الـ Email Validation)
    if (dto.contactInfo) {
      if (dto.contactInfo.phone) formData.append('ContactInfo.Phone', dto.contactInfo.phone);
      if (dto.contactInfo.email) formData.append('ContactInfo.Email', dto.contactInfo.email);
      if (dto.contactInfo.website) formData.append('ContactInfo.Website', dto.contactInfo.website);
    }

    return formData;
  }
  /**
   * تحديث بيانات الفندق والملفات المرفقة (FormData)
   */
  updateHotel(id: string, dto: UpdateHotelDto): Observable<ApiResponse<boolean>> {
    const formData = this.buildUpdateFormData(dto);

    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, formData).pipe(
      tap(response => {
        if (response && response.success) {
          this.hotelsCache$ = undefined;
        }
      })
    );
  }

  /**
   * بناء FormData متوافق مع ASP.NET Core Complex Model Binder
   */
  private buildUpdateFormData(dto: UpdateHotelDto): FormData {
    const formData = new FormData();

    formData.append('Id', dto.id);

    // Localized Text: Name & Description
    formData.append('Name.Ar', dto.name.ar ?? '');
    formData.append('Name.En', dto.name.en ?? '');

    // Added ?. because description is optional
    formData.append('Description.Ar', dto.description?.ar ?? '');
    formData.append('Description.En', dto.description?.en ?? '');

    // Main Image
    if (dto.imageFile) {
      formData.append('ImageFile', dto.imageFile, dto.imageFile.name);
    }
    if (dto.existingImageUrl) {
      formData.append('ExistingImageUrl', dto.existingImageUrl);
    }

    // Gallery Files & URLs
    if (dto.newImageGalleryFiles && dto.newImageGalleryFiles.length > 0) {
      dto.newImageGalleryFiles.forEach(file => {
        formData.append('NewImageGalleryFiles', file, file.name);
      });
    }

    if (dto.existingGalleryUrls && dto.existingGalleryUrls.length > 0) {
      dto.existingGalleryUrls.forEach((url, index) => {
        formData.append(`ExistingGalleryUrls[${index}]`, url);
      });
    }

    // Numbers & Basic Types (Your ?. usage here was already correct)
    formData.append('Latitude', dto.latitude?.toString() ?? '0');
    formData.append('Longitude', dto.longitude?.toString() ?? '0');
    formData.append('Rating', dto.rating?.toString() ?? '0');
    formData.append('ReviewCount', dto.reviewCount?.toString() ?? '0');
    formData.append('StarRating', dto.starRating?.toString() ?? '0');

    // Price Range
    // Added ?. because priceRange is optional
    formData.append('PriceRange.Ar', dto.priceRange?.ar ?? '');
    formData.append('PriceRange.En', dto.priceRange?.en ?? '');

    // Amenities List
    if (dto.amenities && dto.amenities.length > 0) {
      dto.amenities.forEach((item, index) => {
        formData.append(`Amenities[${index}].Ar`, item.ar ?? '');
        formData.append(`Amenities[${index}].En`, item.en ?? '');
      });
    }

    // Room Types List
    if (dto.roomTypes && dto.roomTypes.length > 0) {
      dto.roomTypes.forEach((item, index) => {
        formData.append(`RoomTypes[${index}].Ar`, item.ar ?? '');
        formData.append(`RoomTypes[${index}].En`, item.en ?? '');
      });
    }

    // Contact Info
    // Added ?. because contactInfo and website are both optional
    formData.append('ContactInfo.Phone', dto.contactInfo?.phone ?? '');
    formData.append('ContactInfo.Email', dto.contactInfo?.email ?? '');

    formData.append('ContactInfo.Website', dto.contactInfo?.website ?? '');

    return formData;
  }

/**
   * حذف فندق بواسطة الـ ID
   * @param id معرف الفندق المراد حذفه
   */
  deleteHotel(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`).pipe(
      tap(response => {
        if (response && response.success) {
          this.hotelsCache$ = undefined; // تفريغ الكاش لإعادة جلب القائمة المحدثة
        }
      })
    );
  }

}