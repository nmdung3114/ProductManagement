"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  ShoppingCart,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  Package,
} from "lucide-react";

interface OrderAdminDto {
  id: string;
  userId: string;
  userFullName: string | null;
  userEmail: string | null;
  orderCode: string;
  totalAmount: number;
  status: string;
  itemCount: number;
  createdAt: string;
}

interface OrderItemDetailDto {
  productId: string;
  productName: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderDetailDto {
  id: string;
  userId: string;
  userFullName: string | null;
  userEmail: string | null;
  orderCode: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItemDetailDto[];
}

interface PaginationData {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderAdminDto[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Summary Metrics
  const [summary, setSummary] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [updatingOrder, setUpdatingOrder] = useState<OrderAdminDto | null>(null);
  const [updatingAction, setUpdatingAction] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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

  const loadOrders = async (page = 1) => {
    setLoading(true);
    try {
      let query = `/api/orders?page=${page}&pageSize=10`;
      if (statusFilter !== "all") query += `&status=${statusFilter}`;

      const res = await apiFetch<{
        success: boolean;
        data: OrderAdminDto[];
        pagination: PaginationData;
      }>(query);

      let orderList = res.data || [];

      // Local search filtering by code or email if term typed
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        orderList = orderList.filter(
          (o) =>
            o.orderCode.toLowerCase().includes(term) ||
            (o.userEmail && o.userEmail.toLowerCase().includes(term)) ||
            (o.userFullName && o.userFullName.toLowerCase().includes(term))
        );
      }

      setOrders(orderList);
      if (res.pagination) {
        setPagination(res.pagination);
      }

      // Calculate overview metrics from full dataset if needed
      const allRes = await apiFetch<{
        success: boolean;
        data: OrderAdminDto[];
      }>("/api/orders?pageSize=100").catch(() => ({ data: [] }));

      const allOrders = allRes.data || [];
      const pendingCount = allOrders.filter((o) => o.status === "Pending").length;
      const confirmedCount = allOrders.filter((o) => o.status === "Confirmed").length;
      const completedCount = allOrders.filter((o) => o.status === "Completed").length;
      const cancelledCount = allOrders.filter((o) => o.status === "Cancelled").length;
      const revenue = allOrders
        .filter((o) => o.status !== "Cancelled")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      setSummary({
        pending: pendingCount,
        confirmed: confirmedCount,
        completed: completedCount,
        cancelled: cancelledCount,
        totalRevenue: revenue,
      });
    } catch (err: any) {
      showNotification("error", err.message || "Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleViewDetail = async (orderId: string) => {
    setLoadingDetail(true);
    try {
      const res = await apiFetch<{ success: boolean; data: OrderDetailDto }>(
        `/api/orders/${orderId}`
      );
      setSelectedOrder(res.data);
    } catch (err: any) {
      showNotification("error", err.message || "Không thể xem chi tiết đơn hàng.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, action: string) => {
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });

      showNotification("success", "Cập nhật trạng thái đơn hàng thành công!");
      setUpdatingOrder(null);
      setSelectedOrder(null);
      loadOrders(pagination.page);
    } catch (err: any) {
      showNotification("error", err.message || "Cập nhật trạng thái thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
            <Clock className="w-3 h-3" /> Chờ xác nhận
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
            <CheckCircle2 className="w-3 h-3" /> Đã xác nhận
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="w-3 h-3" /> Hoàn thành
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
            <XCircle className="w-3 h-3" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {status}
          </span>
        );
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
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Quản Lý Đơn Hàng Hệ Thống
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Theo dõi, xác nhận và cập nhật tiến độ xử lý đơn hàng từ khách hàng
          </p>
        </div>

        <button
          onClick={() => loadOrders(pagination.page)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Chờ xác nhận
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {summary.pending}
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Đã xác nhận
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {summary.confirmed}
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Đã hoàn thành
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary.completed}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Doanh thu thực tế
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {formatCurrency(summary.totalRevenue)}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Mã đơn hàng (ORD-...) hoặc Email khách hàng..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Pending">Chờ xác nhận (Pending)</option>
              <option value="Confirmed">Đã xác nhận (Confirmed)</option>
              <option value="Completed">Hoàn thành (Completed)</option>
              <option value="Cancelled">Đã hủy (Cancelled)</option>
            </select>

            {(searchTerm || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 rounded-md transition-colors flex items-center gap-1 shrink-0"
                title="Xóa bộ lọc"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa lọc</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Main Orders Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="px-4 py-3 w-12 text-center">STT</th>
                <th className="px-4 py-3">Mã đơn hàng</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3 text-center">Số lượng</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                    Không có đơn hàng nào khớp với điều kiện lọc
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-center font-mono text-zinc-400">
                      {(pagination.page - 1) * pagination.pageSize + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {order.orderCode}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {order.userFullName || "Khách vãng lai"}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {order.userEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {order.itemCount} sản phẩm
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetail(order.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>

                        {/* Quick action button for status */}
                        {order.status === "Pending" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "Confirm")}
                            disabled={isSubmitting}
                            className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            Xác nhận
                          </button>
                        )}

                        {order.status === "Confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "Complete")}
                            disabled={isSubmitting}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                          >
                            Hoàn thành
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
            Hiển thị {orders.length} / {pagination.totalCount} đơn hàng (Trang{" "}
            {pagination.page} / {pagination.totalPages})
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={!pagination.hasPreviousPage}
              onClick={() => loadOrders(pagination.page - 1)}
              className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => loadOrders(pagination.page + 1)}
              className="p-1.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  Đơn hàng #{selectedOrder.orderCode}
                </h3>
                <p className="text-xs text-zinc-500">
                  Khách hàng: {selectedOrder.userFullName || "Khách"} (
                  {selectedOrder.userEmail})
                </p>
              </div>
              <div>{renderStatusBadge(selectedOrder.status)}</div>
            </div>

            {/* Status Change Buttons */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Thao tác chuyển trạng thái:
              </span>
              <div className="flex gap-2">
                {selectedOrder.status === "Pending" && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "Confirm")}
                      disabled={isSubmitting}
                      className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Duyệt & Xác nhận
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "Cancel")}
                      disabled={isSubmitting}
                      className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Hủy đơn hàng
                    </button>
                  </>
                )}

                {selectedOrder.status === "Confirmed" && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "Complete")}
                      disabled={isSubmitting}
                      className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                    >
                      Đánh dấu Hoàn thành
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "Cancel")}
                      disabled={isSubmitting}
                      className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Hủy đơn hàng
                    </button>
                  </>
                )}

                {(selectedOrder.status === "Completed" ||
                  selectedOrder.status === "Cancelled") && (
                  <span className="text-xs text-zinc-400 italic">
                    Đơn hàng đã đóng, không thể thay đổi
                  </span>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-blue-600" />
                Danh sách sản phẩm trong đơn:
              </h4>

              <div className="border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Sản phẩm</th>
                      <th className="px-3 py-2 text-right">Đơn giá</th>
                      <th className="px-3 py-2 text-center">SL</th>
                      <th className="px-3 py-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {item.productName}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono">
                            SKU: {item.productSKU}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Footer summary */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-500">
                Tổng giá trị đơn hàng:
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(selectedOrder.totalAmount)}
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
