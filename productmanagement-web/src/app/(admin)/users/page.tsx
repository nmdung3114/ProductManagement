"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { User, Role } from "@/types";
import { apiFetch } from "@/lib/api";
import { CreateUserModal } from "@/components/users/CreateUserModal";
import { UserRolesModal } from "@/components/users/UserRolesModal";
import {
  Users,
  UserPlus,
  Shield,
  Lock,
  Unlock,
  KeyRound,
  Search,
  RefreshCw,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUserForRoles, setSelectedUserForRoles] = useState<User | null>(null);

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        apiFetch<{ success: boolean; data: User[] }>("/api/users"),
        apiFetch<{ success: boolean; data: Role[] }>("/api/roles"),
      ]);
      setUsers(usersRes.data || []);
      setAvailableRoles(rolesRes.data || []);
    } catch (err: any) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const handleCreateUser = async (data: {
    fullName: string;
    email: string;
    password?: string;
    roles: string[];
  }) => {
    await apiFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
    await fetchUsersAndRoles();
  };

  const handleUpdateRoles = async (userId: string, roles: string[]) => {
    await apiFetch(`/api/users/${userId}/roles`, {
      method: "PUT",
      body: JSON.stringify({ roles }),
    });
    await fetchUsersAndRoles();
  };

  const handleToggleStatus = async (user: User) => {
    const isCurrentlyBlocked = !!user.isBlocked;
    const confirmMsg = isCurrentlyBlocked
      ? `Mở khóa tài khoản ${user.email}?`
      : `Khóa tài khoản ${user.email}?`;

    if (!confirm(confirmMsg)) return;

    try {
      await apiFetch(`/api/users/${user.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ isBlocked: !isCurrentlyBlocked }),
      });
      await fetchUsersAndRoles();
    } catch (err: any) {
      alert(err.message || "Không thể thay đổi trạng thái tài khoản");
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!confirm(`Đặt lại mật khẩu cho ${user.email} về mật khẩu mặc định (Password123!)?`)) return;

    try {
      const res = await apiFetch<{ message: string }>(`/api/users/${user.id}/reset-password`, {
        method: "POST",
      });
      alert(res.message || "Đặt lại mật khẩu thành công!");
    } catch (err: any) {
      alert(err.message || "Không thể đặt lại mật khẩu");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Top Title & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Quản Lý Người Dùng</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Danh sách tài khoản, trạng thái & gán vai trò người dùng trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsersAndRoles}
            title="Làm mới"
            className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Người Dùng</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
          />
        </div>

        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline-block">
          Hiển thị <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{filteredUsers.length}</span> người dùng
        </span>
      </div>

      {/* Users Data Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Đang tải danh sách người dùng...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            Không tìm thấy người dùng phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold">
                <tr>
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Vai trò (Roles)</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredUsers.map((u) => {
                  const isBlocked = !!u.isBlocked;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold flex items-center justify-center shrink-0">
                            {u.fullName?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {u.fullName}
                            </div>
                            <div className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            Đã khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Hoạt động
                          </span>
                        )}
                      </td>

                      {/* Roles */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map((r) => (
                              <span
                                key={r}
                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900"
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-400 italic">Chưa gán</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Manage Roles Button */}
                          <button
                            onClick={() => setSelectedUserForRoles(u)}
                            title="Gán vai trò"
                            className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400 transition-colors"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>

                          {/* Lock / Unlock Button */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            title={isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                            className={`p-1.5 rounded border transition-colors ${
                              isBlocked
                                ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400"
                                : "border-zinc-200 text-zinc-600 hover:text-red-600 hover:border-red-300 dark:border-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {isBlocked ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => handleResetPassword(u)}
                            title="Đặt lại mật khẩu"
                            className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 hover:border-amber-300 dark:hover:text-amber-400 transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        availableRoles={availableRoles}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateUser}
      />

      <UserRolesModal
        user={selectedUserForRoles}
        availableRoles={availableRoles}
        isOpen={!!selectedUserForRoles}
        onClose={() => setSelectedUserForRoles(null)}
        onSave={handleUpdateRoles}
      />
    </AdminLayout>
  );
}
