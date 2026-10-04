import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TourismEventDto } from '../../Models/events';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {
  constructor(
    private dialogRef: MatDialogRef<DetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public event: TourismEventDto
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  getLocalizedText(localizedObj?: { ar?: string; en?: string }): string {
    if (!localizedObj) return '';
    return localizedObj.ar || localizedObj.en || '';
  }

  
    getImage(path?: string): string {
      return getFullImageUrl(path || '');
    }
}