"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { PERMISSIONS, ROLES } from "@/lib/permissions";
import { ProductInventoryDto, ProductPublicDto, isProductInventoryDto, PaginationData } from "@/types";
import {
  Package,
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
  AlertTriangle,
  RotateCcw,
  Eye,
} from "lucide-react";

interface CategoryDto {
  id: string;
  name: string;
}

// Union type: backend trả về loại DTO khác nhau theo role
type ProductDto = ProductInventoryDto | ProductPublicDto;

export default function ProductsPage() {
  const { hasPermission: hasPerm, hasAnyRole, userRoles } = useAuth();
  // Kiểm tra user có quyền xem thông tin kho chi tiết không
  const canSeeInventoryDetails = hasAnyRole(ROLES.Admin, ROLES.InventoryManager);
  const canCreate = hasPerm(PERMISSIONS.Product.Create);
  const canEdit   = hasPerm(PERMISSIONS.Product.Update);
  const canDelete  = hasPerm(PERMISSIONS.Product.Delete);

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  // Filters state
  const [searchName, setSearchName] = useState("");
  const [searchSku, setSearchSku] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDescending, setSortDescending] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // Toast
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductDto | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    price: 0,
    stock: 0,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadCategories = async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: CategoryDto[] }>(
        "/api/categories?pageSize=100"
      );
      setCategories(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    }
  };

  const loadProducts = async (page = 1) => {
    setLoading(true);
    try {
      let query = `/api/products?page=${page}&pageSize=10&sortBy=${sortBy}&sortDescending=${sortDescending}`;
      if (searchName.trim()) query += `&name=${encodeURIComponent(searchName.trim())}`;
      if (searchSku.trim()) query += `&sku=${encodeURIComponent(searchSku.trim())}`;
      if (selectedCategory) query += `&categoryId=${selectedCategory}`;
      if (statusFilter !== "all") query += `&isActive=${statusFilter === "active"}`;

      const res = await apiFetch<{
        success: boolean;
        data: ProductDto[];
        pagination: PaginationData;
      }>(query);

      setProducts(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      showNotification("error", err.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchName, searchSku, selectedCategory, statusFilter, sortBy, sortDescending]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleOpenCreateModal = () => {
    setFormData({
      name: "",
      sku: "",
      categoryId: categories.length > 0 ? categories[0].id : "",
      price: 0,
      stock: 0,
      description: "",
    });
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (product: ProductDto) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      price: product.price,
      stock: product.stock,
      description: product.description || "",
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim() || !formData.categoryId) {
      showNotification("error", "Vui lòng điền đầy đủ Tên, SKU và Danh mục.");
      return;
    }

    if (formData.price < 0 || formData.stock < 0) {
      showNotification("error", "Giá và số lượng tồn kho không được âm.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          categoryId: formData.categoryId,
          price: Number(formData.price),
          stock: Number(formData.stock),
          description: formData.description.trim(),
        }),
      });

      showNotification("success", "Tạo sản phẩm mới thành công!");
      setShowCreateModal(false);
      loadProducts(pagination.page);
    } catch (err: any) {
      showNotification("error", err.message || "Không thể tạo sản phẩm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!formData.name.trim() || !formData.sku.trim() || !formData.categoryId) {
      showNotification("error", "Vui lòng điền đầy đủ Tên, SKU và Danh mục.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          categoryId: formData.categoryId,
          price: Number(formData.price),
          stock: Number(formData.stock),
          description: formData.description.trim(),
        }),
      });

      showNotification("success", "Cập nhật sản phẩm thành công!");
      setEditingProduct(null);
      loadProducts(pagination.page);
    } catch (err: any) {
      showNotification("error", err.message || "Không thể cập nhật sản phẩm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/products/${deletingProduct.id}`, {
        method: "DELETE",
      });

      showNotification("success", `Đã xóa mềm sản phẩm "${deletingProduct.name}"`);
      setDeletingProduct(null);
      loadProducts(pagination.page);
    } catch (err: any) {
      showNotification("error", err.message || "Không thể xóa sản phẩm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestoreProduct = async (prod: ProductDto) => {
    try {
      await apiFetch(`/api/products/${prod.id}/restore`, {
        method: "PUT",
      });

      showNotification("success", `Đã khôi phục hoạt động cho sản phẩm "${prod.name}"`);
      loadProducts(pagination.page);
    } catch (err: any) {
      showNotification("error", err.message || "Không thể khôi phục sản phẩm.");
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
            <Package className="w-5 h-5 text-indigo-600" />
            {canSeeInventoryDetails ? "Quản Lý Sản Phẩm Trong Kho" : "Danh Sách Sản Phẩm"}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {canSeeInventoryDetails
              ? "Quản lý thông tin chi tiết sản phẩm, giá niêm yết, tồn kho, xóa mềm & khôi phục kinh doanh"
              : "Xem thông tin sản phẩm đang kinh doanh"}
          </p>
        </div>

        {canCreate && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm mới</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Name */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Tên sản phẩm..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Search SKU */}
          <input
            type="text"
            value={searchSku}
            onChange={(e) => setSearchSku(e.target.value)}
            placeholder="Mã SKU..."
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 font-mono"
          />

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang kinh doanh</option>
            <option value="inactive">Đã khóa / Xóa mềm</option>
          </select>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            {(searchName || searchSku || selectedCategory || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchName("");
                  setSearchSku("");
                  setSelectedCategory("");
                  setStatusFilter("all");
                  setSortBy("createdAt");
                  setSortDescending(true);
                }}
                className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded-md transition-colors flex items-center gap-1"
                title="Xóa bộ lọc"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa lọc</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => loadProducts(pagination.page)}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md border border-zinc-200 dark:border-zinc-800"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </form>
      </div>

      {/* Main Products Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="px-4 py-3 w-12 text-center">STT</th>
                <th className="px-4 py-3">Sản phẩm {canSeeInventoryDetails && "& SKU"}</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3 text-right">Giá niêm yết</th>
                <th className="px-4 py-3 text-center">
                  {canSeeInventoryDetails ? "Tồn kho" : "Tình trạng"}
                </th>
                {canSeeInventoryDetails && (
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                )}
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                    Không tìm thấy sản phẩm nào trong kho
                  </td>
                </tr>
              ) : (
                products.map((prod, idx) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-center font-mono text-zinc-400">
                      {(pagination.page - 1) * pagination.pageSize + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {prod.name}
                      </div>
                      {canSeeInventoryDetails && isProductInventoryDto(prod) && (
                        <div className="text-[11px] text-zinc-400 font-mono">
                          SKU: {prod.sku}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300 font-medium">
                      {prod.categoryName || "Không phân loại"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(prod.price)}
                    </td>
                    {/* Cột Tồn kho: hiển thị khác nhau theo role */}
                    <td className="px-4 py-3 text-center">
                      {canSeeInventoryDetails && isProductInventoryDto(prod) ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold ${
                            prod.stock <= 5
                              ? "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900"
                              : prod.stock <= 15
                              ? "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                          }`}
                        >
                          {prod.stock <= 5 && <AlertTriangle className="w-3 h-3" />}
                          {prod.stock} cái
                        </span>
                      ) : (
                        // SalesStaff / Auditor / Customer: chỉ thấy Còn/Hết hàng
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold border ${
                          (!isProductInventoryDto(prod) && (prod as ProductPublicDto).inStock) ||
                          (isProductInventoryDto(prod) && prod.stock > 0)
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
                        }`}>
                          {(!isProductInventoryDto(prod) && (prod as ProductPublicDto).inStock) ||
                          (isProductInventoryDto(prod) && prod.stock > 0)
                            ? "Còn hàng" : "Hết hàng"}
                        </span>
                      )}
                    </td>
                    {/* Cột Trạng thái kinh doanh: chỉ Admin/InventoryManager */}
                    {canSeeInventoryDetails && isProductInventoryDto(prod) && (
                      <td className="px-4 py-3 text-center">
                        {prod.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                            Kinh doanh
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            Đã khóa
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Readonly view: SalesStaff, Auditor */}
                        {!canEdit && !canDelete && (
                          <span className="text-[11px] text-zinc-400 italic px-2">Chỉ xem</span>
                        )}
                        {/* Edit: Admin, InventoryManager */}
                        {canEdit && isProductInventoryDto(prod) && prod.isActive && (
                          <button
                            onClick={() => handleOpenEditModal(prod as any)}
                            className="p-1.5 rounded text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Delete: Admin, InventoryManager */}
                        {canDelete && isProductInventoryDto(prod) && prod.isActive && (
                          <button
                            onClick={() => setDeletingProduct(prod as any)}
                            className="p-1.5 rounded text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Xóa mềm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Restore: Admin, InventoryManager */}
                        {canEdit && isProductInventoryDto(prod) && !prod.isActive && (
                          <button
                            onClick={() => handleRestoreProduct(prod as any)}
                            className="px-2.5 py-1 rounded text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1"
                            title="Khôi phục kinh doanh"
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
            Hiển thị {products.length} / {pagination.totalCount} sản phẩm (Trang{" "}
            {pagination.page} / {pagination.totalPages})
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={!pagination.hasPreviousPage}
              onClick={() => loadProducts(pagination.page - 1)}
              className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => loadProducts(pagination.page + 1)}
              className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                Thêm sản phẩm mới vào kho
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: iPhone 15 Pro Max"
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Mã SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="IP15PM-256"
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Danh mục phân loại <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Giá niêm yết (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Số lượng tồn kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mô tả sản phẩm
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Thông số kỹ thuật, mô tả điểm nổi bật..."
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
                  {isSubmitting ? "Đang tạo..." : "Xác nhận tạo sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                Chỉnh sửa sản phẩm
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tên sản phẩm <span className="text-red-500">*</span>
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
                    Mã SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Danh mục phân loại <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Giá niêm yết (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Số lượng tồn kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mô tả sản phẩm
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
                  onClick={() => setEditingProduct(null)}
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
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Xác nhận xóa sản phẩm?
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Bạn có chắc chắn muốn xóa mềm sản phẩm{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  "{deletingProduct.name}"
                </span>{" "}
                (SKU: {deletingProduct.sku})? Thao tác này sẽ vô hiệu hóa sản phẩm và có thể khôi phục lại sau.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
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
