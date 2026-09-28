import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { BaseAPI } from '../../Shared/Env/env';
import { ApiResponse } from '../../Shared/Models/ApiResponse';
import { LocalizedText, TourGuide } from '../Models/tour-guide';

@Injectable({
  providedIn: 'root',
})
export class TourGuideService {
  private readonly apiUrl = `${BaseAPI}/TourGuides`;

  constructor(private http: HttpClient) {}

  getTourGuides(): Observable<TourGuide[]> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl).pipe(
      map((response) => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data.map((item) => this.mapToTourGuide(item));
        }
        return [];
      }),
      catchError(() => of([])),
    );
  }

  getTourGuideById(id: string): Observable<TourGuide | undefined> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response && response.success && response.data) {
          return this.mapToTourGuide(response.data);
        }
        return undefined;
      }),
      catchError(() => of(undefined)),
    );
  }

  createTourGuide(payload: any): Observable<ApiResponse<TourGuide>> {
    return this.http.post<ApiResponse<TourGuide>>(this.apiUrl, payload);
  }

  updateTourGuide(id: string, payload: any): Observable<ApiResponse<TourGuide>> {
    return this.http.put<ApiResponse<TourGuide>>(`${this.apiUrl}/${id}`, payload);
  }

  deleteTourGuide(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => !!response && response.success),
      catchError(() => of(false)),
    );
  }

  private mapToTourGuide(raw: any): TourGuide {
    const isPlaceholderValue = (value: unknown): boolean => {
      if (value === null || value === undefined) {
        return true;
      }

      const normalized = String(value).trim().toLowerCase();
      return (
        normalized === '' ||
        normalized === 'string' ||
        normalized === 'null' ||
        normalized === 'undefined' ||
        normalized.includes('localhost:4200/string') ||
        normalized.includes('/string')
      );
    };

    const cleanString = (value: unknown): string => {
      if (isPlaceholderValue(value)) {
        return '';
      }

      return typeof value === 'string' ? value : String(value ?? '');
    };

    const normalizeLocalized = (value: any): LocalizedText | undefined => {
      if (!value) {
        return undefined;
      }

      if (typeof value === 'string') {
        const clean = cleanString(value);
        return clean ? { en: clean, ar: clean } : undefined;
      }

      if (Array.isArray(value)) {
        const first = value[0];
        return normalizeLocalized(first);
      }

      if (typeof value === 'object') {
        const en = cleanString(value.en ?? value.En ?? value.english ?? value.nameEn ?? value.fullNameEn);
        const ar = cleanString(value.ar ?? value.Ar ?? value.arabic ?? value.nameAr ?? value.fullNameAr);
        return en || ar ? { en, ar } : undefined;
      }

      return undefined;
    };

    const flattenLanguages = (value: any): string[] => {
      const langList = Array.isArray(value) ? value : value ? [value] : [];

      return langList
        .flatMap((item) => (Array.isArray(item) ? item : [item]))
        .map((language) => {
          if (typeof language === 'string') {
            return language;
          }

          return language?.en || language?.ar || language?.name || language?.value || '';
        })
        .filter((language) => language && language.length > 0);
    };

    const name = normalizeLocalized(raw.name ?? raw.fullName ?? raw.Name ?? raw.FullName ?? raw.nameEn ?? raw.nameAr ?? {
      en: raw.nameEn ?? raw.fullNameEn,
      ar: raw.nameAr ?? raw.fullNameAr,
    });

    const bio = normalizeLocalized(raw.bio ?? raw.Bio ?? { en: raw.bioEn, ar: raw.bioAr });
    const expertise = normalizeLocalized(raw.expertise ?? raw.Expertise ?? { en: raw.expertiseEn, ar: raw.expertiseAr });
    const phone = normalizeLocalized(raw.phone ?? raw.Phone ?? raw.contactPhone ?? raw.phoneNumber);
    const email = normalizeLocalized(raw.email ?? raw.Email ?? raw.contactEmail);
    const locationAddress = normalizeLocalized(raw.location?.address ?? raw.address ?? raw.Address ?? { en: raw.addressEn, ar: raw.addressAr });
    const social = raw.social ?? raw.Social ?? raw.links ?? {
      facebook: cleanString(raw.facebook ?? raw.facebookUrl),
      instagram: cleanString(raw.instagram ?? raw.instagramUrl),
      twitter: cleanString(raw.twitter ?? raw.twitterUrl),
      tiktok: cleanString(raw.tiktok ?? raw.tiktokUrl),
      youtube: cleanString(raw.youtube ?? raw.youtubeUrl),
    };

    return {
      id: raw.id ?? raw.guidId ?? raw.tourGuideId,
      name,
      fullName: name,
      bio,
      expertise,
      phone: phone ? phone : cleanString(raw.phone ?? raw.Phone ?? raw.contactPhone ?? raw.phoneNumber) ? { en: cleanString(raw.phone ?? raw.Phone ?? raw.contactPhone ?? raw.phoneNumber), ar: cleanString(raw.phone ?? raw.Phone ?? raw.contactPhone ?? raw.phoneNumber) } : undefined,
      email: email ? email : cleanString(raw.email ?? raw.Email ?? raw.contactEmail) ? { en: cleanString(raw.email ?? raw.Email ?? raw.contactEmail), ar: cleanString(raw.email ?? raw.Email ?? raw.contactEmail) } : undefined,
      imageUrl: cleanString(raw.imageUrl ?? raw.image ?? raw.avatar ?? raw.profileImage) || undefined,
      languages: flattenLanguages(raw.languages ?? raw.Languages ?? raw.tags ?? raw.language ?? []),
      experienceYears: Number(raw.experienceYears ?? raw.experience ?? raw.yearsOfExperience ?? 0),
      rating: Number(raw.rating ?? raw.averageRating ?? 0),
      isFeatured: Boolean(raw.isFeatured ?? raw.featured ?? false),
      status: raw.status ?? raw.accountStatus ?? 'active',
      social,
      location: {
        latitude: Number(raw.location?.latitude ?? raw.latitude ?? 0),
        longitude: Number(raw.location?.longitude ?? raw.longitude ?? 0),
        address: locationAddress,
      },
    };
  }
}
