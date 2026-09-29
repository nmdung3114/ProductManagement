"use client";

import React, { useState } from "react";
import { Role } from "@/types";
import {
  X,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  ShieldCheck,
} from "lucide-react";

interface CreateUserModalProps {
  isOpen: boolean;
  availableRoles: Role[];
  onClose: () => void;
  onCreate: (data: {
    fullName: string;
    email: string;
    password?: string;
    roles: string[];
  }) => Promise<void>;
}

export function CreateUserModal({
  isOpen,
  availableRoles,
  onClose,
  onCreate,
}: CreateUserModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expandable Role Selector Panel state
  const [isRolesExpanded, setIsRolesExpanded] = useState(true);
  const [roleSearch, setRoleSearch] = useState("");

  if (!isOpen) return null;

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
    if (!email || !fullName) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        fullName,
        email,
        password: password || undefined,
        roles: selectedRoles,
      });
      setFullName("");
      setEmail("");
      setPassword("");
      setSelectedRoles([]);
      onClose();
    } catch (err: any) {
      alert(err.message || "Lỗi khi tạo người dùng");
    } finally {
      setIsSubmitting(false);
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
            <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Tạo Người Dùng Mới
            </h3>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: user@domain.com"
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Mật khẩu (Bỏ trống để dùng mặc định `Password123!`)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

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
                  Gán Vai Trò Ban Đầu
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

                {/* Scrollable Role List Box (Support up to 100+ Roles) */}
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-zinc-100 dark:divide-zinc-900">
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
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo người dùng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
