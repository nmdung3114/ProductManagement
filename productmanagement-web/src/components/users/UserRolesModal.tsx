"use client";

import React, { useState, useEffect } from "react";
import { User, Role } from "@/types";
import {
  X,
  ShieldCheck,
  Save,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
} from "lucide-react";

interface UserRolesModalProps {
  user: User | null;
  availableRoles: Role[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, roles: string[]) => Promise<void>;
}

export function UserRolesModal({
  user,
  availableRoles,
  isOpen,
  onClose,
  onSave,
}: UserRolesModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Expandable panel state
  const [isRolesExpanded, setIsRolesExpanded] = useState(true);
  const [roleSearch, setRoleSearch] = useState("");

  useEffect(() => {
    if (user && user.roles) {
      setSelectedRoles(user.roles);
    } else {
      setSelectedRoles([]);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleToggleRole = (roleName: string) => {
    if (selectedRoles.includes(roleName)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== roleName));
    } else {
      setSelectedRoles([...selectedRoles, roleName]);
    }
  };

  const handleSelectAll = () => {
    setSelectedRoles(availableRoles.map((r) => r.name));
  };

  const handleDeselectAll = () => {
    setSelectedRoles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(user.id, selectedRoles);
      onClose();
    } catch (err: any) {
      alert(err.message || "Lỗi khi cập nhật vai trò người dùng");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRoles = availableRoles.filter(
    (r) =>
      r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
      (r.description &&
        r.description.toLowerCase().includes(roleSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Gán Vai Trò Người Dùng
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {user.fullName} ({user.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Expandable Role Selector Panel */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/30">
            {/* Header Trigger Bar */}
            <div
              onClick={() => setIsRolesExpanded((prev) => !prev)}
              className="px-4 py-3 flex items-center justify-between cursor-pointer bg-zinc-100/70 dark:bg-zinc-900/80 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Danh Sách Vai Trò Áp Dụng
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Đã chọn {selectedRoles.length} vai trò
                </span>
              </div>
              <button type="button" className="text-zinc-400 hover:text-zinc-600">
                {isRolesExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Selected Roles Tags Summary */}
            {selectedRoles.length > 0 && (
              <div className="px-4 py-2 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-1.5">
                {selectedRoles.map((roleName) => (
                  <span
                    key={roleName}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                  >
                    {roleName}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRole(roleName);
                      }}
                      className="hover:text-blue-900 dark:hover:text-white cursor-pointer font-bold ml-0.5"
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
            )}

            {/* Expanded Role Selection Box */}
            {isRolesExpanded && (
              <div className="p-3 space-y-3 bg-white dark:bg-zinc-950">
                {/* Search Bar & Quick Action Shortcuts */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-400" />
                    <input
                      type="text"
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      placeholder="Tìm kiếm vai trò theo tên..."
                      className="w-full pl-8 pr-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="flex items-center gap-3 text-[11px] shrink-0">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Chọn tất cả ({availableRoles.length})
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-zinc-500 hover:underline"
                    >
                      Bỏ chọn tất cả
                    </button>
                  </div>
                </div>

                {/* Scrollable Role List Box */}
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 divide-y divide-zinc-100 dark:divide-zinc-900">
                  {filteredRoles.length === 0 ? (
                    <div className="text-center text-xs text-zinc-400 py-6">
                      Không tìm thấy vai trò nào phù hợp
                    </div>
                  ) : (
                    filteredRoles.map((role) => {
                      const isSelected = selectedRoles.includes(role.name);
                      return (
                        <div
                          key={role.id}
                          onClick={() => handleToggleRole(role.name)}
                          className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer text-xs transition-colors pt-2 ${
                            isSelected
                              ? "bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "border-zinc-300 dark:border-zinc-700"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <span className="block font-medium truncate">
                                {role.name}
                              </span>
                              {role.description && (
                                <span className="block text-[11px] text-zinc-400 truncate">
                                  {role.description}
                                </span>
                              )}
                            </div>
                          </div>

                          {role.isSystemRole && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0">
                              System Role
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Đang lưu..." : "Cập nhật vai trò"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
