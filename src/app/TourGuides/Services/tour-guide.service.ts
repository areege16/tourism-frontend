import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { BaseAPI } from '../../Shared/Env/env';
import { ApiResponse } from '../../Shared/Models/ApiResponse';
import { TourGuideDto, CreateTourGuideCommand, UpdateTourGuideCommand } from '../Models/tour-guide';

@Injectable({
  providedIn: 'root',
})
export class TourGuideService {
  private readonly apiUrl = `${BaseAPI}/TourGuides`;
 constructor(private http: HttpClient) {}

  // 1. Get All Tour Guides
  getAll(): Observable<ApiResponse<TourGuideDto[]>> {
    return this.http.get<ApiResponse<TourGuideDto[]>>(this.apiUrl);
  }

  // 2. Get Tour Guide By Id
  getById(id: string): Observable<ApiResponse<TourGuideDto>> {
    return this.http.get<ApiResponse<TourGuideDto>>(`${this.apiUrl}/${id}`);
  }

  // 3. Create Tour Guide (multipart/form-data)
  create(command: CreateTourGuideCommand): Observable<ApiResponse<TourGuideDto>> {
    const formData = this.buildFormData(command);
    return this.http.post<ApiResponse<TourGuideDto>>(this.apiUrl, formData);
  }

  // 4. Update Tour Guide (multipart/form-data)
  update(id: string, command: UpdateTourGuideCommand): Observable<ApiResponse<boolean>> {
    const formData = this.buildFormData({ ...command, id });
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, formData);
  }

  // 5. Delete Tour Guide
  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`);
  }

  // Helper method to convert Command object to FormData for ASP.NET Core Model Binding
  private buildFormData(data: any): FormData {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (value === null || value === undefined) {
        return;
      }

      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (Array.isArray(value)) {
        // Appends array values for ASP.NET Core list binding
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else if (typeof value === 'object') {
        // Recursively appends complex nested objects like Name.En, Social.Facebook, etc.
        Object.keys(value).forEach((subKey) => {
          if (value[subKey] !== null && value[subKey] !== undefined) {
            formData.append(`${key}.${subKey}`, value[subKey]);
          }
        });
      } else {
        formData.append(key, value.toString());
      }
    });

    return formData;
  }
}