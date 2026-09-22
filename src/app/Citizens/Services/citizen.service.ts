import { inject, Injectable } from '@angular/core';
import { BaseAPI } from '../../Shared/Env/env';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CitizenSearchDto, PagedResult, CitizenResponseDto, UpdateCitizenDto, ApiResponse, CitizenDto, CreateCitizenDto } from '../Models/citizen';

@Injectable({
  providedIn: 'root'
})
export class CitizenService {

  private http = inject(HttpClient);

  private readonly baseUrl = `${BaseAPI}/Citizen`;

  searchCitizens(dto: CitizenSearchDto): Observable<PagedResult<CitizenResponseDto>> {
    let params = new HttpParams()
      .set('page', dto.page.toString())
      .set('pageSize', dto.pageSize.toString());

    if (dto.fullName && dto.fullName.trim()) {
      params = params.set('fullName', dto.fullName.trim());
    }

    if (dto.nationalID && dto.nationalID.trim()) {
      params = params.set('nationalID', dto.nationalID.trim());
    }

    if (dto.governorateName && dto.governorateName.trim()) {
      params = params.set('governorateName', dto.governorateName.trim());
    }

    if (dto.regionName && dto.regionName.trim()) {
      params = params.set('regionName', dto.regionName.trim());
    }

    if (dto.isActive !== undefined && dto.isActive !== null) {
      params = params.set('isActive', dto.isActive.toString());
    }

    return this.http.get<PagedResult<CitizenResponseDto>>(`${this.baseUrl}/search`, { params });
  }

  getByNationalId(nationalId: string): Observable<CitizenResponseDto> {
    return this.http.get<CitizenResponseDto>(`${this.baseUrl}/nationalid/${nationalId}`);
  }


  updateCitizen(id: number | string, nationalId: string, dto: UpdateCitizenDto): Observable<string> {
    const params = new HttpParams().set('nationalId', nationalId);

    return this.http.put(`${this.baseUrl}/${id}`, dto, {
      params,
      responseType: 'text'
    });
  }


  createCitizen(dto: CreateCitizenDto): Observable<ApiResponse<CitizenDto>> {
    return this.http.post<ApiResponse<CitizenDto>>(`${this.baseUrl}`, dto);
  }

  softDeleteCitizen(nationalId: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${nationalId}`, {
      responseType: 'text'
    });
  }
}
