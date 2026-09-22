export interface RequestDateFilterDto {
  fromDate: string | Date;
  toDate: string | Date;
  governorateID?: number | null;
  regionID?: number | null;
  areaID?: number | null;
}

export interface RequestReportDetailsDto {
  governorateID: number;
  governorateName: string;
  regionID: number;
  regionName: string;
  areaID: number;
  areaName: string;
  propertyAddress: string;
  violationDetails: string;
}

export interface RequestReportDto {
  requestID: number;
  citizenID: number;
  nationalID: string;
  citizenName: string;
  stopDecisionNo: string;
  stopDecisionDate: string;
  reportNo: string;
  reportDate: string;
  announcementDate: string | null;
  isCompleted: boolean;
  details: RequestReportDetailsDto | null;
  createdAt: string;
}

export interface RequestAttachmentReportDto {
  attachmentID: number;
  requestID: number;
  attachmentTypeID: number;
  attachmentTypeName: string;
  fileName: string;
  originalFileName: string;
  fileExtension: string;
  fileSize: number;
  contentType: string;
  fileUrl?: string;
  filePath: string;
  createdAt: string;
  stopDecisionNo: string;
  stopDecisionDate: string;
  nationalID: string;
  citizenName: string;
}