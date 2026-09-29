export interface LocalizedText {
  en?: string;
  ar?: string;
}

export interface ServiceItem {
  id?: string;
  name?: string;
  nameAr?: string;
  type?: string;
  typeAr?: string;
  description?: string;
  descriptionAr?: string;
  address?: string;
  addressAr?: string;
  phone?: string;
  email?: string;
  image?: string;
  existingImage?: string;
  imageFile?: File | null;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  rating?: number;
  is24h?: boolean;
  isEmergency?: boolean;
  isFeatured?: boolean;
  features?: string[];
  featuresAr?: string[];
  specialty?: string;
  specialtyAr?: string;
  openingHours?: any;
  acceptsInsurance?: boolean;
  hasDelivery?: boolean;
  commentsCount?: number;
}
