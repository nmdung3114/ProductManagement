// ============================================================
// File: src/lib/permissions.ts
// Vai trò: Constants & helpers phân quyền cho Frontend.
// Đồng bộ với Domain/Constants/Permissions.cs & Roles.cs
// ============================================================

// ── Role Constants ───────────────────────────────────────────
export const ROLES = {
  Admin:            "Admin",
  InventoryManager: "InventoryManager",
  SalesStaff:       "SalesStaff",
  Auditor:          "Auditor",
  User:             "User",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ── Permission Constants ─────────────────────────────────────
export const PERMISSIONS = {
  Category: {
    View:   "Category.View",
    Create: "Category.Create",
    Update: "Category.Update",
    Delete: "Category.Delete",
  },
  Product: {
    View:   "Product.View",
    Create: "Product.Create",
    Update: "Product.Update",
    Delete: "Product.Delete",
  },
  Order: {
    View:         "Order.View",
    Create:       "Order.Create",
    UpdateStatus: "Order.UpdateStatus",
  },
  User: {
    View:          "User.View",
    ManageRole:    "User.ManageRole",
    ManageStatus:  "User.ManageStatus",
    ResetPassword: "User.ResetPassword",
  },
  Role: {
    View:   "Role.View",
    Create: "Role.Create",
    Update: "Role.Update",
    Delete: "Role.Delete",
  },
} as const;

// ── Ma trận Phân quyền: Role → Permissions ───────────────────
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [ROLES.Admin]: [
    PERMISSIONS.Category.View,   PERMISSIONS.Category.Create, PERMISSIONS.Category.Update, PERMISSIONS.Category.Delete,
    PERMISSIONS.Product.View,    PERMISSIONS.Product.Create,  PERMISSIONS.Product.Update,  PERMISSIONS.Product.Delete,
    PERMISSIONS.Order.View,      PERMISSIONS.Order.Create,    PERMISSIONS.Order.UpdateStatus,
    PERMISSIONS.User.View,       PERMISSIONS.User.ManageRole, PERMISSIONS.User.ManageStatus, PERMISSIONS.User.ResetPassword,
    PERMISSIONS.Role.View,       PERMISSIONS.Role.Create,     PERMISSIONS.Role.Update,     PERMISSIONS.Role.Delete,
  ],
  [ROLES.InventoryManager]: [
    PERMISSIONS.Category.View,   PERMISSIONS.Category.Create, PERMISSIONS.Category.Update, PERMISSIONS.Category.Delete,
    PERMISSIONS.Product.View,    PERMISSIONS.Product.Create,  PERMISSIONS.Product.Update,  PERMISSIONS.Product.Delete,
    PERMISSIONS.Order.View,      PERMISSIONS.Order.UpdateStatus,
  ],
  [ROLES.SalesStaff]: [
    PERMISSIONS.Category.View,
    PERMISSIONS.Product.View,
    PERMISSIONS.Order.View,      PERMISSIONS.Order.Create,    PERMISSIONS.Order.UpdateStatus,
    PERMISSIONS.User.View,
  ],
  [ROLES.Auditor]: [
    PERMISSIONS.Category.View,
    PERMISSIONS.Product.View,
    PERMISSIONS.Order.View,
    PERMISSIONS.User.View,
    PERMISSIONS.Role.View,
  ],
  [ROLES.User]: [
    PERMISSIONS.Category.View,
    PERMISSIONS.Product.View,
    PERMISSIONS.Order.Create,
  ],
};

// ── Helpers ──────────────────────────────────────────────────

/**
 * Lấy danh sách permissions của user dựa trên roles hiện tại.
 * Hợp nhất permissions từ tất cả roles (union).
 */
export function getUserPermissions(roles: string[]): Set<string> {
  const perms = new Set<string>();
  for (const role of roles) {
    const rolePerms = ROLE_PERMISSIONS[role as Role] ?? [];
    for (const p of rolePerms) perms.add(p);
  }
  return perms;
}

/**
 * Kiểm tra user có permission cụ thể không.
 */
export function hasPermission(userRoles: string[], permission: string): boolean {
  return getUserPermissions(userRoles).has(permission);
}

/**
 * Kiểm tra user có thuộc role cụ thể không.
 */
export function hasRole(userRoles: string[], role: Role): boolean {
  return userRoles.includes(role);
}

/**
 * Kiểm tra user có thuộc ít nhất một trong các role cho trước không.
 */
export function hasAnyRole(userRoles: string[], ...roles: Role[]): boolean {
  return roles.some(r => userRoles.includes(r));
}

/**
 * Kiểm tra user có phải Staff (không phải Customer/User) không.
 */
export function isStaffRole(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, ROLES.Admin, ROLES.InventoryManager, ROLES.SalesStaff, ROLES.Auditor);
}

/**
 * Lấy nhãn hiển thị của role.
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    [ROLES.Admin]:            "Quản trị viên",
    [ROLES.InventoryManager]: "Quản lý kho",
    [ROLES.SalesStaff]:       "Nhân viên bán hàng",
    [ROLES.Auditor]:          "Kiểm toán viên",
    [ROLES.User]:             "Khách hàng",
  };
  return labels[role] ?? role;
}

/**
 * Lấy màu badge cho từng role.
 */
export function getRoleBadgeClass(role: string): string {
  const classes: Record<string, string> = {
    [ROLES.Admin]:            "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
    [ROLES.InventoryManager]: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900",
    [ROLES.SalesStaff]:       "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
    [ROLES.Auditor]:          "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
    [ROLES.User]:             "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  };
  return classes[role] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
}
