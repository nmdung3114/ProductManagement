"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Menu, Search, Bell, Activity, User, LogOut } from "lucide-react";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

const pathNamesMap: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/products": "Quản lý sản phẩm",
  "/categories": "Quản lý danh mục",
  "/orders": "Quản lý đơn hàng",
  "/users": "Quản lý người dùng",
  "/roles": "Vai trò & Phân quyền",
  "/profile": "Trang cá nhân & Quyền hạn",
  "/audit-logs": "Nhật ký hệ thống",
};

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const currentPageTitle = pathNamesMap[pathname] || "Hệ thống";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-[56px] px-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span>Admin Panel</span>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
            {currentPageTitle}
          </span>
        </div>
      </div>

      {/* Right: Profile Nav & Logout */}
      <div className="flex items-center gap-3">
        {/* Profile Link */}
        <Link
          href="/profile"
          className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800 group hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
            {user?.fullName?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 transition-colors">
              {user?.fullName || "Admin User"}
            </div>
          </div>
        </Link>

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Đăng xuất"
          className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
