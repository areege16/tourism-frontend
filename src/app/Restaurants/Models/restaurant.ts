import { LocalizedText } from '../../Shared/Models/localizedText';

export interface Restaurant {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  imageUrl: string;
  imageGallery: string[];
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  cuisineType: LocalizedText;
  priceRange: LocalizedText;
  openingHours: LocalizedText;
  specialties: LocalizedText[];
  center: LocalizedText;
  menuUrl: string;
  contactInfo: {
    phone: LocalizedText;
    email: string;
  };
  features: LocalizedText[];
}

export interface RestaurantCreateFormValue {
  name: LocalizedText;
  description: LocalizedText;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  cuisineType: LocalizedText;
  priceRange: LocalizedText;
  openingHours: LocalizedText;
  specialties: LocalizedText[];
  center: LocalizedText;
  menuUrl: string;
  contactInfoPhone: LocalizedText;
  contactInfoEmail: string;
  features: LocalizedText[];
}

export interface RestaurantFormValue {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  cuisineType: LocalizedText;
  priceRange: LocalizedText;
  openingHours: LocalizedText;
  specialties: LocalizedText[];
  center: LocalizedText;
  menuUrl: string;
  contactInfoPhone: LocalizedText;
  contactInfoEmail: string;
  features: LocalizedText[];
}