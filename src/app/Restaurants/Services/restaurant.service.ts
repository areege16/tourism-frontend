import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant, RestaurantCreateFormValue, RestaurantFormValue } from '../Models/restaurant';
import { BaseAPI } from '../../Shared/Env/env';
import { ApiResponse } from '../../Shared/Models/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private readonly baseUrl = `${BaseAPI}/Restaurants`;

  constructor(private http: HttpClient) {}

  getAllRestaurants(): Observable<ApiResponse<Restaurant[]>> {
    return this.http.get<ApiResponse<Restaurant[]>>(this.baseUrl);
  }

  createRestaurant(
    value: RestaurantCreateFormValue,
    imageFile: File | null,
    galleryFiles: File[],
  ): Observable<ApiResponse<Restaurant>> {
    const fd = new FormData();

    fd.append('Name.En', value.name.en);
    fd.append('Name.Ar', value.name.ar);
    fd.append('Description.En', value.description.en);
    fd.append('Description.Ar', value.description.ar);

    if (imageFile) {
      fd.append('ImageFile', imageFile);
    }

    galleryFiles.forEach((file) => fd.append('ImageGalleryFiles', file));

    fd.append('Latitude', String(value.latitude));
    fd.append('Longitude', String(value.longitude));
    fd.append('Rating', String(value.rating));
    fd.append('ReviewCount', String(value.reviewCount));

    fd.append('CuisineType.En', value.cuisineType.en);
    fd.append('CuisineType.Ar', value.cuisineType.ar);

    fd.append('PriceRange.En', value.priceRange.en);
    fd.append('PriceRange.Ar', value.priceRange.ar);

    fd.append('OpeningHours.En', value.openingHours.en);
    fd.append('OpeningHours.Ar', value.openingHours.ar);

    value.specialties.forEach((s, i) => {
      fd.append(`Specialties[${i}].En`, s.en);
      fd.append(`Specialties[${i}].Ar`, s.ar);
    });

    fd.append('Center.En', value.center.en);
    fd.append('Center.Ar', value.center.ar);

    fd.append('MenuUrl', value.menuUrl ?? '');

    fd.append('ContactInfo.Phone.En', value.contactInfoPhone.en);
    fd.append('ContactInfo.Phone.Ar', value.contactInfoPhone.ar);
    fd.append('ContactInfo.Email', value.contactInfoEmail ?? '');

    value.features.forEach((f, i) => {
      fd.append(`Features[${i}].En`, f.en);
      fd.append(`Features[${i}].Ar`, f.ar);
    });

    return this.http.post<ApiResponse<Restaurant>>(this.baseUrl, fd);
  }

  getRestaurantById(id: string): Observable<ApiResponse<Restaurant>> {
    return this.http.get<ApiResponse<Restaurant>>(`${this.baseUrl}/${id}`);
  }

  updateRestaurant(
    id: string,
    value: RestaurantFormValue,
    imageFile: File | null,
    existingImageUrl: string,
    newGalleryFiles: File[],
    existingGalleryUrls: string[],
  ): Observable<ApiResponse<boolean>> {
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
    fd.append('Rating', String(value.rating));
    fd.append('ReviewCount', String(value.reviewCount));

    fd.append('CuisineType.En', value.cuisineType.en);
    fd.append('CuisineType.Ar', value.cuisineType.ar);

    fd.append('PriceRange.En', value.priceRange.en);
    fd.append('PriceRange.Ar', value.priceRange.ar);

    fd.append('OpeningHours.En', value.openingHours.en);
    fd.append('OpeningHours.Ar', value.openingHours.ar);

    value.specialties.forEach((s, i) => {
      fd.append(`Specialties[${i}].En`, s.en);
      fd.append(`Specialties[${i}].Ar`, s.ar);
    });

    fd.append('Center.En', value.center.en);
    fd.append('Center.Ar', value.center.ar);

    fd.append('MenuUrl', value.menuUrl ?? '');

    fd.append('ContactInfo.Phone.En', value.contactInfoPhone.en);
    fd.append('ContactInfo.Phone.Ar', value.contactInfoPhone.ar);
    fd.append('ContactInfo.Email', value.contactInfoEmail ?? '');

    value.features.forEach((f, i) => {
      fd.append(`Features[${i}].En`, f.en);
      fd.append(`Features[${i}].Ar`, f.ar);
    });

    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${id}`, fd);
  }

  deleteRestaurant(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }
}
