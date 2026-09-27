import { LocalizedText } from "../../Shared/Models/localizedText";

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

// ===== Form value shapes (للفرونت بس) =====

export interface PhotographerFormValue {
  id: string;
  name: { en: string; ar: string };
  bio: { en: string; ar: string };
  specialties: string[];
  imageUrl: string;
  phone: { en: string; ar: string };
  email: { en: string; ar: string };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    youtube: string;
  };
  location: Location 
  rating: number;
}

export interface PhotographerCreateFormValue {
  name: { en: string; ar: string };
  bio: { en: string; ar: string };
  specialties: string[];
  phone: { en: string; ar: string };
  email: { en: string; ar: string };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    youtube: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address: { en: string; ar: string };
  };
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
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    youtube: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address: LocalizedText;
  };
  rating: number;
}