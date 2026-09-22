import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Package,
  Menu,
  X,
  ChevronDown,
  Store
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';

export const ShopLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const { user, token, logout, isAdmin } = useAuthStore();
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const totalCartItems = getTotalItems();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
        🚀 Miễn phí vận chuyển cho tất cả đơn hàng trên 500.000đ | Hỗ trợ 24/7
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all">
              <Store className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                TechStore
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase -mt-1">
                E-Commerce
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
            <Link
              to="/"
              className={`hover:text-blue-600 transition-colors ${
                location.pathname === '/' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/products"
              className={`hover:text-blue-600 transition-colors ${
                location.pathname.startsWith('/products') ? 'text-blue-600 font-bold' : ''
              }`}
            >
              Sản phẩm
            </Link>
            {token && (
              <Link
                to="/orders"
                className={`hover:text-blue-600 transition-colors ${
                  location.pathname === '/orders' ? 'text-blue-600 font-bold' : ''
                }`}
              >
                Đơn hàng của tôi
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 border border-transparent rounded-full text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            
            {/* Shopping Cart Icon Badge */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition-all group"
            >
              <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {/* User Account Menu */}
            {token && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-all border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline font-semibold text-xs text-slate-800 max-w-[100px] truncate">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Card */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Đăng nhập với tên</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Trang cá nhân</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>Lịch sử đơn hàng</span>
                      </Link>

                      {isAdmin() && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>Quản trị Admin</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full shadow-md shadow-blue-500/20 transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-800 border-b border-slate-100"
            >
              Trang chủ
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-800 border-b border-slate-100"
            >
              Sản phẩm
            </Link>
            {token && (
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-slate-800 border-b border-slate-100"
              >
                Đơn hàng của tôi
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            {/* Col 1: About */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-xl text-white">TechStore</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Nền tảng mua sắm các thiết bị công nghệ chính hãng hàng đầu. Cam kết chất lượng, bảo hành 100% chính hãng.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link to="/products" className="hover:text-blue-400 transition-colors">Tất cả sản phẩm</Link></li>
                <li><Link to="/products?category=dienthoai" className="hover:text-blue-400 transition-colors">Điện thoại di động</Link></li>
                <li><Link to="/products?category=laptop" className="hover:text-blue-400 transition-colors">Máy tính Laptop</Link></li>
                <li><Link to="/cart" className="hover:text-blue-400 transition-colors">Giỏ hàng của bạn</Link></li>
              </ul>
            </div>

            {/* Col 3: Customer Service */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Chăm sóc khách hàng</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Chính sách bảo hành</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Chính sách đổi trả</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Phương thức thanh toán</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Hướng dẫn mua hàng</a></li>
              </ul>
            </div>

            {/* Col 4: Newsletter */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Đăng ký nhận ưu đãi</h4>
              <p className="text-slate-400 text-xs mb-3">Nhận thông tin khuyến mãi hàng tuần vào email của bạn.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className="bg-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 border border-slate-700"
                />
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <p>© 2026 TechStore. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400">Điều khoản</a>
              <a href="#" className="hover:text-slate-400">Bảo mật</a>
              <a href="#" className="hover:text-slate-400">Cookie</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShopLayout;
