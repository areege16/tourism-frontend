import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 3500,
    horizontalPosition: 'center',
    verticalPosition: 'top',
    direction: 'rtl'
  };

  /**
   * رسالة نجاح (Pastel Mint)
   */
  success(message: string, action: string = 'إغلاق', duration: number = 3500): void {
    this.show(message, 'success', action, duration);
  }

  /**
   * رسالة خطأ (Pastel Salmon/Peach)
   */
  error(message: string, action: string = 'إغلاق', duration: number = 4500): void {
    this.show(message, 'error', action, duration);
  }

  /**
   * رسالة تحذير (Pastel Butter)
   */
  warning(message: string, action: string = 'إغلاق', duration: number = 4000): void {
    this.show(message, 'warning', action, duration);
  }

  /**
   * رسالة معلوماتية (Pastel Periwinkle)
   */
  info(message: string, action: string = 'إغلاق', duration: number = 3500): void {
    this.show(message, 'info', action, duration);
  }

  private show(message: string, type: ToastType, action: string, duration: number): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      duration,
      panelClass: ['clay-toast', `clay-toast-${type}`]
    });
  }
}