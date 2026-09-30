import { LocalizedText, LocalizedArray } from "../../Shared/Models/localizedText";


export interface Hotel {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  imageUrl: string;
  imageGallery: string[];
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  priceRange: LocalizedText;
  amenities: LocalizedArray;
  roomTypes: LocalizedArray;
  contactInfo: {
    phone: LocalizedText;
    email: LocalizedText;
    website?: LocalizedText;
  };
  starRating: number;
  
}


export interface UpdateHotelDto {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  imageFile?: File | null;
  existingImageUrl?: string | null;
  newImageGalleryFiles?: File[] | null;
  existingGalleryUrls?: string[] | null;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  priceRange?: LocalizedText;
  amenities?: LocalizedText[];
  roomTypes?: LocalizedText[];
  contactInfo?: HotelContactInfoInput;
  starRating?: number;
}


export interface HotelContactInfoInput {
  phone?: string;
  email?: string;
  website?: string;
}


export interface CreateHotelDto {
  name: LocalizedText;
  description?: LocalizedText;
  imageFile?: File | null;
  imageGalleryFiles?: File[] | null;
  imageUrl?: string;
  imageGallery?: string[];
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  starRating?: number;
  priceRange?: LocalizedText;
  amenities?: LocalizedText[];
  roomTypes?: LocalizedText[];
  contactInfo?: HotelContactInfoInput;
}