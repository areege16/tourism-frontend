import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BlogPost } from '../../Models/blog-post';
import { BlogPostService } from '../../Services/blog-post.service';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';

@Component({
  selector: 'app-blog-post-details',
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
  post!: BlogPost;
  isLoading = true;

  constructor(
    private dialogRef: MatDialogRef<DetailsComponent>,
    private blogPostService: BlogPostService,
    @Inject(MAT_DIALOG_DATA) public data: { post?: BlogPost; postId?: string },
  ) {}

  ngOnInit(): void {
    const post = this.data.post;
    const postId = this.data.postId;

    if (post) {
      this.post = post;
      this.isLoading = false;
      return;
    }

    if (postId) {
      this.blogPostService.getBlogPostById(postId).subscribe({
        next: (result) => {
          this.post = result ?? this.post;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
      return;
    }

    this.isLoading = false;
  }

  getLocalizedText(value?: { ar?: string; en?: string }): string {
    if (!value) {
      return '';
    }
    return value.ar || value.en || '';
  }

  getStatusLabel(status?: string): string {
    if (!status) {
      return 'Published';
    }

    return status.toLowerCase() === 'published' ? 'Published' : status;
  }

  getTags(): string[] {
    if (!this.post?.tags) {
      return [];
    }

    return this.post.tags.flatMap((tag) => {
      if (Array.isArray(tag)) {
        return tag;
      }
      return [tag];
    });
  }

  getContentText(content?: { ar?: string; en?: string }): string {
    if (!content) {
      return '';
    }

    return content.ar || content.en || '';
  }

  getImage(path?: string): string {
    return getFullImageUrl(path || '');
  }

  close(): void {
    this.dialogRef.close();
  }
}
