import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map, Observable, timeout } from 'rxjs';
import { AuthService } from '../../../Auth/Services/auth.service';
import { LatestScanBatchDto, LatestScanFileDto } from '../../Models/scanner';

@Injectable({
  providedIn: 'root'
})
export class ScannerService {
  private readonly api = 'http://172.36.1.163:1069';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getMidOrThrow(): string {
    const mid = this.authService.getMid();

    if (!mid) {
      throw new Error('فشل تحميل آخر سكان، يرجى إعادة تسجيل الدخول أو فتح البرنامج من جديد');
    }

    return mid;
  }

  // 1. جلب بيانات الدفعة كـ Observable
  getLatestBatch(): Observable<LatestScanBatchDto> {
    const mid = this.getMidOrThrow();
    const params = new HttpParams().set('mid', mid);

    return this.http.get<LatestScanBatchDto>(
      `${this.api}/latest-batch`,
      { params }
    ).pipe(
      timeout(10000) // حماية ضد تعليق الطلب للأبد
    );
  }

  // 2. جلب بيانات الدفعة كـ Promise
  async getLatestBatchAsPromise(): Promise<LatestScanBatchDto> {
    return await firstValueFrom(this.getLatestBatch());
  }

  // 3. تنزيل الملف وإرجاعه كـ Observable<File> (الأفضل للاستخدام مع RxJS و forkJoin)
  downloadLatestScanFile$(item: LatestScanFileDto): Observable<File> {
    const mid = this.getMidOrThrow();
    const params = new HttpParams()
      .set('mid', mid)
      .set('name', item.fileName);

    return this.http.get(`${this.api}/file`, {
      params,
      responseType: 'blob'
    }).pipe(
      timeout(15000),
      map(blob => new File([blob], item.fileName, {
        type: blob.type || 'image/jpeg'
      }))
    );
  }

  // 4. تنزيل الملف وإرجاعه كـ Promise<File> (للمكونات التي تستخدم async/await مثل CreateComponent)
  async downloadLatestScanFile(item: LatestScanFileDto): Promise<File> {
    return await firstValueFrom(this.downloadLatestScanFile$(item));
  }
}