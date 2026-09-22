import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../Services/auth.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  let token = authService.getToken();

  if (token) {
    token = token.replace(/"/g, '').trim();

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};