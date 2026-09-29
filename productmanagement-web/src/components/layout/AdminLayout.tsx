"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <span>Đang tải hệ thống...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Wrapper */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "lg:pl-[64px]" : "lg:pl-[240px]"
        }`}
      >
        <Header onOpenMobileMenu={() => setIsMobileOpen(true)} />

        {/* Content Container (padding 24px, max-width 1280px) */}
        <main className="flex-1 p-6 max-w-[1280px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
