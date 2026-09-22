import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attraction } from '../Models/attraction';
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
}
