import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attraction, AttractionFormValue } from '../Models/attraction';
import { BaseAPI } from '../../Shared/Env/env';
import { ApiResponse } from '../../Shared/Models/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class AttractionService {
  private readonly baseUrl = `${BaseAPI}/Attractions`;

  constructor(private http: HttpClient) {}

  getAllAttractions(): Observable<ApiResponse<Attraction[]>> {
    return this.http.get<ApiResponse<Attraction[]>>(this.baseUrl);
  }

  getAttractionById(id: string): Observable<ApiResponse<Attraction>> {
    return this.http.get<ApiResponse<Attraction>>(`${this.baseUrl}/${id}`);
  }

  updateAttraction(
    id: string,
    value: AttractionFormValue,
    imageFile: File | null,
    existingImageUrl: string,
    newGalleryFiles: File[],
    existingGalleryUrls: string[],
  ): Observable<ApiResponse<Attraction>> {
    const fd = new FormData();

    fd.append('Id', value.id);

    fd.append('Name.En', value.name.en);
    fd.append('Name.Ar', value.name.ar);
    fd.append('Description.En', value.description.en);
    fd.append('Description.Ar', value.description.ar);

    if (imageFile) {
      fd.append('ImageFile', imageFile);
    }
    fd.append('ExistingImageUrl', existingImageUrl ?? '');

    newGalleryFiles.forEach((file) => fd.append('NewImageGalleryFiles', file));
    existingGalleryUrls.forEach((url) => fd.append('ExistingGalleryUrls', url));

    fd.append('Latitude', String(value.latitude));
    fd.append('Longitude', String(value.longitude));

    fd.append('OpeningHours.En', value.openingHours.en);
    fd.append('OpeningHours.Ar', value.openingHours.ar);
    fd.append('TicketPrice.En', value.ticketPrice.en);
    fd.append('TicketPrice.Ar', value.ticketPrice.ar);

    fd.append('BookingUrl', value.bookingUrl ?? '');
    fd.append('Rating', String(value.rating));
    fd.append('ReviewCount', String(value.reviewCount));

    fd.append('Category.En', value.category.en);
    fd.append('Category.Ar', value.category.ar);

    value.features.forEach((feature, i) => {
      fd.append(`Features[${i}].En`, feature.en);
      fd.append(`Features[${i}].Ar`, feature.ar);
    });

    fd.append('HistoricalPeriod.En', value.historicalPeriod.en);
    fd.append('HistoricalPeriod.Ar', value.historicalPeriod.ar);
    fd.append('Significance.En', value.significance.en);
    fd.append('Significance.Ar', value.significance.ar);

    return this.http.put<ApiResponse<Attraction>>(`${this.baseUrl}/${id}`, fd);
  }

  deleteAttraction(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }
}
