// Services/souvenir.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../../Shared/Env/env';
import {
  SouvenirShop,
  SouvenirCategory,
  SouvenirShopCreateValue,
  SouvenirProduct,
  SouvenirProductCreateValue,
} from '../Models/souvenir-shop';
import { ApiResponse } from '../../Shared/Models/ApiResponse';

@Injectable({ providedIn: 'root' })
export class SouvenirService {
  private http = inject(HttpClient);
  private baseUrl = `${apiUrl}/api/Souvenirs`;

  getCategories(): Observable<ApiResponse<SouvenirCategory[]>> {
    return this.http.get<ApiResponse<SouvenirCategory[]>>(
      `${this.baseUrl}/categories`,
    );
  }

  getAllShops(): Observable<ApiResponse<SouvenirShop[]>> {
    return this.http.get<ApiResponse<SouvenirShop[]>>(`${this.baseUrl}/shops`);
  }
  getShopById(id: string): Observable<ApiResponse<SouvenirShop>> {
    return this.http.get<ApiResponse<SouvenirShop>>(
      `${this.baseUrl}/shops/${id}`,
    );
  }

  // Services/souvenir.service.ts

  private buildShopFormData(payload: SouvenirShopCreateValue): FormData {
    const fd = new FormData();

    const append = (
      key: string,
      value: string | number | boolean | null | undefined,
    ) => {
      if (value === null || value === undefined || value === '') return;
      fd.append(key, String(value));
    };

    fd.append('Name', payload.name);
    fd.append('NameAr', payload.nameAr);

    append('Description', payload.description);
    append('DescriptionAr', payload.descriptionAr);
    append('Category', payload.category);
    append('CategoryAr', payload.categoryAr);
    append('Address', payload.address);
    append('AddressAr', payload.addressAr);
    append('Phone', payload.phone);
    append('Email', payload.email);

    append('Latitude', payload.latitude);
    append('Longitude', payload.longitude);
    append('DistanceKm', payload.distanceKm);
    append('Rating', payload.rating);
    append('ReviewCount', payload.reviewCount);

    append('PriceRange', payload.priceRange);
    append('OpeningHours', payload.openingHours);
    append('OpeningHoursAr', payload.openingHoursAr);

    append('IsFeatured', payload.isFeatured);
    append('AcceptsCreditCard', payload.acceptsCreditCard);
    append('HasDelivery', payload.hasDelivery);
    append('HasOnlineStore', payload.hasOnlineStore);

    payload.specialties.forEach((s) => fd.append('Specialties', s));
    payload.specialtiesAr.forEach((s) => fd.append('SpecialtiesAr', s));

    return fd;
  }

  createShop(
    payload: SouvenirShopCreateValue,
    imageFile: File | null,
    imagesFiles: File[],
  ): Observable<ApiResponse<SouvenirShop>> {
    const fd = this.buildShopFormData(payload);

    if (imageFile) fd.append('ImageFile', imageFile);
    imagesFiles.forEach((f) => fd.append('ImagesFiles', f));

    return this.http.post<ApiResponse<SouvenirShop>>(
      `${this.baseUrl}/shops`,
      fd,
    );
  }

  updateShop(
    id: string,
    payload: SouvenirShopCreateValue,
    imageFile: File | null,
    existingImage: string,
    newImagesFiles: File[],
    existingImages: string[],
  ): Observable<ApiResponse<SouvenirShop>> {
    const fd = this.buildShopFormData(payload);

    fd.append('Id', id);

    // الصورة الرئيسية: ملف جديد لو اتغيرت، وإلا نبعت القديمة
    if (imageFile) fd.append('ImageFile', imageFile);
    else if (existingImage) fd.append('ExistingImage', existingImage);

    // المعرض: القديم اللي فضل + الجديد
    existingImages.forEach((img) => fd.append('ExistingImages', img));
    newImagesFiles.forEach((f) => fd.append('NewImagesFiles', f));

    return this.http.put<ApiResponse<SouvenirShop>>(
      `${this.baseUrl}/shops/${id}`,
      fd,
    );
  }

  deleteShop(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.baseUrl}/shops/${id}`,
    );
  }

  getShopProducts(shopId: string): Observable<ApiResponse<SouvenirProduct[]>> {
    return this.http.get<ApiResponse<SouvenirProduct[]>>(
      `${this.baseUrl}/shops/${shopId}/products`,
    );
  }

  deleteProduct(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.baseUrl}/products/${id}`,
    );
  }

  createProduct(
    payload: SouvenirProductCreateValue,
    imageFile: File | null,
    imagesFiles: File[],
  ): Observable<ApiResponse<SouvenirProduct>> {
    const fd = new FormData();

    const append = (
      key: string,
      value: string | number | boolean | null | undefined,
    ) => {
      if (value === null || value === undefined || value === '') return;
      fd.append(key, String(value));
    };

    fd.append('ShopId', payload.shopId);
    fd.append('Name', payload.name);
    fd.append('NameAr', payload.nameAr);
    fd.append('Category', payload.category);
    fd.append('CategoryAr', payload.categoryAr);
    fd.append('Currency', payload.currency);

    append('Description', payload.description);
    append('DescriptionAr', payload.descriptionAr);
    append('Price', payload.price);
    append('InStock', payload.inStock);
    append('Handmade', payload.handmade);
    append('Material', payload.material);
    append('MaterialAr', payload.materialAr);
    append('Origin', payload.origin);
    append('OriginAr', payload.originAr);

    if (imageFile) fd.append('ImageFile', imageFile);
    imagesFiles.forEach((f) => fd.append('ImagesFiles', f));

    return this.http.post<ApiResponse<SouvenirProduct>>(
      `${this.baseUrl}/products`,
      fd,
    );
  }
}
