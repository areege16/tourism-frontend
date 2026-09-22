export interface CitizenViolationDto {
  requestID: number;
  citizenID: number;
  fullName: string | null;
  nationalID: string;
  citizenName: string;
  stopDecisionNo: string;
  stopDecisionDate: string;
  reportNo: string;
  reportDate: string;
  announcementDate: string;
  isCompleted: boolean;
  createdAt: string;
}