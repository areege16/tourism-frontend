import { Injectable } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { BaseResponse, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../Models/auth';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { apiUrl} from '../../Shared/Env/env';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = `${apiUrl}`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private MID_KEY = 'mid';


  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.token) {
          this.setSession(res);
        }
      })
    );
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify({
        fullName: authResult.fullName,
        userName: authResult.userName,
        roles: authResult.roles,
        expiration: authResult.expiration
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserData(): Partial<LoginResponse> | null {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): Observable<BaseResponse> {
    return this.http.post<BaseResponse>(`${this.baseUrl}/logout`, {}).pipe(
      finalize(() => {
        this.clearSession();
        this.router.navigate(['/auth']);
      })
    );
  }

  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }



  // ================= MID =================
  getMid(): string | null {
    return localStorage.getItem(this.MID_KEY);
  }

  setMid(mid: string): void {
    if (mid && mid.trim()) {
      localStorage.setItem(this.MID_KEY, mid.trim());
    }
  }


  register(data: RegisterRequest): Observable<RegisterResponse> {
  return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, data);
}

}

