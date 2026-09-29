import { LocalizedText } from '../../Shared/Models/localizedText';

export interface TourismInfo {
  id?: string;
  title: LocalizedText;
  climate: LocalizedText;
  bestTimeToVisit: LocalizedText;
  whatToWear: LocalizedText;
  notes: LocalizedText;
  lastUpdated?: string;
}
