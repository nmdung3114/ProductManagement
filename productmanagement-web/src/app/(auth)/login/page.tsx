
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Boxes,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm space-y-6">

        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white shadow-sm mb-2">
            <Boxes className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Đăng nhập Admin Panel
          </h1>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Hệ thống Quản lý Sản phẩm & Phân quyền RBAC
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-6 space-y-4">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Địa chỉ Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Mật khẩu
                </label>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />

                {/* Show / Hide Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  aria-label={
                    showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-colors disabled:opacity-50"
            >
              <span>
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập ngay"}
              </span>

              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

