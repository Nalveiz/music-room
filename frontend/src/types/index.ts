export interface IBaseModel {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface IApiPaginatedResponse<T> {
  data: T[];
  message: string;
  success: boolean;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IApiValidationError {
  field: string;
  message: string;
}

export interface IAuthTokens {
  accessToken: string;
  // refreshToken: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export type Visibility = 'public' | 'friends' | 'private';

export interface IUserProfile {
  id?: number;
  name: string;
  surname: string;
  username: string;
  email?: string;
  profile_photo?: string | null;
  birth_date?: string | null;
  auth_provider?: string | null;
  created_date?: string | null;
}

export type AppThemeMode = 'light' | 'dark' | 'system';

export interface IAuthUser {
  id: number;
  name: string;
  surname: string;
  username: string;
  email: string;
  profile_photo?: string | null;
}

export interface IProfileVisibility {
  name_visibility: Visibility;
  surname_visibility: Visibility;
  username_visibility: Visibility;
  created_date_visibility: Visibility;
  profile_photo_visibility: Visibility;
  birth_date_visibility: Visibility;
  email_visibility: Visibility;
}