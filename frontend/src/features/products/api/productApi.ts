import apiService, { extractData } from "../../../services/apiService";
import { Product } from "../../../types";

export interface CreateProductRequest {
  name: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: string;
  description?: string;
  imageUrl?: string;
}

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  pageIndex?: number;
  pageSize?: number;
}

export const productApi = {
  getProducts: async (params?: ProductQueryParams): Promise<Product[]> => {
    const response = await apiService.get<any>("/products", { params });
    const data = extractData<Product[]>(response);
    return Array.isArray(data) ? data : [];
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await apiService.get<any>(`/products/${id}`);
    return extractData<Product>(response);
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await apiService.post<any>("/products", data);
    return extractData<Product>(response);
  },

  updateProduct: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await apiService.put<any>(`/products/${id}`, data);
    return extractData<Product>(response);
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiService.delete(`/products/${id}`);
  }
};
