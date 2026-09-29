import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SouvenirProduct } from '../../Models/souvenir-shop';
import { getFullImageUrl as resolveFullImageUrl } from '../../../Shared/Models/getImageUrl';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ProductDetailsComponent>);

  product: SouvenirProduct;
  activeImage = '';
  failedImages = new Set<string>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { product: SouvenirProduct },
  ) {
    this.product = data.product;
  }

  ngOnInit(): void {
    this.activeImage = this.getFullImageUrl(this.product.image);
  }

  /** الصورة الرئيسية + باقي الصور من غير تكرار */
  get allImages(): string[] {
    const list = [this.product.image, ...(this.product.images ?? [])].filter(
      (x): x is string => !!x,
    );
    return Array.from(new Set(list));
  }

  getFullImageUrl(path: string): string {
    return path ? resolveFullImageUrl(path) : '';
  }

  setActiveImage(path: string): void {
    this.activeImage = this.getFullImageUrl(path);
  }

  hasImageError(url: string): boolean {
    return this.failedImages.has(url);
  }

  onImageError(url: string): void {
    this.failedImages.add(url);
  }

  close(): void {
    this.dialogRef.close();
  }
}