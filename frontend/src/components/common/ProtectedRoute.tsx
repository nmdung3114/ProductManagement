import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Result, Button } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requiredPermission,
}) => {
  const { token, user, hasPermission, isAdmin } = useAuthStore();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  if (!token || !user) {
    const loginPath = isAdminPath ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <Result
          status="403"
          title="403"
          subTitle="Xin lỗi, bạn không có quyền truy cập vào trang Quản trị!"
          extra={
            <Button type="primary" onClick={() => window.location.href = '/'}>
              Quay về Trang chủ Shop
            </Button>
          }
        />
      </div>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
        <Result
          status="403"
          title="403 - Truy cập bị từ chối"
          subTitle={`Bạn cần có quyền "${requiredPermission}" để xem nội dung này.`}
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
