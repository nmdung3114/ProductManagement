import apiService, { extractData } from "../../../services/apiService";
import { AuthResponse, User } from "../../../types";

export interface LoginRequest {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password?: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiService.post<any>("/auth/login", data);
    return extractData<AuthResponse>(response);
  },

  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await apiService.post<any>("/auth/register", data);
    return extractData<{ message: string }>(response);
  },

  getProfile: async (): Promise<User> => {
    const response = await apiService.get<any>("/auth/me");
    return extractData<User>(response);
  },

  getUserPermissions: async (): Promise<string[]> => {
    const response = await apiService.get<any>("/permissions/my-permissions");
    const data = extractData<string[]>(response);
    return Array.isArray(data) ? data : [];
  }
};