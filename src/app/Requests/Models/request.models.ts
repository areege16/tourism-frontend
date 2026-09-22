export interface RequestSearchDto {
  searchText?: string | null;
  nationalID?: string | null;
  governorateID?: number | null;
  regionID?: number | null;
  areaID?: number | null;
  isCompleted?: boolean | null;
  fromDate?: string | Date | null;
  toDate?: string | Date | null;
  page?: number;
  pageSize?: number;
}

export interface RequestItemDto {
  requestID: number;
  citizenID: number;
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

export interface PagedRequestResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}





