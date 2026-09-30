import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BlogPostService } from '../../Services/blog-post.service';

@Component({
  selector: 'app-blog-post-delete',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss',
})
export class DeleteComponent {
  constructor(
    private dialogRef: MatDialogRef<DeleteComponent>,
    private blogPostService: BlogPostService,
    @Inject(MAT_DIALOG_DATA) public data: { id?: string; title?: string },
  ) {}

  confirmDelete(): void {
    if (!this.data.id) {
      this.dialogRef.close(false);
      return;
    }

    this.blogPostService.deleteBlogPost(this.data.id).subscribe({
      next: (success) => this.dialogRef.close(success),
      error: () => this.dialogRef.close(false),
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
