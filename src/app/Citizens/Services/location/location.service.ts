import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseAPI } from '../../../Shared/Env/env';
import { GovernorateDto, RegionDto, AreaDto, CreateAreaDto } from '../../Models/location.models';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private http = inject(HttpClient);
  private readonly baseUrl = `${BaseAPI}/Location`;
  private getHeaders(): HttpHeaders {
    let token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    token = token.replace(/"/g, '');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getGovernorates(): Observable<GovernorateDto[]> {
    return this.http.get<GovernorateDto[]>(`${this.baseUrl}/governorates`, {
      headers: this.getHeaders()
    });
  }

  getRegions(governorateId: number): Observable<RegionDto[]> {
    return this.http.get<RegionDto[]>(`${this.baseUrl}/regions/${governorateId}`, {
      headers: this.getHeaders()
    });
  }

  getAreas(regionId: number): Observable<AreaDto[]> {
    return this.http.get<AreaDto[]>(`${this.baseUrl}/areas/${regionId}`, {
      headers: this.getHeaders()
    });
  }


  /**
   * إضافة قرية / منطقة جديدة
   * @param dto بيانات المنطقة (اسم المنطقة، كود المنطقة، رقم المركز)
   */
  createArea(dto: CreateAreaDto): Observable<AreaDto> {
    return this.http.post<AreaDto>(`${this.baseUrl}/areas`, dto, {
      headers: this.getHeaders()
    });
  }
}
