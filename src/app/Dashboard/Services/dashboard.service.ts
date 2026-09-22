import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseAPI } from '../../Shared/Env/env';
import { DashboardFilterDto, DashboardResponseDto } from '../Models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${BaseAPI}/RequestDashboard`;

  getDashboardStatistics(filters?: DashboardFilterDto): Observable<DashboardResponseDto> {
    let params = new HttpParams();

    if (filters) {
      if (filters.fromDate) params = params.set('FromDate', filters.fromDate);
      if (filters.toDate) params = params.set('ToDate', filters.toDate);
      if (filters.governorateID) params = params.set('GovernorateID', filters.governorateID.toString());
      if (filters.regionID) params = params.set('RegionID', filters.regionID.toString());
      if (filters.areaID) params = params.set('AreaID', filters.areaID.toString());
    }

    return this.http.get<DashboardResponseDto>(this.apiUrl, { params });
  }
}
