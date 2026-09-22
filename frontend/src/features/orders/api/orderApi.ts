import apiService, { extractData } from "../../../services/apiService";
import { CreateOrderRequest, Order, OrderStatus } from "../../../types";

export const orderApi = {
  getOrders: async (): Promise<Order[]> => {
    const response = await apiService.get<any>("/orders");
    const data = extractData<Order[]>(response);
    return Array.isArray(data) ? data : [];
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await apiService.get<any>("/orders/my-orders");
    const data = extractData<Order[]>(response);
    return Array.isArray(data) ? data : [];
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiService.get<any>(`/orders/${id}`);
    return extractData<Order>(response);
  },

  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await apiService.post<any>("/orders", data);
    return extractData<Order>(response);
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await apiService.put<any>(`/orders/${id}/status`, { status });
    return extractData<Order>(response);
  }
};
