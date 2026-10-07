import { LocalizedText } from "../../Shared/Models/localizedText";

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
}

export interface TourGuideDto {
  id: string;
  name: LocalizedText;
  bio?: LocalizedText;
  languages?: string[];
  imageUrl?: string;
  phone?: string;
  email?: string;
  social?: SocialLinks;
  rating?: number;
}

export interface CreateTourGuideCommand {
  name: LocalizedText;
  bio?: LocalizedText;
  languages?: string[];
  imageFile?: File;
  phone?: string;
  email?: string;
  social?: SocialLinks;
  rating?: number;
}

export interface UpdateTourGuideCommand extends Partial<CreateTourGuideCommand> {
  id?: string;
}