import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { BlogPostService } from '../../Services/blog-post.service';


@Component({
  selector: 'app-blog-post-create',

  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateComponent>,
    private blogPostService: BlogPostService,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      titleEn: ['', Validators.required],
      titleAr: ['', Validators.required],
      contentEn: ['', Validators.required],
      contentAr: ['', Validators.required],
      excerptEn: ['', Validators.required],
      excerptAr: ['', Validators.required],
      imageFile: [null],
      imageUrl: [''],
      authorEn: ['', Validators.required],
      authorAr: ['', Validators.required],
      publishDate: [new Date().toISOString().slice(0, 16), Validators.required],
      categoryEn: ['', Validators.required],
      categoryAr: ['', Validators.required],
      tags: [''],
      readTime: [5, [Validators.required, Validators.min(1)]],
      featured: [false],
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const formData = new FormData();

    const appendText = (key: string, fieldValue: any): void => {
      if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
        formData.append(key, String(fieldValue));
      }
    };

    appendText('Title.En', value.titleEn);
    appendText('Title.Ar', value.titleAr);
    appendText('Content.En', value.contentEn);
    appendText('Content.Ar', value.contentAr);
    appendText('Excerpt.En', value.excerptEn);
    appendText('Excerpt.Ar', value.excerptAr);
    appendText('ImageUrl', value.imageUrl);
    appendText('Author.En', value.authorEn);
    appendText('Author.Ar', value.authorAr);
    appendText('PublishDate', value.publishDate);
    appendText('Category.En', value.categoryEn);
    appendText('Category.Ar', value.categoryAr);
    appendText('ReadTime', Number(value.readTime ?? 0));
    appendText('Featured', String(Boolean(value.featured)));

    if (value.imageFile instanceof File) {
      formData.append('ImageFile', value.imageFile, value.imageFile.name);
    }

    const tags = (value.tags ?? '')
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0);

    tags.forEach((tag: string) => formData.append('Tags', tag));

    this.blogPostService.createBlogPost(formData).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => console.error('Create blog post error:', err),
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
