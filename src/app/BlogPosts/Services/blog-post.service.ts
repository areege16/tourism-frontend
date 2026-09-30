import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { BaseAPI } from '../../Shared/Env/env';
import { ApiResponse } from '../../Shared/Models/ApiResponse';
import { BlogPost } from '../Models/blog-post';

@Injectable({
  providedIn: 'root',
})
export class BlogPostService {
  private readonly apiUrl = `${BaseAPI}/BlogPosts`;

  constructor(private http: HttpClient) {}

  getBlogPosts(): Observable<BlogPost[]> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl).pipe(
      map((response) => {
        if (response && response.success && Array.isArray(response.data)) {
          return response.data.map((item) => this.mapToBlogPost(item));
        }
        return [];
      }),
      catchError(() => of([]))
    );
  }

  getBlogPostById(id: string): Observable<BlogPost | undefined> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        if (response && response.success && response.data) {
          return this.mapToBlogPost(response.data);
        }
        return undefined;
      }),
      catchError(() => of(undefined))
    );
  }

  createBlogPost(formData: FormData): Observable<ApiResponse<BlogPost>> {
    return this.http.post<ApiResponse<BlogPost>>(this.apiUrl, formData);
  }

  updateBlogPost(id: string, formData: FormData): Observable<ApiResponse<BlogPost>> {
    return this.http.put<ApiResponse<BlogPost>>(`${this.apiUrl}/${id}`, formData);
  }

  deleteBlogPost(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map((response) => !!response && response.success),
      catchError(() => of(false))
    );
  }

  private mapToBlogPost(raw: any): BlogPost {
    const flattenTags = (tags: any): string[] => {
      if (!Array.isArray(tags)) {
        return [];
      }

      const values = tags.flatMap((item) => (Array.isArray(item) ? item : [item]));
      return values.map((tag) => {
        if (typeof tag === 'string') {
          return tag;
        }
        return tag?.en || tag?.ar || '';
      }).filter((tag) => tag.length > 0);
    };

    return {
      id: raw.id,
      title: {
        en: raw.titleEn ?? raw.title?.en ?? '',
        ar: raw.titleAr ?? raw.title?.ar ?? '',
      },
      content: {
        en: raw.contentEn ?? raw.content?.en ?? '',
        ar: raw.contentAr ?? raw.content?.ar ?? '',
      },
      excerpt: {
        en: raw.excerptEn ?? raw.excerpt?.en ?? '',
        ar: raw.excerptAr ?? raw.excerpt?.ar ?? '',
      },
      category: {
        en: raw.categoryEn ?? raw.category?.en ?? '',
        ar: raw.categoryAr ?? raw.category?.ar ?? '',
      },
      author: {
        en: raw.authorEn ?? raw.author?.en ?? raw.author?.name?.en ?? '',
        ar: raw.authorAr ?? raw.author?.ar ?? raw.author?.name?.ar ?? '',
      },
      imageUrl: raw.imageUrl,
      publishDate: raw.publishDate,
      readTime: raw.readTime,
      featured: raw.featured ?? false,
      tags: flattenTags(raw.tags),
      status: raw.status ?? 'published',
    };
  }
}