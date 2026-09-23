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
