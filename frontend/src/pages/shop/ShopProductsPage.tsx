import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
  ChevronRight
} from 'lucide-react';
import { productApi } from '../../features/products/api/productApi';
import { categoryApi } from '../../features/categories/api/categoryApi';
import { useCartStore } from '../../store/useCartStore';
import { Product } from '../../types';
import { message } from 'antd';

export const ShopProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState<number>(100000000); // 100M max
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  });

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    message.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = searchQuery
        ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesCategory = selectedCategory
        ? p.categoryId === selectedCategory
        : true;

      const matchesPrice = p.price <= priceRange;

      return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange(100000000);
    setSortBy('default');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <a href="/" className="hover:text-blue-600">Trang chủ</a>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900 font-semibold">Tất cả sản phẩm</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Danh sách Sản phẩm</h1>
          <p className="text-slate-500 text-xs mt-1">
            Hiển thị {filteredProducts.length} sản phẩm phù hợp
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Sắp xếp theo:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="name">Tên sản phẩm A-Z</option>
          </select>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Bộ lọc tìm kiếm</span>
            </h3>

            {(selectedCategory || searchQuery || priceRange < 100000000) && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <X className="w-3 h-3" />
                Xóa lọc
              </button>
            )}
          </div>

          {/* Search Input Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Từ khóa</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập tên sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Danh mục</label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  !selectedCategory
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tất cả danh mục
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Mức giá tối đa</span>
              <span className="font-mono text-blue-600">
                {priceRange >= 100000000 ? 'Tất cả' : `${priceRange.toLocaleString('vi-VN')} ₫`}
              </span>
            </div>
            <input
              type="range"
              min={1000000}
              max={100000000}
              step={1000000}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-80 bg-slate-200 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-lg">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-slate-400 text-xs mt-1">Vui lòng thử điều chỉnh lại bộ lọc tìm kiếm của bạn.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
                >
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
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-600 tracking-wider uppercase">
                        {product.categoryName || 'Sản phẩm'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
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
        </div>
      </div>
    </div>
  );
};

export default ShopProductsPage;
