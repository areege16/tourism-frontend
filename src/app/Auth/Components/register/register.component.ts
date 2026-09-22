import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../../Shared/Services/toast.service';
import { RegisterRequest } from '../../Models/auth';
import { AuthService } from '../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { AuthRouteModule } from '../../auth-route.module';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AuthRouteModule,
    MatSelectModule
  ],

  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  private dialogRef = inject(MatDialogRef<RegisterComponent>, { optional: true });
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  registerForm!: FormGroup;
  isSubmitting = false;
  hidePassword = true;

  roles = [
    { id: 1, name: 'مدير نظام (Admin)', description: 'System Administrator' },
    { id: 2, name: 'مدير إدارة (Manager)', description: 'Department Manager' },
    { id: 3, name: 'موظف (Employee)', description: 'Normal User' }
  ];
  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(150)]],
      userName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roleID: [3, [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.registerForm.getRawValue();

    const requestData: RegisterRequest = {
      fullName: formVal.fullName.trim(),
      userName: formVal.userName.trim(),
      password: formVal.password,
      roleID: Number(formVal.roleID)
    };
    this.isSubmitting = true;
    this.authService.register(requestData).subscribe({
      next: (res) => {
        this.isSubmitting = false;

        if (res?.success) {
          this.toast.success(res.message || 'تم إنشاء حساب المستخدم بنجاح');

          // إغلاق الـ Dialog بأمان إذا كان موجوداً
          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            this.registerForm.reset();
          }
        } else {
          this.toast.error(res?.message || 'تعذر إنشاء الحساب');
        }
      },
      error: (err) => {
        this.isSubmitting = false;

        // استخراج نص الخطأ سواء كان مصفوفة أخطاء، كائن، أو نص مباشر
        let errorMessage = 'حدث خطأ أثناء تسجيل المستخدم';

        if (err.error?.errors && typeof err.error.errors === 'object') {
          const errorList = Object.values(err.error.errors).flat();
          errorMessage = errorList.join(' | ') || errorMessage;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.toast.error(errorMessage);
      }
    });
  }

  onClose(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      // إذا كان مفتوحاً كصفحة عادية، نعود للصفحة السابقة
      window.history.back();
    }
  }
}