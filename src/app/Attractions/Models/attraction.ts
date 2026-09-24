import { LocalizedText } from "../../Shared/Models/localizedText";


export interface Attraction {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  imageUrl: string;
  imageGallery: string[];
  latitude: number;
  longitude: number;
  openingHours: LocalizedText;
  ticketPrice: LocalizedText;
  bookingUrl: string;
  rating: number;
  reviewCount: number;
  category: LocalizedText;
  features: LocalizedText[];
  historicalPeriod: LocalizedText;
  significance: LocalizedText;
}

export interface AttractionFormValue {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  latitude: number;
  longitude: number;
  openingHours: LocalizedText;
  ticketPrice: LocalizedText;
  bookingUrl: string;
  rating: number;
  reviewCount: number;
  category: LocalizedText;
  features: LocalizedText[];
  historicalPeriod: LocalizedText;
  significance: LocalizedText;
}