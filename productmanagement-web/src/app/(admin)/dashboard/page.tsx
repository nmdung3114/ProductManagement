"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { apiFetch } from "@/lib/api";
import {
  Users,
  ShieldCheck,
  Package,
  Tags,
  ShoppingCart,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
} from "lucide-react";

interface CategoryDto {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  productCount: number;
}

interface ProductDto {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  categoryName: string;
}

interface OrderDto {
  id: string;
  orderCode: string;
  userFullName: string | null;
  userEmail: string | null;
  totalAmount: number;
  status: string;
  itemCount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    usersCount: 0,
    rolesCount: 0,
    productsCount: 0,
    categoriesCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState<OrderDto[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: {
          usersCount: number;
          rolesCount: number;
          productsCount: number;
          categoriesCount: number;
          ordersCount: number;
          pendingOrders: number;
          totalRevenue: number;
          recentOrders: any[];
          lowStockProducts: ProductDto[];
        };
      }>("/api/dashboard/stats");

      if (res.data) {
        setStats({
          usersCount: res.data.usersCount || 0,
          rolesCount: res.data.rolesCount || 0,
          productsCount: res.data.productsCount || 0,
          categoriesCount: res.data.categoriesCount || 0,
          ordersCount: res.data.ordersCount || 0,
          totalRevenue: res.data.totalRevenue || 0,
          pendingOrders: res.data.pendingOrders || 0,
        });

        const mappedOrders = (res.data.recentOrders || []).map((o) => ({
          ...o,
          userFullName: o.customerName || o.userFullName || "Khách hàng",
          userEmail: o.customerEmail || o.userEmail || "",
        }));

        setRecentOrders(mappedOrders);
        setLowStockProducts(res.data.lowStockProducts || []);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleViewOrderDetail = async (orderId: string) => {
    setLoadingOrder(true);
    try {
      const res = await apiFetch<{ success: boolean; data: any }>(
        `/api/orders/${orderId}`
      );
      setSelectedOrder(res.data);
    } catch (err) {
      console.error("Lỗi lấy chi tiết đơn hàng", err);
    } finally {
      setLoadingOrder(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
            <Clock className="w-3 h-3" /> Chờ xử lý
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
            <CheckCircle2 className="w-3 h-3" /> Đã xác nhận
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="w-3 h-3" /> Hoàn thành
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
            <XCircle className="w-3 h-3" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Bảng Điều Khiển Hệ Thống
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Tổng quan  về sản phẩm, danh mục, đơn hàng và vai trò
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Tổng doanh thu
            </span>
            <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {loading ? "..." : formatCurrency(stats.totalRevenue)}
            </span>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              Từ {stats.ordersCount} đơn hàng thực tế
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Đơn hàng
            </span>
            <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {loading ? "..." : stats.ordersCount}
            </span>
            {stats.pendingOrders > 0 && (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                {stats.pendingOrders} đơn chờ xử lý
              </span>
            )}
          </div>
        </div>

        {/* Total Products */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Sản phẩm
            </span>
            <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {loading ? "..." : stats.productsCount}
            </span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Phân loại trong {stats.categoriesCount} danh mục
            </p>
          </div>
        </div>

        {/* Users & Roles */}
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Người dùng / Role
            </span>
            <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {loading ? "..." : stats.usersCount}
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              {stats.rolesCount} Vai trò RBAC
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Orders & Inventory Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
                Đơn hàng mới nhất
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Các giao dịch vừa phát sinh gần đây trong hệ thống
              </p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Mã đơn</th>
                  <th className="px-4 py-3 font-semibold">Khách hàng</th>
                  <th className="px-4 py-3 font-semibold">Tổng tiền</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 font-semibold text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                      Đang tải đơn hàng...
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-400">
                      Chưa có đơn hàng nào trong hệ thống
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-blue-600 dark:text-blue-400">
                        {order.orderCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {order.userFullName || "Khách hàng"}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {order.userEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        {renderStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewOrderDetail(order.id)}
                          className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                          title="Xem nhanh"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning & Inventory Overview (1 Col) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Sản phẩm tồn kho ít
            </h2>
            <Link
              href="/products"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Quản lý kho
            </Link>
          </div>

          <div className="p-4 flex-1 space-y-3">
            {loading ? (
              <div className="text-xs text-zinc-400 py-6 text-center">
                Đang kiểm tra tồn kho...
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 py-6 text-center flex flex-col items-center gap-1">
                <CheckCircle2 className="w-5 h-5" />
                <span>Tồn kho tất cả sản phẩm đều an toàn</span>
              </div>
            ) : (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      SKU: {product.sku} • {product.categoryName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded ${
                        product.stock <= 5
                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                      }`}
                    >
                      Tồn: {product.stock}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Navigation Quick Access Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Link
          href="/products"
          className="group p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:border-blue-500 dark:hover:border-blue-500 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                  Quản lý Sản phẩm
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Thêm mới, sửa giá, điều chỉnh kho
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          href="/categories"
          className="group p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:border-blue-500 dark:hover:border-blue-500 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                  Quản lý Danh mục
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Tổ chức cấu trúc phân loại
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link
          href="/orders"
          className="group p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:border-blue-500 dark:hover:border-blue-500 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                  Quản lý Đơn hàng
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Xác nhận & duyệt trạng thái đơn
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                  {selectedOrder.orderCode}
                </h3>
                <p className="text-xs text-zinc-500">
                  Khách hàng: {selectedOrder.userFullName || selectedOrder.userEmail}
                </p>
              </div>
              {renderStatusBadge(selectedOrder.status)}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Sản phẩm trong đơn:
              </h4>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md">
                {selectedOrder.items?.map((item: any) => (
                  <div
                    key={item.productId}
                    className="p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        SKU: {item.productSKU} • {formatCurrency(item.unitPrice)} x{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-zinc-500">Tổng cộng:</span>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400">
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
