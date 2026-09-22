export interface GovernorateDto {
  governorateID: number;
  governorateCode: string;
  governorateName: string;
  isActive: boolean;
  createdAt: string;
}

export interface RegionDto {
  regionID: number;
  governorateID: number;
  regionName: string;
}

export interface AreaDto {
  areaID: number;
  regionID: number;
  areaName: string;
}


export interface CreateAreaDto {
  regionID: number;
  areaName: string;
}