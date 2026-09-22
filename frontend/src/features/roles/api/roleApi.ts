import apiService, { extractData } from "../../../services/apiService";
import { PermissionGroup, Role } from "../../../types";

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions?: string[];
}

export const roleApi = {
  getRoles: async (): Promise<Role[]> => {
    const response = await apiService.get<any>("/roles");
    const data = extractData<Role[]>(response);
    return Array.isArray(data) ? data : [];
  },

  getPermissions: async (): Promise<PermissionGroup[]> => {
    const response = await apiService.get<any>("/permissions");
    const data = extractData<PermissionGroup[]>(response);
    return Array.isArray(data) ? data : [];
  },

  createRole: async (data: CreateRoleRequest): Promise<Role> => {
    const response = await apiService.post<any>("/roles", data);
    return extractData<Role>(response);
  },

  updateRolePermissions: async (id: string, permissionIds: string[]): Promise<Role> => {
    const response = await apiService.put<any>(`/roles/${id}/permissions`, { permissionIds });
    return extractData<Role>(response);
  },

  deleteRole: async (id: string): Promise<void> => {
    await apiService.delete(`/roles/${id}`);
  }
};
