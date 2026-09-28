export interface LocalizedText {
  en?: string;
  ar?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
}

export interface Address {
  en?: string;
  ar?: string;
}

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  address?: Address;
}

export interface TourGuide {
  id?: string;
  name?: LocalizedText;
  fullName?: LocalizedText;
  bio?: LocalizedText;
  expertise?: LocalizedText;
  phone?: LocalizedText | string;
  email?: LocalizedText | string;
  imageUrl?: string;
  languages?: string[];
  experienceYears?: number;
  rating?: number;
  isFeatured?: boolean;
  status?: string;
  social?: SocialLinks;
  location?: LocationInfo;
}
