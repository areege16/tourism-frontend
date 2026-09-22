import { Component, inject, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from '../../../Shared/Services/toast.service';
import { CitizenResponseDto } from '../../Models/citizen';
import { CitizenService } from '../../Services/citizen.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<DetailsComponent>);
  private citizenService = inject(CitizenService);
  private toast = inject(ToastService);

  nationalID: string = '';
  citizenData: CitizenResponseDto | null = null;
  isLoading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { nationalID?: string; citizenData?: CitizenResponseDto }
  ) {
    this.nationalID = data?.nationalID || '';
    if (data?.citizenData) {
      this.citizenData = data.citizenData;
      this.isLoading = false;
    }
  }

  ngOnInit(): void {
    if (!this.citizenData && this.nationalID) {
      this.loadCitizenDetails();
    }
  }

  loadCitizenDetails(): void {
    this.isLoading = true;
    this.citizenService.getByNationalId(this.nationalID).subscribe({
      next: (res) => {
        this.citizenData = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading citizen details:', err);
        this.toast.error('تعذر جلب تفاصيل بيانات المواطن.');
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}