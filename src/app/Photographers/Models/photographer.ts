import { LocalizedText } from '../../Shared/Models/localizedText';
export interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: LocalizedText;
}

export interface PhotographerFormValue {
  id: string;
  name: LocalizedText;
  bio: LocalizedText;
  specialties: string[];
  imageUrl: string;
  phone: LocalizedText;
  email: LocalizedText;
  social: SocialLinks;
  location: Location;
  rating: number;
}

export interface PhotographerCreateFormValue {
  name:LocalizedText;
  bio:LocalizedText;
  specialties: string[];
  phone: LocalizedText;
  email: LocalizedText;
  social: SocialLinks;
  location: Location;
  rating: number;
}

export interface Photographer {
  id: string;
  name: LocalizedText;
  bio: LocalizedText;
  specialties: string[];
  imageUrl: string;
  phone: LocalizedText;
  email: LocalizedText;
  social: SocialLinks;
  location: Location;
  rating: number;
}
