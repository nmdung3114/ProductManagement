import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Mail, ShieldCheck, Package } from 'lucide-react';

export const ShopProfilePage: React.FC = () => {
  const { user, isAdmin } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900">Thông tin cá nhân</h1>
        <p className="text-slate-500 text-xs mt-1">Quản lý hồ sơ tài khoản mua sắm của bạn</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-8">
        
        {/* Profile Card Header */}
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-3xl shadow-lg shadow-blue-500/25">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">{user?.fullName}</h2>
            <p className="text-slate-400 text-xs font-mono mt-0.5">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              {user?.roles?.map(role => (
                <span key={role} className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-200">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
              <User className="w-4 h-4 text-blue-600" />
              Họ và tên
            </span>
            <span className="font-bold text-slate-900 text-sm">{user?.fullName}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 text-xs flex items-center gap-1.5 mb-1">
              <Mail className="w-4 h-4 text-blue-600" />
              Địa chỉ Email
            </span>
            <span className="font-bold text-slate-900 text-sm font-mono">{user?.email}</span>
          </div>
        </div>

        {/* Quick Action Links */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Lối tắt tài khoản</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/orders"
              className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">Đơn hàng của tôi</span>
                <span className="text-xs text-slate-400">Xem lịch sử các đơn hàng đã đặt</span>
              </div>
            </Link>

            {isAdmin() && (
              <Link
                to="/admin/dashboard"
                className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 hover:shadow-md transition-all flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-indigo-900 text-sm block">Trang Quản trị Admin</span>
                  <span className="text-xs text-indigo-500">Truy cập vào Dashboard quản lý</span>
                </div>
              </Link>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ShopProfilePage;
