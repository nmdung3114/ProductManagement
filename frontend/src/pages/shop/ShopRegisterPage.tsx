import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../features/auth/api/authApi';
import { ShoppingBag, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { message } from 'antd';

export const ShopRegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      message.error('Vui lòng điền đầy đủ các thông tin!');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        fullName,
        email,
        password,
      });

      message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl mb-3">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Tạo tài khoản mới</h2>
          <p className="text-blue-100 text-sm mt-1">Nhanh chóng và đơn giản chỉ trong 1 phút</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyen Van A"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm mt-4"
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <span>Tạo tài khoản</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-8 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-600 text-sm">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopRegisterPage;
