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
    value: unknown,
  ) => {
    // إذا كانت القيمة فارغة أو غير محددة أو نصاً فارغاً لا تقومي بإضافتها
    if (value === null || value === undefined || value === '') return;
    fd.append(key, String(value));
  };

  // حقول إلزامية
  fd.append('Name', payload.name?.trim() ?? '');
  fd.append('NameAr', payload.nameAr?.trim() ?? '');
  fd.append('Category', payload.category ?? '');

  // حقول نصية اختيارية (لا ترسل إن كانت فارغة لتبقى null في السيرفر)
  append('Description', payload.description?.trim());
  append('DescriptionAr', payload.descriptionAr?.trim());
  append('CategoryAr', payload.categoryAr?.trim());
  append('Address', payload.address?.trim());
  append('AddressAr', payload.addressAr?.trim());
  append('Phone', payload.phone?.trim());
  append('Email', payload.email?.trim());
  append('PriceRange', payload.priceRange);
  append('OpeningHours', payload.openingHours?.trim());
  append('OpeningHoursAr', payload.openingHoursAr?.trim());

  // حقول أرقام اختيارية (تأكدي ألا تكون NaN أو نص فارغ)
  if (payload.latitude !== null && payload.latitude !== undefined && payload.latitude !== (' ' as any)) {
    append('Latitude', payload.latitude);
  }
  if (payload.longitude !== null && payload.longitude !== undefined) {
    append('Longitude', payload.longitude);
  }
  if (payload.distanceKm !== null && payload.distanceKm !== undefined) {
    append('DistanceKm', payload.distanceKm);
  }
  if (payload.rating !== null && payload.rating !== undefined) {
    append('Rating', payload.rating);
  }
  if (payload.reviewCount !== null && payload.reviewCount !== undefined) {
    append('ReviewCount', payload.reviewCount);
  }

  // حقول منطقية (Booleans)
  if (typeof payload.isFeatured === 'boolean') {
    fd.append('IsFeatured', String(payload.isFeatured));
  }
  if (typeof payload.acceptsCreditCard === 'boolean') {
    fd.append('AcceptsCreditCard', String(payload.acceptsCreditCard));
  }
  if (typeof payload.hasDelivery === 'boolean') {
    fd.append('HasDelivery', String(payload.hasDelivery));
  }
  if (typeof payload.hasOnlineStore === 'boolean') {
    fd.append('HasOnlineStore', String(payload.hasOnlineStore));
  }

  // المصفوفات (تجنبي إرسال عناصر فارغة)
  payload.specialties?.filter(s => !!s?.trim()).forEach((s) => fd.append('Specialties', s.trim()));
  payload.specialtiesAr?.filter(s => !!s?.trim()).forEach((s) => fd.append('SpecialtiesAr', s.trim()));

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

    if (imageFile) fd.append('ImageFile', imageFile);
    else if (existingImage) fd.append('ExistingImage', existingImage);

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
