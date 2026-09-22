import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. Khi app đang load lại thông tin token từ localStorage
  if (isLoading) {
    return (
      <div style={styles.loadingScreen}>
        <Loader2 size={36} className="spinner" style={{ color: '#2563eb' }} />
        <span style={{ marginTop: 12, color: '#4b5563', fontSize: 14 }}>Đang tải dữ liệu...</span>
      </div>
    );
  }

  // 2. Nếu chưa đăng nhập, tự động chuyển hướng về trang /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Đã đăng nhập hợp lệ -> Cho phép hiển thị giao diện bên trong
  return <>{children}</>;
};

const styles: Record<string, React.CSSProperties> = {
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    fontFamily: 'system-ui, sans-serif',
  },
};
