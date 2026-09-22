export interface RequestAttachmentDto {
  attachmentID: number;
  requestID: number;
  attachmentTypeID: number;        // 5: إيقاف أعمال | 6: محضر مخالفة | 7: قرار إزالة
  attachmentTypeName: string;
  fileName: string;
  originalFileName: string;
  fileExtension: string;
  fileSize: number;
  contentType: string;
  fileUrl: string;                 // e.g. /api/RequestAttachment/file/33
  filePath: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedBy?: number | null;
  updatedAt?: string | null;
}

export interface RequestDetailsDto {
  governorateID: number;
  governorateName: string;
  regionID: number;
  regionName: string;
  areaID: number;
  areaName: string;
  propertyAddress: string;
  violationDetails: string;
}

export interface RequestDetailsItemDto {
  requestID: number;
  citizenID: number;
  nationalID: string;
  citizenName: string;
  stopDecisionNo: string;
  stopDecisionDate: string;
  reportNo: string;
  reportDate: string;
  announcementDate?: string | null;
  isCompleted: boolean;
  details: RequestDetailsDto;
  attachments: RequestAttachmentDto[];
  createdBy: number;
  createdAt: string;
  updatedBy?: number | null;
  updatedAt?: string | null;
}