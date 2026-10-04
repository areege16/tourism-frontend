export interface SouvenirCategory {
  key: string;
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  descriptionAr: string;
}

export interface SouvenirProduct {
  id: string;
  name: string;
  nameAr: string;
  description?: string | null;
  descriptionAr?: string | null;
  category: string;
  categoryAr: string;
  price?: number | null;
  currency: string;
  image: string;
  images?: string[] | null;
  inStock?: boolean | null;
  handmade?: boolean | null;
  material?: string | null;
  materialAr?: string | null;
  origin?: string | null;
  originAr?: string | null;
}

export interface SouvenirProductCreateValue {
  shopId: string;
  name: string;
  nameAr: string;
  description?: string | null;
  descriptionAr?: string | null;
  category: string;
  categoryAr: string;
  price?: number | null;
  currency: string;
  inStock?: boolean | null;
  handmade?: boolean | null;
  material?: string | null;
  materialAr?: string | null;
  origin?: string | null;
  originAr?: string | null;
}

export interface SouvenirShop {
  id: string;
  name: string;
  nameAr: string;
  description?: string | null;
  descriptionAr?: string | null;
  category?: string | null;
  categoryAr?: string | null;
  address?: string | null;
  addressAr?: string | null;
  phone?: string | null;
  email?: string | null;
  image: string;
  images?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  priceRange?: string | null;
  openingHours?: string | null;
  openingHoursAr?: string | null;
  isFeatured?: boolean | null;
  acceptsCreditCard?: boolean | null;
  hasDelivery?: boolean | null;
  hasOnlineStore?: boolean | null;
  specialties: string[];
  specialtiesAr: string[];
  products?: SouvenirProduct[] | null;
}

export interface SouvenirShopCreateValue {
  name: string;
  nameAr: string;
  description?: string | null;
  descriptionAr?: string | null;
  category?: string | null;
  categoryAr?: string | null;
  address?: string | null;
  addressAr?: string | null;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  priceRange?: string | null;
  openingHours?: string | null;
  openingHoursAr?: string | null;
  isFeatured?: boolean | null;
  acceptsCreditCard?: boolean | null;
  hasDelivery?: boolean | null;
  hasOnlineStore?: boolean | null;
  specialties?: string[] ;
  specialtiesAr?: string[] ;
}

export interface SouvenirShopUpdateValue extends SouvenirShopCreateValue {
  id: string;
}