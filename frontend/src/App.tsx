import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Core Guard
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import ShopLayout from './components/layout/ShopLayout';
import AdminLayout from './components/layout/AdminLayout';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';

// Shop Pages
import ShopHomePage from './pages/shop/ShopHomePage';
import ShopProductsPage from './pages/shop/ShopProductsPage';
import ShopProductDetailPage from './pages/shop/ShopProductDetailPage';
import ShopCartPage from './pages/shop/ShopCartPage';
import ShopCheckoutPage from './pages/shop/ShopCheckoutPage';
import ShopOrdersPage from './pages/shop/ShopOrdersPage';
import ShopProfilePage from './pages/shop/ShopProfilePage';
import ShopLoginPage from './pages/shop/ShopLoginPage';
import ShopRegisterPage from './pages/shop/ShopRegisterPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          
          {/* SHOP ROUTES */}
          <Route path="/" element={<ShopLayout />}>
            <Route index element={<ShopHomePage />} />
            <Route path="products" element={<ShopProductsPage />} />
            <Route path="products/:id" element={<ShopProductDetailPage />} />
            <Route path="cart" element={<ShopCartPage />} />

            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <ShopCheckoutPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="orders"
              element={
                <ProtectedRoute>
                  <ShopOrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ShopProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* SHOP AUTH */}
          <Route path="/login" element={<ShopLoginPage />} />
          <Route path="/register" element={<ShopRegisterPage />} />

          {/* ADMIN AUTH */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminLoginPage />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />

            <Route
              path="roles"
              element={
                <ProtectedRoute requiredPermission="Role.View">
                  <AdminRolesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="users"
              element={
                <ProtectedRoute requiredPermission="User.View">
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="products"
              element={
                <ProtectedRoute requiredPermission="Product.View">
                  <AdminProductsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="categories"
              element={
                <ProtectedRoute requiredPermission="Category.View">
                  <AdminCategoriesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="orders"
              element={
                <ProtectedRoute requiredPermission="Order.View">
                  <AdminOrdersPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
