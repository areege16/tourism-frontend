import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { BaseAPI } from '../../Shared/Env/env';
import { ApiResponse } from '../../Shared/Models/ApiResponse';
import { LocalizedText, ServiceItem } from '../Models/service';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private readonly apiUrl = `${BaseAPI}/Services`;

  constructor(private http: HttpClient) {}

  getServices(): Observable<ServiceItem[]> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl).pipe(
      map((response) => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data.map((item) => this.mapToService(item));
        }
        return [];
      }),
      catchError(() => of([])),
    );
  }

  getServiceById(id: string): Observable<ServiceItem | undefined> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response && response.success && response.data) {
          return this.mapToService(response.data);
        }
        return undefined;
      }),
      catchError(() => of(undefined)),
    );
  }

  createService(formData: FormData): Observable<ApiResponse<ServiceItem>> {
    return this.http.post<ApiResponse<ServiceItem>>(this.apiUrl, formData);
  }

  updateService(id: string, formData: FormData): Observable<ApiResponse<ServiceItem>> {
    return this.http.put<ApiResponse<ServiceItem>>(`${this.apiUrl}/${id}`, formData);
  }

  deleteService(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => !!response && response.success),
      catchError(() => of(false)),
    );
  }

  private mapToService(raw: any): ServiceItem {
    return {
      id: raw.id ?? raw.serviceId,
      name: raw.name ?? raw.nameEn ?? '',
      nameAr: raw.nameAr ?? raw.name ?? raw.nameEn ?? '',
      type: raw.type ?? raw.typeEn ?? '',
      typeAr: raw.typeAr ?? raw.type ?? '',
      description: raw.description ?? raw.descriptionEn ?? '',
      descriptionAr: raw.descriptionAr ?? raw.description ?? '',
      address: raw.address ?? raw.addressEn ?? '',
      addressAr: raw.addressAr ?? raw.address ?? '',
      phone: raw.phone ?? '',
      image: raw.image ?? raw.imageUrl ?? '',
      latitude: Number(raw.latitude ?? 0),
      longitude: Number(raw.longitude ?? 0),
      distanceKm: Number(raw.distanceKm ?? 0),
      rating: Number(raw.rating ?? 0),
      is24h: Boolean(raw.is24h ?? raw.is24H ?? false),
      isEmergency: Boolean(raw.isEmergency ?? false),
      isFeatured: Boolean(raw.isFeatured ?? raw.featured ?? false),
      features: Array.isArray(raw.features) ? raw.features : [],
      featuresAr: Array.isArray(raw.featuresAr) ? raw.featuresAr : [],
      specialty: raw.specialty ?? raw.specialtyEn ?? '',
      specialtyAr: raw.specialtyAr ?? raw.specialty ?? '',
      openingHours: raw.openingHours ?? null,
      acceptsInsurance: Boolean(raw.acceptsInsurance ?? false),
      hasDelivery: Boolean(raw.hasDelivery ?? false),
      commentsCount: Number(raw.commentsCount ?? 0),
    };
  }
}
