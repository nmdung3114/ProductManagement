export interface User {
  id: string;
  email: string;
  fullName: string;
  isBlocked?: boolean;
  roles?: string[];
}

export interface Permission {
  id: string;
  name: string;
  group: string;
  description: string;
}

export interface PermissionGroup {
  groupName: string;
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissions: Permission[];
}

export interface AuthResponse {
  message: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ── Product DTOs – matching Backend ─────────────────────────

/** DTO sản phẩm đầy đủ – nhận được khi là Admin hoặc InventoryManager */
export interface ProductInventoryDto {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;           // Số lượng tồn chính xác
  isActive: boolean;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string | null;
}

/** DTO sản phẩm công khai – nhận được khi là SalesStaff, Auditor, Customer */
export interface ProductPublicDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryName: string;
  inStock: boolean;        // Chỉ boolean – không lộ số lượng
}

/** Union type – response từ GET /api/products có thể là 1 trong 2 loại */
export type ProductDto = ProductInventoryDto | ProductPublicDto;

/** Helper kiểm tra DTO có phải loại Admin/Inventory không */
export function isProductInventoryDto(dto: ProductDto): dto is ProductInventoryDto {
  return "sku" in dto && "stock" in dto;
}

// ── Order DTOs – matching Backend ────────────────────────────

/** DTO đơn hàng đầy đủ – chỉ Admin nhận được */
export interface OrderAdminDto {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  orderCode: string;
  totalAmount: number;
  status: string;
  itemCount: number;
  createdAt: string;
}

/** DTO đơn hàng cho Staff (SalesStaff, Auditor, InventoryManager) */
export interface OrderStaffDto {
  id: string;
  customerName: string;
  orderCode: string;
  totalAmount: number;
  status: string;
  itemCount: number;
  createdAt: string;
}

export type OrderListDto = OrderAdminDto | OrderStaffDto;

export function isOrderAdminDto(dto: OrderListDto): dto is OrderAdminDto {
  return "userId" in dto && "userEmail" in dto;
}

// ── Pagination ───────────────────────────────────────────────

export interface PaginationData {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

