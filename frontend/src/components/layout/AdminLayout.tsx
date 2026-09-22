import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space, Typography, Tag } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ShopOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Build menu items dynamically based on permissions
  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    ...(hasPermission('Product.View') ? [{
      key: '/admin/products',
      icon: <ShoppingOutlined />,
      label: 'Sản phẩm',
    }] : []),
    ...(hasPermission('Category.View') ? [{
      key: '/admin/categories',
      icon: <AppstoreOutlined />,
      label: 'Danh mục',
    }] : []),
    ...(hasPermission('Order.View') ? [{
      key: '/admin/orders',
      icon: <ShopOutlined />,
      label: 'Đơn hàng',
    }] : []),
    ...(hasPermission('User.View') ? [{
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Người dùng',
    }] : []),
    ...(hasPermission('Role.View') ? [{
      key: '/admin/roles',
      icon: <SafetyCertificateOutlined />,
      label: 'Vai trò',
    }] : []),
  ];

  const userMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Trang chủ Shop',
      onClick: () => navigate('/'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-red-500" />,
      label: <span className="text-red-500">Đăng xuất</span>,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={250}
        className="shadow-xl"
      >
        <div className="h-16 flex items-center justify-center px-4 bg-slate-900 border-b border-slate-800 gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-indigo-500/30">
            A
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-white font-bold text-base tracking-wide truncate">
                Ant Admin Pro
              </span>
              <span className="text-slate-400 text-xs truncate">Quản trị hệ thống</span>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="mt-3 px-2 border-r-0"
        />
      </Sider>

      {/* Main Container */}
      <Layout>
        {/* Header */}
        <Header className="bg-white border-b border-slate-200 px-6 flex items-center justify-between h-16 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg"
            />
            <Text className="text-slate-500 text-sm hidden sm:inline">
              Hệ thống Quản lý Bán hàng & Phân quyền
            </Text>
          </div>

          <Space size="large">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div className="flex items-center gap-3 cursor-pointer py-1 px-3 hover:bg-slate-100 rounded-xl transition-all">
                <Avatar 
                  style={{ backgroundColor: '#4f46e5' }} 
                  icon={<UserOutlined />} 
                  size="default"
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-slate-800">
                    {user?.fullName || 'Quản trị viên'}
                  </span>
                  <div className="flex items-center gap-1">
                    {user?.roles?.map(role => (
                      <Tag key={role} color="indigo" className="text-[10px] px-1.5 py-0 m-0 border-0">
                        {role}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Page Content */}
        <Content className="m-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[calc(100vh-112px)]">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
