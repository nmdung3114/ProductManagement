import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { orderApi } from '../../features/orders/api/orderApi';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { message } from 'antd';

export const ShopCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const totalPrice = getTotalPrice();

  const createOrderMutation = useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      message.success('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.');
      clearCart();
      navigate('/orders');
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Đặt hàng thất bại! Vui lòng thử lại.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !phone) {
      message.error('Vui lòng điền đầy đủ địa chỉ giao hàng và số điện thoại!');
      return;
    }

    if (items.length === 0) {
      message.error('Giỏ hàng trống!');
      return;
    }

    const fullShippingAddress = `${phone} - ${address}`;

    createOrderMutation.mutate({
      shippingAddress: fullShippingAddress,
      paymentMethod,
      items: items.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
      })),
    });
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900">Thanh toán đơn hàng</h1>
        <p className="text-slate-500 text-xs mt-1">Vui lòng điền thông tin nhận hàng để hoàn tất đơn hàng</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Address & Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Shipping Info */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Địa chỉ nhận hàng</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Người nhận</label>
                <input
                  type="text"
                  disabled
                  value={user?.fullName || ''}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  required
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện) *</label>
              <textarea
                required
                rows={3}
                placeholder="Ví dụ: 123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section 2: Payment Methods */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Phương thức thanh toán</span>
            </h3>

            <div className="space-y-3">
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Thanh toán khi nhận hàng (COD)</span>
                    <span className="text-xs text-slate-500">Thanh toán tiền mặt cho shipper khi nhận được hàng</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="w-4 h-4 accent-blue-600"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('Banking')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'Banking'
                    ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Chuyển khoản Ngân hàng (QR Code)</span>
                    <span className="text-xs text-slate-500">Quét mã VietQR chuyển khoản nhanh 24/7</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Banking'}
                  onChange={() => setPaymentMethod('Banking')}
                  className="w-4 h-4 accent-blue-600"
                />
              </label>
            </div>
          </div>

        </div>

        {/* Right Summary */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm h-fit space-y-6">
          <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-4">
            Đơn hàng ({items.length} sản phẩm)
          </h3>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center p-1 shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="max-h-full object-contain" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block line-clamp-1">{product.name}</span>
                    <span className="text-slate-400 font-mono">SL: {quantity}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  {(product.price * quantity).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính</span>
              <span className="font-mono font-bold text-slate-900">{totalPrice.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí vận chuyển</span>
              <span className="text-emerald-600 font-bold">Miễn phí</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
              <span className="text-2xl font-extrabold text-blue-600 font-mono">
                {totalPrice.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={createOrderMutation.isPending}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] text-sm"
          >
            {createOrderMutation.isPending ? (
              <span>Đang xử lý đơn hàng...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Xác nhận Đặt hàng</span>
              </>
            )}
          </button>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 text-[11px] text-slate-500 border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Bảo mật thông tin thanh toán tuyệt đối</span>
          </div>
        </div>

      </form>

    </div>
  );
};

export default ShopCheckoutPage;
