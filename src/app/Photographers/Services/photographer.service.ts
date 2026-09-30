import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Photographer,
  PhotographerCreateFormValue,
  PhotographerFormValue,
} from '../Models/photographer';
import { BaseAPI } from '../../Shared/Env/env';
import { ApiResponse } from '../../Shared/Models/ApiResponse';

@Injectable({
  providedIn: 'root',
})
export class PhotographerService {
  private readonly baseUrl = `${BaseAPI}/Photographers`;

  constructor(private http: HttpClient) {}

  getAllPhotographers(): Observable<ApiResponse<Photographer[]>> {
    return this.http.get<ApiResponse<Photographer[]>>(this.baseUrl);
  }

  getPhotographerById(id: string): Observable<ApiResponse<Photographer>> {
    return this.http.get<ApiResponse<Photographer>>(`${this.baseUrl}/${id}`);
  }

  deletePhotographer(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }

  updatePhotographer(
    id: string,
    value: PhotographerFormValue,
    imageFile: File | null,
    existingImageUrl: string,
  ): Observable<ApiResponse<boolean>> {
    const fd = new FormData();

    fd.append('Id', value.id);

    fd.append('Name.En', value.name.en);
    fd.append('Name.Ar', value.name.ar);

    fd.append('Bio.En', value.bio.en);
    fd.append('Bio.Ar', value.bio.ar);

    (value.specialties ?? []).forEach((s, i) => {
      fd.append(`Specialties[${i}]`, s);
    });

    if (imageFile) {
      fd.append('ImageFile', imageFile);
    }
    fd.append('ExistingImageUrl', existingImageUrl ?? '');

    fd.append('Phone.En', value.phone.en);
    fd.append('Phone.Ar', value.phone.ar);

    fd.append('Email.En', value.email.en);
    fd.append('Email.Ar', value.email.ar);

    fd.append('Social.Facebook', value.social.facebook ?? '');
    fd.append('Social.Instagram', value.social.instagram ?? '');
    fd.append('Social.Twitter', value.social.twitter ?? '');
    fd.append('Social.Tiktok', value.social.tiktok ?? '');
    fd.append('Social.Youtube', value.social.youtube ?? '');

    fd.append('Location.Latitude', String(value.location.latitude));
    fd.append('Location.Longitude', String(value.location.longitude));
    fd.append('Location.Address.En', value.location.address.en ?? '');
    fd.append('Location.Address.Ar', value.location.address.ar ?? '');

    fd.append('Rating', String(value.rating ?? 0));

    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${id}`, fd);
  }

  createPhotographer(
    value: PhotographerCreateFormValue,
    imageFile: File | null,
  ): Observable<ApiResponse<Photographer>> {
    const fd = new FormData();

    fd.append('Name.En', value.name.en);
    fd.append('Name.Ar', value.name.ar);

    fd.append('Bio.En', value.bio.en);
    fd.append('Bio.Ar', value.bio.ar);

    (value.specialties ?? []).forEach((s, i) => {
      fd.append(`Specialties[${i}]`, s);
    });

    if (imageFile) {
      fd.append('ImageFile', imageFile);
    }

    fd.append('Phone.En', value.phone.en);
    fd.append('Phone.Ar', value.phone.ar);

    fd.append('Email.En', value.email.en);
    fd.append('Email.Ar', value.email.ar);

    fd.append('Social.Facebook', value.social.facebook ?? '');
    fd.append('Social.Instagram', value.social.instagram ?? '');
    fd.append('Social.Twitter', value.social.twitter ?? '');
    fd.append('Social.Tiktok', value.social.tiktok ?? '');
    fd.append('Social.Youtube', value.social.youtube ?? '');

    fd.append('Location.Latitude', String(value.location.latitude));
    fd.append('Location.Longitude', String(value.location.longitude));
    fd.append('Location.Address.En', value.location.address.en ?? '');
    fd.append('Location.Address.Ar', value.location.address.ar ?? '');

    fd.append('Rating', String(value.rating ?? 0));

    return this.http.post<ApiResponse<Photographer>>(this.baseUrl, fd);
  }
}
