"use client";

import React, { useState, useEffect } from "react";
import { Role, PermissionGroup } from "@/types";
import { PermissionAccordion } from "./PermissionAccordion";
import { X, Save, Shield } from "lucide-react";

interface RolePermissionsModalProps {
  role: Role | null;
  groups: PermissionGroup[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleId: string, permissionIds: string[]) => Promise<void>;
}

export function RolePermissionsModal({
  role,
  groups,
  isOpen,
  onClose,
  onSave,
}: RolePermissionsModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (role && role.permissions) {
      setSelectedIds(role.permissions.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  }, [role]);

  if (!isOpen || !role) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(role.id, selectedIds);
      onClose();
    } catch (err: any) {
      alert(err.message || "Lỗi khi lưu phân quyền");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Phân quyền cho vai trò: <span className="text-blue-600 dark:text-blue-400">{role.name}</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {role.description || "Chọn danh sách các quyền được phép truy cập hệ thống"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Accordion List */}
        <div className="flex-1 p-6 overflow-y-auto">
          <PermissionAccordion
            groups={groups}
            selectedPermissionIds={selectedIds}
            onChange={setSelectedIds}
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
