import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getFullImageUrl } from '../../../Shared/Models/getImageUrl';
import { BlogPost } from '../../Models/blog-post';
import { BlogPostService } from '../../Services/blog-post.service';
import { CreateComponent } from '../create/create.component';
import { DeleteComponent } from '../delete/delete.component';
import { DetailsComponent } from '../details/details.component';
import { EditComponent } from '../edit/edit.component';

@Component({
  selector: 'app-blog-posts-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  posts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  isLoading = true;
  searchTerm = '';
  failedImages = new Set<string>();

  displayedColumns: string[] = ['index', 'title', 'category', 'author', 'date', 'actions'];

  constructor(
    private blogPostService: BlogPostService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.blogPostService.getBlogPosts().subscribe({
      next: (data) => {
        this.posts = data || [];
        this.filteredPosts = [...this.posts];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredPosts = [...this.posts];
      return;
    }

    this.filteredPosts = this.posts.filter((post) => {
      const title = post.title?.ar || post.title?.en || '';
      const excerpt = post.excerpt?.ar || post.excerpt?.en || '';
      const category = post.category?.ar || post.category?.en || '';
      const author = post.author?.ar || post.author?.en || '';

      return [title, excerpt, category, author].some((value) => value.toLowerCase().includes(term));
    });
  }

  getImage(path?: string): string {
    return getFullImageUrl(path || '');
  }

  hasImageError(url?: string): boolean {
    return !url || this.failedImages.has(url);
  }

  onImageError(url?: string): void {
    if (url) {
      this.failedImages.add(url);
    }
  }

  getLocalizedText(value?: { ar?: string; en?: string }): string {
    if (!value) {
      return '';
    }

    return value.ar || value.en || '';
  }

  openCreate(): void {
    const dialogRef = this.dialog.open(CreateComponent, {
      width: '680px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPosts();
      }
    });
  }

  openEdit(post: BlogPost): void {
    const dialogRef = this.dialog.open(EditComponent, {
      width: '680px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { post },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPosts();
      }
    });
  }

  openDetails(post: BlogPost): void {
    this.dialog.open(DetailsComponent, {
      width: '760px',
      maxWidth: '95vw',
      panelClass: 'clay-dialog',
      data: { postId: post.id },
    });
  }

  openDelete(post: BlogPost): void {
    const dialogRef = this.dialog.open(DeleteComponent, {
      width: '420px',
      maxWidth: '92vw',
      panelClass: 'clay-dialog',
      data: {
        id: post.id,
        title: this.getLocalizedText(post.title),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadPosts();
      }
    });
  }
}