import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export const ShopCartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Giỏ hàng của bạn đang trống</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          Hãy khám phá các sản phẩm tuyệt vời của chúng tôi và chọn cho mình những thiết bị ưng ý nhất!
        </p>
        <Link
          to="/products"
          className="mt-8 inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all text-sm"
        >
          <span>Khám phá sản phẩm</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Giỏ hàng của bạn</h1>
          <p className="text-slate-500 text-xs mt-1">Đang có {items.length} loại sản phẩm trong giỏ</p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>Xóa toàn bộ giỏ hàng</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row items-center gap-5 shadow-sm hover:border-slate-300 transition-all"
            >
              {/* Image */}
              <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 p-2 border border-slate-100">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="max-h-full object-contain" />
                ) : (
                  <ShoppingBag className="w-8 h-8 text-slate-300" />
                )}
              </div>

              {/* Title & Info */}
              <div className="flex-1 text-center sm:text-left">
                <Link
                  to={`/products/${product.id}`}
                  className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors line-clamp-1"
                >
                  {product.name}
                </Link>
                <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {product.sku}</p>
                <div className="font-mono font-bold text-blue-600 text-sm mt-1 sm:hidden">
                  {product.price.toLocaleString('vi-VN')} ₫
                </div>
              </div>

              {/* Unit Price (Desktop) */}
              <div className="hidden sm:block text-right pr-4">
                <span className="text-[11px] text-slate-400 block">Đơn giá</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {product.price.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-1">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-10 text-center font-bold text-xs font-mono">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Delete item button */}
              <button
                onClick={() => removeItem(product.id)}
                className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tiếp tục mua hàng</span>
          </Link>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm h-fit space-y-6">
          <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-4">
            Tóm tắt đơn hàng
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)</span>
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
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] text-sm"
          >
            <span>Tiến hành Thanh toán</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 text-[11px] text-slate-500 border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Thanh toán an toàn & Bảo mật thông tin 100%</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ShopCartPage;
