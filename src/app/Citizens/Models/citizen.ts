export interface CitizenSearchDto {
  fullName?: string;
  nationalID?: string;
  governorateName?: string;
  regionName?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
}

export interface CitizenResponseDto {
  citizenID: number;
  fullName: string;
  nationalID: string;
  regionName: string;
  governorateName: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}


export interface CitizenResponseDto {
  citizenID: number;
  fullName: string;
  nationalID: string;
  addressDetails: string;
  areaID: number | null;
  areaName?: string | null;
  regionID?: number | null;
  regionName: string;
  governorateName: string;
  requestsCount: number;
  isActive?: boolean;
}


export interface UpdateCitizenDto {
  areaID?: number | null;
  regionID: number;
  addressDetails: string;
}



export interface CreateCitizenDto {
  nationalID: string;
  fullName: string;
  addressDetails: string;
  regionID: number;
  areaID?: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface CitizenDto {
  citizenID: number;
  nationalID: string;
  fullName: string;
  addressDetails: string;
  isActive: boolean;
  createdAt: string;
}