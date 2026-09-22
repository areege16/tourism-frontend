export interface LocalizedText {
  en: string;
  ar: string;
}

export interface AttractionFeature {
  en: string;
  ar: string;
}

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
  features: AttractionFeature[];
  historicalPeriod: LocalizedText;
  significance: LocalizedText;
}
