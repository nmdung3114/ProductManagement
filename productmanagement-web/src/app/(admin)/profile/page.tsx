"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  User,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Save,
  Calendar,
  Lock,
  Tag,
} from "lucide-react";

interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  roles: string[];
  permissions: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; data: ProfileData }>(
        "/api/profile/me"
      );
      if (res.data) {
        setProfile(res.data);
        setFullName(res.data.fullName || "");
      }
    } catch (err: any) {
      showToast("error", err.message || "Không thể tải thông tin cá nhân.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("error", "Họ và tên không được để trống.");
      return;
    }

    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      showToast(
        "error",
        "Vui lòng nhập cả mật khẩu hiện tại và mật khẩu mới nếu muốn đổi mật khẩu."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch("/api/profile/me", {
        method: "PUT",
        body: JSON.stringify({
          fullName: fullName.trim(),
          currentPassword: currentPassword || null,
          newPassword: newPassword || null,
        }),
      });

      showToast("success", "Cập nhật thông tin cá nhân thành công!");
      setCurrentPassword("");
      setNewPassword("");
      loadProfile();
    } catch (err: any) {
      showToast("error", err.message || "Cập nhật thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-xs font-medium transition-all ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Trang Cá Nhân
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Quản lý thông tin tài khoản cá nhân, mật khẩu và danh sách quyền hạn được cấp
          </p>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center text-xs text-zinc-400">
            Đang tải thông tin cá nhân...
          </div>
        ) : profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Profile Card */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 text-center space-y-3 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md">
                  {profile.fullName?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {profile.fullName}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                    {profile.email}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Tham gia:{" "}
                    {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Roles Badge Card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-2.5 shadow-sm">
                <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Vai trò của bạn:
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.roles.map((r) => (
                    <span
                      key={r}
                      className="px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Edit Form & Permissions */}
            <div className="md:col-span-2 space-y-6">
              {/* Form Update Profile */}
              <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4 shadow-sm"
              >
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  Cập nhật thông tin tài khoản
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    Đổi mật khẩu (Bỏ trống nếu giữ nguyên mật khẩu cũ)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}</span>
                  </button>
                </div>
              </form>

              {/* Permissions List */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-3 shadow-sm">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center justify-between">
                  <span>Danh sách Quyền hạn của bạn</span>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400">
                    {profile.permissions.length} quyền
                  </span>
                </h3>

                {profile.permissions.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">
                    Chưa được gán quyền hạn cụ thể nào.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profile.permissions.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono font-medium bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
                      >
                        <Tag className="w-3 h-3 text-blue-500 shrink-0" />
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
