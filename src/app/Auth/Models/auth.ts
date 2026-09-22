export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  expiration: string;
  fullName: string;
  userName: string;
  roles: string[];
}

export interface BaseResponse {
  success: boolean;
  message: string;
}


export interface RegisterRequest {
  fullName: string;
  userName: string;
  password: string;
  roleID: number;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userID: number;
  errors?: string[];
}