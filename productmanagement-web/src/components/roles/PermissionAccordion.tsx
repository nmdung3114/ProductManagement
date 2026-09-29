"use client";

import React, { useState, useEffect, useRef } from "react";
import { PermissionGroup, Permission } from "@/types";
import { ChevronDown, ChevronRight, Check, Minus } from "lucide-react";

interface PermissionAccordionProps {
  groups: PermissionGroup[];
  selectedPermissionIds: string[];
  onChange: (selectedIds: string[]) => void;
}

// 3-state Checkbox Component (Supports Checked, Indeterminate, and Unchecked)
function TriStateCheckbox({
  checked,
  indeterminate,
  onChange,
  id,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <input
        id={id}
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div
        onClick={(e) => {
          e.stopPropagation();
          const target = e.currentTarget.previousElementSibling as HTMLInputElement;
          target?.click();
        }}
        className={`w-4 h-4 rounded border transition-colors cursor-pointer flex items-center justify-center ${
          checked || indeterminate
            ? "bg-blue-600 border-blue-600 text-white"
            : "bg-white border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
        }`}
      >
        {checked && <Check className="w-3 h-3 stroke-[3]" />}
        {!checked && indeterminate && <Minus className="w-3 h-3 stroke-[3]" />}
      </div>
    </div>
  );
}

export function PermissionAccordion({
  groups,
  selectedPermissionIds,
  onChange,
}: PermissionAccordionProps) {
  // Collect all permission IDs across all groups
  const allPermissions = groups.flatMap((g) => g.permissions);
  const totalPermissionsCount = allPermissions.length;
  const selectedCount = selectedPermissionIds.length;

  // Track expanded accordion panels (First group open by default)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (groups.length > 0) {
      initial[groups[0].groupName] = true;
    }
    return initial;
  });

  const toggleGroupExpand = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Toggle "Select All / Deselect All"
  const handleSelectAll = () => {
    if (selectedCount === totalPermissionsCount) {
      onChange([]);
    } else {
      onChange(allPermissions.map((p) => p.id));
    }
  };

  // Toggle single permission
  const handleTogglePermission = (permissionId: string) => {
    if (selectedPermissionIds.includes(permissionId)) {
      onChange(selectedPermissionIds.filter((id) => id !== permissionId));
    } else {
      onChange([...selectedPermissionIds, permissionId]);
    }
  };

  // Toggle all permissions in a group
  const handleToggleGroup = (group: PermissionGroup, shouldSelect: boolean) => {
    const groupPermIds = group.permissions.map((p) => p.id);

    if (shouldSelect) {
      // Add all group permissions that aren't already selected
      const newSelected = Array.from(
        new Set([...selectedPermissionIds, ...groupPermIds])
      );
      onChange(newSelected);
    } else {
      // Remove all group permissions
      const newSelected = selectedPermissionIds.filter(
        (id) => !groupPermIds.includes(id)
      );
      onChange(newSelected);
    }
  };

  return (
    <div className="space-y-4 text-sm font-sans">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-medium px-3 py-1.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            {selectedCount === totalPermissionsCount
              ? "Bỏ chọn tất cả"
              : "Chọn tất cả"}
          </button>
        </div>
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Đã chọn <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedCount}</span> / {totalPermissionsCount} quyền
        </div>
      </div>

      {/* Accordion Groups */}
      <div className="space-y-2">
        {groups.map((group) => {
          const groupPermIds = group.permissions.map((p) => p.id);
          const selectedGroupPermsCount = groupPermIds.filter((id) =>
            selectedPermissionIds.includes(id)
          ).length;

          const isAllGroupSelected =
            groupPermIds.length > 0 &&
            selectedGroupPermsCount === groupPermIds.length;

          const isGroupIndeterminate =
            selectedGroupPermsCount > 0 &&
            selectedGroupPermsCount < groupPermIds.length;

          const isOpen = !!openGroups[group.groupName];

          return (
            <div
              key={group.groupName}
              className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden bg-white dark:bg-zinc-950 transition-colors"
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleGroupExpand(group.groupName)}
                className="flex items-center justify-between p-3 bg-zinc-50/60 dark:bg-zinc-900/50 hover:bg-zinc-100/70 dark:hover:bg-zinc-900 cursor-pointer select-none border-b border-zinc-100 dark:border-zinc-800/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Expand Icon */}
                  <span className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>

                  {/* 3-State Checkbox for Group */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center"
                  >
                    <TriStateCheckbox
                      checked={isAllGroupSelected}
                      indeterminate={isGroupIndeterminate}
                      onChange={(e) => {
                        handleToggleGroup(group, e.target.checked);
                      }}
                    />
                  </div>

                  {/* Group Name & Stats */}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {group.groupName}
                  </span>
                </div>

                <span className="text-xs text-zinc-400 font-normal">
                  {selectedGroupPermsCount}/{group.permissions.length} quyền
                </span>
              </div>

              {/* Accordion Body / List of Permissions */}
              {isOpen && (
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 bg-white dark:bg-zinc-950">
                  {group.permissions.map((perm) => {
                    const isSelected = selectedPermissionIds.includes(perm.id);

                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`flex items-start gap-3 p-2.5 rounded-md border cursor-pointer select-none transition-all ${
                          isSelected
                            ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50"
                            : "bg-white dark:bg-zinc-900/20 border-zinc-100 dark:border-zinc-800/80 hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-50/50"
                        }`}
                      >
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="pt-0.5"
                        >
                          <TriStateCheckbox
                            checked={isSelected}
                            indeterminate={false}
                            onChange={() => handleTogglePermission(perm.id)}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                              {perm.description || perm.name}
                            </span>
                            {/* Gray Code Badge */}
                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0">
                              {perm.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
