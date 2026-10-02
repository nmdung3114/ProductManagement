"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/permissions";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  ShieldCheck,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from "lucide-react";

// ── Định nghĩa các nav item với permission roles ─────────────
const ALL_NAV_ITEMS = [
  {
    href:          "/dashboard",
    label:         "Tổng quan",
    icon:          LayoutDashboard,
    allowedRoles:  null, // null = tất cả staff roles đều thấy
  },
  {
    href:          "/products",
    label:         "Sản phẩm",
    icon:          Package,
    allowedRoles:  null, // Tất cả staff (nội dung được filter bởi backend)
  },
  {
    href:          "/categories",
    label:         "Danh mục",
    icon:          Tags,
    allowedRoles:  [ROLES.Admin, ROLES.InventoryManager],
  },
  {
    href:          "/orders",
    label:         "Đơn hàng",
    icon:          ShoppingCart,
    allowedRoles:  [ROLES.Admin, ROLES.SalesStaff, ROLES.InventoryManager, ROLES.Auditor],
  },
  {
    href:          "/users",
    label:         "Người dùng",
    icon:          Users,
    allowedRoles:  [ROLES.Admin, ROLES.SalesStaff, ROLES.Auditor],
  },
  {
    href:          "/roles",
    label:         "Vai trò & Quyền",
    icon:          ShieldCheck,
    allowedRoles:  [ROLES.Admin, ROLES.Auditor],
  },
  {
    href:          "/audit-logs",
    label:         "Nhật ký hệ thống",
    icon:          FileText,
    allowedRoles:  [ROLES.Admin, ROLES.Auditor],
  },
] as const;

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, userRoles, hasAnyRole } = useAuth();

  // Lọc nav items theo role của user hiện tại
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.allowedRoles === null) return true; // Mọi staff đều thấy
    return item.allowedRoles.some((role) => userRoles.includes(role));
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${
          isCollapsed ? "w-[64px]" : "w-[240px]"
        } ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header Logo */}
        <div className="flex items-center justify-between h-[56px] px-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white shrink-0 font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                ProductManager
              </span>
            )}
          </Link>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        

        {/* Collapsed: chỉ hiện Logout icon */}
        {isCollapsed && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 p-2">
            <button
              onClick={logout}
              title="Đăng xuất"
              className="w-full flex items-center justify-center p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

// ── Local helpers (tránh circular import) ────────────────────
function getRoleLabelLocal(role: string): string {
  const map: Record<string, string> = {
    Admin:            "Quản trị viên",
    InventoryManager: "Quản lý kho",
    SalesStaff:       "Nhân viên KD",
    Auditor:          "Kiểm toán",
    User:             "Khách hàng",
  };
  return map[role] ?? role;
}

function getRoleBadgeClassLocal(role: string): string {
  const map: Record<string, string> = {
    Admin:            "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
    InventoryManager: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-900",
    SalesStaff:       "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
    Auditor:          "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
    User:             "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  };
  return map[role] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
}
