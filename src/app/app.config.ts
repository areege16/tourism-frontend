import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './Auth/Interceptors/auth.interceptor';
import { MAT_DATE_LOCALE } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // ✅ USE FUNCTION INTERCEPTOR DIRECTLY
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    { provide: MAT_DATE_LOCALE, useValue: 'ar-EG' },

    provideAnimationsAsync(),
    
  ]
};