import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginRequest } from '../features/auth/types/auth.types';
import { authApi } from '../features/auth/api/authApi';
import { storage } from '../utils/storage';

// 1. Định nghĩa kiểu dữ liệu cho Context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

// 2. Khởi tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider Component bao bọc toàn ứng dụng
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khôi phục trạng thái đăng nhập từ localStorage khi app vừa load (F5)
  useEffect(() => {
    const savedToken = storage.getToken();
    const savedUser = storage.getUser<User>();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  // Hàm xử lý Đăng nhập
  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    
    // Lưu vào State của React
    setToken(response.token);
    setUser(response.user);

    // Lưu vào bộ nhớ trình duyệt (localStorage)
    storage.setToken(response.token);
    storage.setUser(response.user);
  };

  // Hàm xử lý Đăng xuất
  const logout = () => {
    setToken(null);
    setUser(null);
    storage.clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user, // Trả về true nếu có cả token và user
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom Hook useAuth giúp các Component dễ dàng truy cập AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};
