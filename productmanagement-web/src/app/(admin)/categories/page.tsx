"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  Tags,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

interface CategoryDto {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string | null;
}

interface PaginationData {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Notifications
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryDto | null>(null);

  // Form states
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showNotification = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadCategories = async (page = 1) => {
    setLoading(true);
    try {
      let query = `/api/categories?page=${page}&pageSize=10`;
      if (searchName.trim()) query += `&name=${encodeURIComponent(searchName.trim())}`;
      if (statusFilter !== "all") query += `&isActive=${statusFilter === "active"}`;

      const res = await apiFetch<{
        success: boolean;
        data: CategoryDto[];
        pagination: PaginationData;
      }>(query);

      setCategories(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      showNotification("error", err.message || "Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCategories(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchName, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleOpenCreateModal = () => {
    setFormData({ name: "", description: "" });
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (cat: CategoryDto) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || "" });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification("error", "Tên danh mục không được để trống.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch("/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
        }),
      });

      showNotification("success", "Tạo danh mục mới thành công!");
      setShowCreateModal(false);
      loadCategories(pagination.page);
    } catch (err: any) {
      showNotification("error", err.message || "Không thể tạo danh mục.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    if (!formData.name.trim()) {
      showNotification("error", "Tên danh mục không được để trống.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
        }),
      });

      showNotification("success", "Cập nhật danh mục thành công!");
      setEditingCategory(null);
      loadCategories(pagination.page);
    } catch (err: any) {
      showNotification("error", err.message || "Không thể cập nhật danh mục.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingCategory) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });

      showNotification("success", `Đã xóa mềm danh mục "${deletingCategory.name}"`);
      setDeletingCategory(null);
      loadCategories(pagination.page);
    } catch (err: any) {
      showNotification("error", err.message || "Không thể xóa danh mục.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestoreCategory = async (cat: CategoryDto) => {
    try {
      await apiFetch(`/api/categories/${cat.id}/restore`, {
        method: "PUT",
      });

      showNotification("success", `Đã khôi phục hoạt động cho danh mục "${cat.name}"`);
      loadCategories(pagination.page);
    } catch (err: any) {
      showNotification("error", err.message || "Không thể khôi phục danh mục.");
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Tags className="w-5 h-5 text-blue-600" />
            Quản Lý Danh Mục Sản Phẩm
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Tạo mới, chỉnh sửa thông tin, xóa mềm & khôi phục danh mục phân loại sản phẩm
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Tìm kiếm danh mục theo tên..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã khóa / Xóa mềm</option>
              </select>
            </div>

            {(searchName || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchName("");
                  setStatusFilter("all");
                }}
                className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded-md transition-colors flex items-center gap-1.5"
                title="Xóa bộ lọc"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa lọc</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => loadCategories(pagination.page)}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md border border-zinc-200 dark:border-zinc-800"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </form>
      </div>

      {/* Main Categories Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="px-4 py-3 w-12 text-center">STT</th>
                <th className="px-4 py-3">Tên danh mục</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3 text-center">Số sản phẩm</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Đang tải danh sách danh mục...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                    Không tìm thấy danh mục nào phù hợp
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-center font-mono text-zinc-400">
                      {(pagination.page - 1) * pagination.pageSize + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                      {cat.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {cat.productCount} SP
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {cat.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          Đã khóa / Xóa
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {cat.isActive ? (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(cat)}
                              className="p-1.5 rounded text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingCategory(cat)}
                              className="p-1.5 rounded text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Xóa mềm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestoreCategory(cat)}
                            className="px-2.5 py-1 rounded text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1"
                            title="Khôi phục danh mục"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Khôi phục</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/50">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Hiển thị {categories.length} / {pagination.totalCount} danh mục (Trang{" "}
            {pagination.page} / {pagination.totalPages})
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={!pagination.hasPreviousPage}
              onClick={() => loadCategories(pagination.page - 1)}
              className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => loadCategories(pagination.page + 1)}
              className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Tags className="w-4 h-4 text-blue-600" />
                Thêm danh mục sản phẩm mới
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Thiết bị thông minh"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mô tả danh mục
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập mô tả ngắn gọn về danh mục..."
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Đang tạo..." : "Xác nhận tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Chỉnh sửa danh mục
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mô tả danh mục
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Xác nhận xóa danh mục?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Bạn có chắc chắn muốn xóa mềm danh mục{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  "{deletingCategory.name}"
                </span>
                ? Thao tác này sẽ vô hiệu hóa danh mục và có thể khôi phục lại sau.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Đang xóa..." : "Đồng ý xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
