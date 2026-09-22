import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  ShoppingBag,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from 'lucide-react';
import { orderApi } from '../../features/orders/api/orderApi';
import { Order, OrderStatus } from '../../types';

const statusBadgeMap: Record<OrderStatus, { label: string; bg: string; text: string; icon: any }> = {
  Pending: { label: 'Chờ xác nhận', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock },
  Processing: { label: 'Đang xử lý', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: Package },
  Shipped: { label: 'Đang giao hàng', bg: 'bg-cyan-50 border-cyan-200', text: 'text-cyan-700', icon: Truck },
  Delivered: { label: 'Đã giao thành công', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle2 },
  Cancelled: { label: 'Đã hủy', bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle },
};

export const ShopOrdersPage: React.FC = () => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: orderApi.getMyOrders,
  });

  const filteredOrders = orders.filter(o => 
    selectedStatusFilter === 'ALL' ? true : o.status === selectedStatusFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Lịch sử Đơn hàng</h1>
          <p className="text-slate-500 text-xs mt-1">Theo dõi các đơn hàng bạn đã mua tại TechStore</p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedStatusFilter === st
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : statusBadgeMap[st as OrderStatus]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-44 bg-slate-200 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-lg">Chưa có đơn hàng nào</h3>
          <p className="text-slate-400 text-xs mt-1">Bạn chưa thực hiện đơn hàng nào ở trạng thái này.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const badge = statusBadgeMap[order.status] || {
              label: order.status,
              bg: 'bg-slate-50 border-slate-200',
              text: 'text-slate-700',
              icon: Package
            };
            const StatusIcon = badge.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-blue-600 text-base">
                      #{order.orderCode}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div className={`px-3.5 py-1 rounded-full border ${badge.bg} ${badge.text} text-xs font-bold flex items-center gap-1.5`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id || item.productId} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 p-1 flex items-center justify-center shrink-0">
                          {item.productImage ? (
                            <img src={item.productImage} alt={item.productName} className="max-h-full object-contain" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block line-clamp-1">{item.productName}</span>
                          <span className="text-slate-400">Số lượng: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.shippingAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-medium">Tổng tiền:</span>
                    <span className="text-xl font-extrabold text-blue-600 font-mono">
                      {order.totalAmount?.toLocaleString('vi-VN')} ₫
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
};

export default ShopOrdersPage;
