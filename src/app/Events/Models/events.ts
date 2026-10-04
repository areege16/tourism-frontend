import { LocalizedText } from "../../Shared/Models/localizedText";

export interface EventContactInfoDto {
  phone?: string;
  email?: string;
  website?: string;
}

export interface TourismEventDto {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  imageUrl: string;
  startDate: string;
  endDate: string;
  location: LocalizedText;
  latitude?: number;
  longitude?: number;
  ticketPrice?: LocalizedText;
  isFree: boolean;
  category: LocalizedText;
  organizer?: LocalizedText;
  contactInfo?: EventContactInfoDto;
}

export interface CreateTourismEventDto {
  name: LocalizedText;
  description: LocalizedText;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  location: LocalizedText;
  latitude?: number;
  longitude?: number;
  ticketPrice?: LocalizedText;
  isFree: boolean;
  category: LocalizedText;
  organizer?: LocalizedText;
  contactInfo?: EventContactInfoDto;
}


export interface DeleteDialogData {
  id: string | number;
  title: string;
}