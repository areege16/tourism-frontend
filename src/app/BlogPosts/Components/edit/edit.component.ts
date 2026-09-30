import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BlogPost } from '../../Models/blog-post';
import { BlogPostService } from '../../Services/blog-post.service';

@Component({
  selector: 'app-blog-post-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss',
})
export class EditComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditComponent>,
    private blogPostService: BlogPostService,
    @Inject(MAT_DIALOG_DATA) public data: { post: BlogPost },
  ) {}

  ngOnInit(): void {
    const post = this.data.post;

    this.form = this.fb.group({
      titleEn: [post.title?.en || '', Validators.required],
      titleAr: [post.title?.ar || '', Validators.required],
      contentEn: [post.content?.en || '', Validators.required],
      contentAr: [post.content?.ar || '', Validators.required],
      excerptEn: [post.excerpt?.en || '', Validators.required],
      excerptAr: [post.excerpt?.ar || '', Validators.required],
      imageFile: [null],
      imageUrl: [post.imageUrl || ''],
      authorEn: [post.author?.en || '', Validators.required],
      authorAr: [post.author?.ar || '', Validators.required],
      publishDate: [post.publishDate ? post.publishDate.slice(0, 16) : new Date().toISOString().slice(0, 16), Validators.required],
      categoryEn: [post.category?.en || '', Validators.required],
      categoryAr: [post.category?.ar || '', Validators.required],
      tags: [(post.tags ?? []).join(',')],
      readTime: [Number(post.readTime ?? 5), [Validators.required, Validators.min(1)]],
      featured: [Boolean(post.featured)],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const formData = new FormData();

    const appendIfPresent = (key: string, fieldValue: any): void => {
      if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
        formData.append(key, String(fieldValue));
      }
    };

    appendIfPresent('Title.En', value.titleEn);
    appendIfPresent('Title.Ar', value.titleAr);
    appendIfPresent('Content.En', value.contentEn);
    appendIfPresent('Content.Ar', value.contentAr);
    appendIfPresent('Excerpt.En', value.excerptEn);
    appendIfPresent('Excerpt.Ar', value.excerptAr);
    appendIfPresent('ImageUrl', value.imageUrl);
    appendIfPresent('Author.En', value.authorEn);
    appendIfPresent('Author.Ar', value.authorAr);
    appendIfPresent('PublishDate', value.publishDate);
    appendIfPresent('Category.En', value.categoryEn);
    appendIfPresent('Category.Ar', value.categoryAr);
    appendIfPresent('ReadTime', Number(value.readTime ?? 0));
    appendIfPresent('Featured', Boolean(value.featured));

    if (value.imageFile instanceof File) {
      formData.append('ImageFile', value.imageFile, value.imageFile.name);
    }

    const tags = (value.tags ?? '')
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);

    tags.forEach((tag: string) => formData.append('Tags', tag));

    this.blogPostService.updateBlogPost(this.data.post.id ?? '', formData).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Update blog post error:', err),
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.form.patchValue({ imageFile: file });
  }

  close(): void {
    this.dialogRef.close();
  }
}
