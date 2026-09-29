"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <span>Đang chuyển hướng...</span>
      </div>
    </div>
  );
}
