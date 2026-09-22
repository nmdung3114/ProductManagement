import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  Minus,
  Plus,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { productApi } from '../../features/products/api/productApi';
import { useCartStore } from '../../store/useCartStore';
import { message } from 'antd';

export const ShopProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id!),
    enabled: !!id,
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getProducts(),
  });

  const relatedProducts = allProducts
    .filter(p => p.id !== id && p.categoryId === product?.categoryId)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    message.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-semibold text-sm">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Không tìm thấy sản phẩm</h2>
        <p className="text-slate-500 text-sm mt-1">Sản phẩm này có thể đã bị ngưng bán hoặc đường dẫn không hợp lệ.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang sản phẩm</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Detail Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Image Gallery */}
        <div className="bg-slate-50 rounded-2xl p-8 flex items-center justify-center border border-slate-100 min-h-[380px]">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-96 object-contain hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ShoppingBag className="w-24 h-24 text-slate-300" />
          )}
        </div>

        {/* Right Product Info */}
        <div className="space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-full">
                {product.categoryName || 'Sản phẩm'}
              </span>
              <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              {product.name}
            </h1>

            {/* Price tag */}
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-blue-600 font-mono">
                {product.price.toLocaleString('vi-VN')} ₫
              </span>
              <span className="text-xs text-slate-400">Đã bao gồm thuế VAT</span>
            </div>

            {/* Stock status */}
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
              {product.stock > 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Còn hàng ({product.stock} sản phẩm sẵn có)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">Hết hàng</span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Mô tả sản phẩm</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {product.description || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}
              </p>
            </div>
          </div>

          {/* Action section */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Số lượng:</span>
              <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center font-bold text-sm font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] text-sm"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Thêm vào giỏ hàng</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Sản phẩm tương tự</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigate(`/products/${rel.id}`)}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-lg transition-all cursor-pointer p-4 flex flex-col justify-between"
              >
                <div className="h-40 bg-slate-100 rounded-xl flex items-center justify-center p-3 mb-3">
                  {rel.imageUrl ? (
                    <img src={rel.imageUrl} alt={rel.name} className="max-h-full object-contain" />
                  ) : (
                    <ShoppingBag className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{rel.name}</h4>
                  <span className="font-mono font-bold text-blue-600 text-sm mt-1 block">
                    {rel.price.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ShopProductDetailPage;
