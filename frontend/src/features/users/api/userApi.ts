import apiService, { extractData } from "../../../services/apiService";
import { User } from "../../../types";

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password?: string;
  roles?: string[];
}

export interface UpdateUserRolesRequest {
  roles: string[];
}

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiService.get<any>("/users");
    const data = extractData<User[]>(response);
    return Array.isArray(data) ? data : [];
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiService.get<any>(`/users/${id}`);
    return extractData<User>(response);
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiService.post<any>("/users", data);
    return extractData<User>(response);
  },

  updateUserRoles: async (id: string, roles: string[]): Promise<void> => {
    await apiService.put(`/users/${id}/roles`, { roles });
  },

  toggleUserStatus: async (id: string, isBlocked: boolean): Promise<void> => {
    await apiService.put(`/users/${id}/status`, { isBlocked });
  },

  resetUserPassword: async (id: string): Promise<{ newPassword?: string; message: string }> => {
    const response = await apiService.post<any>(`/users/${id}/reset-password`);
    return extractData<{ newPassword?: string; message: string }>(response);
  }
};
