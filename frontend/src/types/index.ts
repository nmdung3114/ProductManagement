// Common Domain Types & DTOs

export interface User {
  id: string;
  email: string;
  fullName: string;
  isBlocked?: boolean;
  roles: string[];
  permissions?: string[];
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  expiresAt?: string;
  message?: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions?: string[];
  };
}

export interface Permission {
  id: string;
  name: string;
  group?: string;
  description?: string;
}

export interface PermissionGroup {
  groupName: string;
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  permissions: Permission[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName?: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  totalPrice?: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  shippingAddress: string;
  paymentMethod: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

export interface CreateOrderRequest {
  shippingAddress: string;
  paymentMethod: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
