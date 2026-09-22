import { Component, inject, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { RequestService } from '../../../Requests/Services/request.service';
import { ToastService } from '../../../Shared/Services/toast.service';
import { CitizenViolationDto } from '../../Models/citizen-violation.model';
import { DetailsComponent } from '../../../Requests/Components/details/details.component';

@Component({
  selector: 'app-violation-for-citizen',

  templateUrl: './violation-for-citizen.component.html',
  styleUrl: './violation-for-citizen.component.scss'
})
export class ViolationForCitizenComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ViolationForCitizenComponent>);
  private reqService = inject(RequestService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog)

  citizenId!: number;
  citizenName: string = '';
  nationalID: string = '';
  
  violations: CitizenViolationDto[] = [];
  isLoading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { citizenId: number; citizenName?: string; nationalID?: string }
  ) {
    this.citizenId = data?.citizenId;
    this.citizenName = data?.citizenName || '';
    this.nationalID = data?.nationalID || '';
  }

  ngOnInit(): void {
    this.loadCitizenViolations();
  }

  loadCitizenViolations(): void {
    this.isLoading = true;
    this.reqService.getViolationsByCitizenId(this.citizenId).subscribe({
      next: (res) => {
        this.violations = res || [];
        if (this.violations.length > 0) {
          this.citizenName = this.violations[0].citizenName || this.citizenName;
          this.nationalID = this.violations[0].nationalID || this.nationalID;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching citizen violations:', err);
        this.toast.error('تعذر جلب سجل مخالفات المواطن');
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

    openRequestDetails(requestId: number): void {
      this.dialog.open(DetailsComponent, {
        width: '850px',
        maxWidth: '95vw',
        panelClass: 'clay-dialog',
        disableClose: true,
        data: { requestId }
      });
    }
}