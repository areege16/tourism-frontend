import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { BaseAPI } from '../../Shared/Env/env';
import { ApiResponse } from '../../Shared/Models/ApiResponse';
import { LocalizedText } from '../../Shared/Models/localizedText';
import { TourismInfo } from '../Models/tourism-info';

@Injectable({
  providedIn: 'root',
})
export class TourismInfoService {
  private readonly apiUrl = `${BaseAPI}/TourismInfo`;

  constructor(private http: HttpClient) {}

  getTourismInfo(): Observable<TourismInfo[]> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl).pipe(
      map((response) => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data.map((item) => this.mapToTourismInfo(item));
        }
        return [];
      }),
      catchError(() => of([])),
    );
  }

  getTourismInfoById(id: string): Observable<TourismInfo | undefined> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response && response.success && response.data) {
          return this.mapToTourismInfo(response.data);
        }
        return undefined;
      }),
      catchError(() => of(undefined)),
    );
  }

  createTourismInfo(payload: any): Observable<ApiResponse<TourismInfo>> {
    return this.http.post<ApiResponse<TourismInfo>>(this.apiUrl, payload);
  }

  updateTourismInfo(id: string, payload: any): Observable<ApiResponse<TourismInfo>> {
    return this.http.put<ApiResponse<TourismInfo>>(`${this.apiUrl}/${id}`, payload);
  }

  deleteTourismInfo(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => !!response && response.success),
      catchError(() => of(false)),
    );
  }

  private mapToTourismInfo(raw: any): TourismInfo {
    return {
      id: raw.id ?? raw.tourismInfoId,
      title: this.readLocalized(raw.title, raw.titleEn, raw.titleAr),
      climate: this.readLocalized(raw.climate, raw.climateEn, raw.climateAr),
      bestTimeToVisit: this.readLocalized(raw.bestTimeToVisit, raw.bestTimeToVisitEn, raw.bestTimeToVisitAr),
      whatToWear: this.readLocalized(raw.whatToWear, raw.whatToWearEn, raw.whatToWearAr),
      notes: this.readLocalized(raw.notes, raw.notesEn, raw.notesAr),
      lastUpdated: raw.lastUpdated ?? raw.last_updated ?? raw.updatedAt,
    };
  }

  private readLocalized(value: any, fallbackEn?: string, fallbackAr?: string): LocalizedText {
    if (value && typeof value === 'object') {
      return {
        en: value.en ?? fallbackEn ?? '',
        ar: value.ar ?? fallbackAr ?? '',
      };
    }

    return {
      en: fallbackEn ?? String(value ?? ''),
      ar: fallbackAr ?? String(value ?? ''),
    };
  }
}
