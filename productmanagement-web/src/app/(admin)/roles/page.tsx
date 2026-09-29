"use client";

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Role, PermissionGroup } from "@/types";
import { apiFetch } from "@/lib/api";
import { CreateRoleModal } from "@/components/roles/CreateRoleModal";
import { RolePermissionsModal } from "@/components/roles/RolePermissionsModal";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null);

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        apiFetch<{ success: boolean; data: Role[] }>("/api/roles"),
        apiFetch<{ success: boolean; data: PermissionGroup[] }>("/api/permissions"),
      ]);
      setRoles(rolesRes.data || []);
      setPermissionGroups(permsRes.data || []);
    } catch (err: any) {
      console.error("Failed to load roles and permissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const handleCreateRole = async (name: string, description: string) => {
    await apiFetch("/api/roles", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
    await fetchRolesAndPermissions();
  };

  const handleUpdateRolePermissions = async (
    roleId: string,
    permissionIds: string[]
  ) => {
    await apiFetch(`/api/roles/${roleId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissionIds }),
    });
    await fetchRolesAndPermissions();
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.isSystemRole) {
      alert("Không thể xóa System Role mặc định của hệ thống.");
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}" không?`)) return;

    try {
      await apiFetch(`/api/roles/${role.id}`, {
        method: "DELETE",
      });
      await fetchRolesAndPermissions();
    } catch (err: any) {
      alert(err.message || "Xóa vai trò thất bại");
    }
  };

  return (
    <AdminLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Quản Lý Vai Trò & Phân Quyền</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Thiết lập danh sách Vai trò (Roles) & Phân quyền hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRolesAndPermissions}
            title="Làm mới"
            className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Vai Trò Mới</span>
          </button>
        </div>
      </div>

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs text-zinc-500">
            Đang tải dữ liệu vai trò...
          </div>
        ) : roles.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-zinc-500">
            Chưa có vai trò nào trong hệ thống.
          </div>
        ) : (
          roles.map((role) => {
            const permissionsCount = role.permissions ? role.permissions.length : 0;

            return (
              <div
                key={role.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {role.name}
                      </span>
                      {role.isSystemRole && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900">
                          <Lock className="w-2.5 h-2.5" />
                          System Role
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {role.description || "Chưa có mô tả cho vai trò này."}
                  </p>

                  <div className="pt-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Được gán {permissionsCount} quyền</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedRoleForPermissions(role)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 transition-colors"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Phân quyền</span>
                  </button>

                  {!role.isSystemRole ? (
                    <button
                      onClick={() => handleDeleteRole(role)}
                      title="Xóa vai trò"
                      className="p-1.5 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[11px] text-zinc-400 italic">Mặc định</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateRole}
      />

      <RolePermissionsModal
        role={selectedRoleForPermissions}
        groups={permissionGroups}
        isOpen={!!selectedRoleForPermissions}
        onClose={() => setSelectedRoleForPermissions(null)}
        onSave={handleUpdateRolePermissions}
      />
    </AdminLayout>
  );
}
