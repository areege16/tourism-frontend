export interface OcrResponseDto {
  registration_number?: string | null;
  property_street?: string | null;
  property_city_village?: string | null;
  property_district?: string | null;
  property_zone?: string | null;
  owner_name?: string | null;
  owner_national_id?: string | null;
  owner_street?: string | null;
  owner_district?: string | null;
  suspension_decision_number?: string | null;
  suspension_decision_date?: string | null;
  announcement_date?: string | null;
  violation_report_number?: string | null;
  violation_report_date?: string | null;
  violating_works?: string | null;
}

export interface CreateCitizenDto {
  nationalID: string;
  fullName: string;
  addressDetails: string;
  regionID: number;
}

export interface CreateRequestFormHeaderDto {
  stopDecisionNo: string;
  stopDecisionDate: string;
  reportNo: string;
  reportDate: string;
  announcementDate?: string | null;
}

export interface RequestDetailsDto {
  governorateID: number;
  regionID: number;
  areaID: number;
  propertyAddress: string;
  violationDetails: string;
}

export interface RequestFormPayload {
  citizen: CreateCitizenDto;
  header: CreateRequestFormHeaderDto;
  details: RequestDetailsDto;
  attachment5?: File | null; // قرار الإيقاف
  attachment6?: File | null; // محضر المعاينة
  attachment7?: File | null; // قرار الإزالة
}