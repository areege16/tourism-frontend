export interface DashboardSummaryDto {
  totalRequests: number;
  completedRequests: number;
  incompleteRequests: number;
  completionPercentage: number;
  incompletePercentage: number;
}

export interface DashboardDateStatDto {
  date: string;
  totalRequests: number;
  completedRequests: number;
  incompleteRequests: number;
}

export interface DashboardLocationStatDto {
  id: number;
  name: string;
  totalRequests: number;
  completedRequests: number;
  incompleteRequests: number;
  completionPercentage: number;
}

export interface DashboardUserStatDto {
  userID: number;
  userName: string;
  fullName: string;
  totalRequests: number;
  completedRequests: number;
  incompleteRequests: number;
  completionPercentage: number;
}

export interface DashboardResponseDto {
  summary: DashboardSummaryDto;
  byDate: DashboardDateStatDto[];
  byGovernorate: DashboardLocationStatDto[];
  byRegion: DashboardLocationStatDto[];
  byArea: DashboardLocationStatDto[];
  byUser: DashboardUserStatDto[];
}

export interface DashboardFilterDto {
  fromDate?: string;
  toDate?: string;
  governorateID?: number;
  regionID?: number;
  areaID?: number;
}