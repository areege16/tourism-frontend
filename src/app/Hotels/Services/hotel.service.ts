import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, shareReplay, catchError, of } from 'rxjs';
import { ApiResponse } from '../../Shared/Models/ApiResponse';
import { Hotel } from '../Models/hotel';
import { BaseAPI } from '../../Shared/Env/env';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private readonly apiUrl = `${BaseAPI}/Hotels`;

  private hotelsCache$?: Observable<Hotel[]>;

  constructor(private http: HttpClient) {}

  /**
   * جلب جميع الفنادق
   * @param refresh لتخطي الكاش وإعادة الجلب من السيرفر
   */
  getHotels(refresh: boolean = false): Observable<Hotel[]> {
    if (!this.hotelsCache$ || refresh) {
      this.hotelsCache$ = this.http.get<ApiResponse<Hotel[]>>(this.apiUrl).pipe(
        map(response => (response && response.success ? response.data : [])),
        shareReplay(1),
        catchError(err => {
          console.error('Error fetching hotels:', err);
          return of([]);
        })
      );
    }
    return this.hotelsCache$;
  }

  /**
   * جلب فندق محدد بواسطة الـ ID
   * @param id معرف الفندق
   */
  getHotelById(id: string): Observable<Hotel | undefined> {
    return this.http.get<ApiResponse<Hotel>>(`${this.apiUrl}/${id}`).pipe(
      map(response => (response && response.success ? response.data : undefined)),
      catchError(err => {
        console.error(`Error fetching hotel with ID: ${id}`, err);
        return of(undefined);
      })
    );
  }


}