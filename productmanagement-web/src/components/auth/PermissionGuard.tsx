"use client";

// ============================================================
// File: src/components/auth/PermissionGuard.tsx
// Vai trò: Component bảo vệ UI theo Permission hoặc Role.
// Chỉ render children khi user có đủ quyền.
// ============================================================

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { hasPermission, hasAnyRole, Role } from "@/lib/permissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  /** Kiểm tra theo permission string (ví dụ: "Product.Create") */
  permission?: string;
  /** Kiểm tra theo roles – user phải có ít nhất 1 role trong danh sách */
  roles?: Role[];
  /** Fallback hiển thị nếu không có quyền (mặc định: null) */
  fallback?: React.ReactNode;
}

/**
 * Bao quanh bất kỳ UI element nào cần kiểm soát hiển thị theo quyền.
 *
 * @example
 * // Ẩn nút thêm sản phẩm nếu không có quyền Product.Create
 * <PermissionGuard permission="Product.Create">
 *   <button>Thêm sản phẩm</button>
 * </PermissionGuard>
 *
 * @example
 * // Chỉ hiển thị với Admin và InventoryManager
 * <PermissionGuard roles={["Admin", "InventoryManager"]}>
 *   <StockColumn />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  roles,
  fallback = null,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const userRoles = user?.roles ?? [];

  // Kiểm tra theo permission
  if (permission && !hasPermission(userRoles, permission)) {
    return <>{fallback}</>;
  }

  // Kiểm tra theo roles
  if (roles && roles.length > 0 && !hasAnyRole(userRoles, ...roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
