import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Sparkles,
  Star
} from 'lucide-react';
import { productApi } from '../../features/products/api/productApi';
import { categoryApi } from '../../features/categories/api/categoryApi';
import { useCartStore } from '../../store/useCartStore';
import { Product } from '../../types';
import { message } from 'antd';

export const ShopHomePage: React.FC = () => {
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  });

  const featuredProducts = products.slice(0, 8);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    message.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.15),transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Công Nghệ Mới Nhất 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Khám Phá Thiết Bị <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Công Nghệ Đỉnh Cao
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Trải nghiệm các dòng sản phẩm Điện thoại, Laptop, Phụ kiện chính hãng với mức giá ưu đãi tốt nhất cùng chính sách bảo hành 1 đổi 1.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link
                to="/products"
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all hover:scale-105 text-sm"
              >
                <span>Mua sắm ngay</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#categories"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/20 backdrop-blur-md flex items-center justify-center transition-all text-sm"
              >
                Khám phá danh mục
              </a>
            </div>
          </div>

          {/* Hero Decorative Card */}
          <div className="relative flex justify-center">
            <div className="w-72 sm:w-96 h-80 sm:h-96 rounded-3xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-white/10 backdrop-blur-xl p-6 flex flex-col justify-between shadow-2xl relative">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-indigo-600 text-white font-bold text-xs rounded-full">
                  HOT DEAL
                </span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>4.9 (1.2k)</span>
                </div>
              </div>

              <div className="my-auto text-center">
                <div className="w-40 h-40 mx-auto rounded-2xl bg-indigo-500/20 flex items-center justify-center backdrop-blur-md mb-4 border border-indigo-400/20">
                  <Zap className="w-20 h-20 text-indigo-300 animate-pulse" />
                </div>
                <h3 className="font-extrabold text-xl text-white">iPhone 15 Pro Max</h3>
                <p className="text-indigo-200 text-sm font-mono mt-1">Giảm đến 15% duy nhất hôm nay</p>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-slate-400">Giá chỉ từ</span>
                <span className="font-extrabold text-lg text-emerald-400 font-mono">29.990.000 ₫</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Giao hàng miễn phí</h4>
              <p className="text-slate-500 text-xs mt-0.5">Cho tất cả đơn hàng trên 500k</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Bảo hành chính hãng</h4>
              <p className="text-slate-500 text-xs mt-0.5">Cam kết 100% hàng chất lượng</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Dễ dàng đổi trả</h4>
              <p className="text-slate-500 text-xs mt-0.5">Hỗ trợ 1 đổi 1 trong 30 ngày</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Showcase */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Danh mục sản phẩm</h2>
            <p className="text-slate-500 text-sm mt-1">Lựa chọn ngành hàng phù hợp với nhu cầu của bạn</p>
          </div>
          <Link to="/products" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
            <span>Xem tất cả</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(`/products?category=${category.id}`)}
              className="p-6 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {category.description || 'Xem sản phẩm'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Sản phẩm nổi bật</h2>
            <p className="text-slate-500 text-sm mt-1">Những thiết bị được quan tâm hàng đầu</p>
          </div>
          <Link to="/products" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
            <span>Xem thêm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
              >
                {/* Product Image */}
                <div className="h-52 bg-slate-100 relative overflow-hidden flex items-center justify-center p-4">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <ShoppingBag className="w-16 h-16 text-slate-300" />
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Sắp hết hàng
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-600 tracking-wider uppercase">
                      {product.categoryName || 'Sản phẩm'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Giá bán</span>
                      <span className="font-extrabold text-base text-slate-900 font-mono">
                        {product.price.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-110 active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 sm:p-16 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="max-w-xl space-y-3 z-10">
            <h3 className="text-3xl font-extrabold">Đăng ký thành viên TechStore ngay</h3>
            <p className="text-blue-100 text-sm">
              Nhận ngay voucher giảm giá 100.000đ cho đơn hàng đầu tiên cùng các chương trình tích điểm đổi quà.
            </p>
          </div>
          <Link
            to="/register"
            className="px-8 py-4 bg-white text-blue-600 font-extrabold rounded-2xl shadow-xl hover:bg-slate-100 transition-all text-sm shrink-0 z-10"
          >
            Đăng ký ngay bây giờ
          </Link>
        </div>
      </section>

    </div>
  );
};

export default ShopHomePage;
