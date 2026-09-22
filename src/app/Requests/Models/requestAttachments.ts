export interface RequestAttachmentResponseDto {
  attachmentID: number;
  requestID: number;
  attachmentTypeID: number;
  attachmentTypeName: string;
  fileName: string;
  originalFileName: string;
  fileExtension: string;
  fileSize: number;
  contentType: string;
  filePath: string;
  fileUrl: string;
  createdBy: number;
  createdAt: string;
  updatedBy?: number | null;
  updatedAt?: string | null;
  isActive: boolean;
}