import apiService, { extractData } from "../../../services/apiService";
import { Category } from "../../../types";

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
}

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiService.get<any>("/categories");
    const data = extractData<Category[]>(response);
    return Array.isArray(data) ? data : [];
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiService.get<any>(`/categories/${id}`);
    return extractData<Category>(response);
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiService.post<any>("/categories", data);
    return extractData<Category>(response);
  },

  updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiService.put<any>(`/categories/${id}`, data);
    return extractData<Category>(response);
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiService.delete(`/categories/${id}`);
  }
};
