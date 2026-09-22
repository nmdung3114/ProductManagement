import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Spin } from 'antd';
import {
  ShoppingOutlined,
  ShopOutlined,
  UserOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { productApi } from '../../features/products/api/productApi';
import { orderApi } from '../../features/orders/api/orderApi';
import { userApi } from '../../features/users/api/userApi';
import { Order, OrderStatus } from '../../types';

const { Title, Text } = Typography;

const statusColorMap: Record<OrderStatus, string> = {
  Pending: 'orange',
  Processing: 'blue',
  Shipped: 'cyan',
  Delivered: 'green',
  Cancelled: 'red',
};

export const AdminDashboardPage: React.FC = () => {
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getProducts(),
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: orderApi.getOrders,
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getUsers,
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const recentOrders = [...orders].slice(0, 5);

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text: string) => <span className="font-mono font-bold text-indigo-600">#{text}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (text?: string, record?: Order) => text || record?.userEmail || 'Khách vãng lai',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: number) => (
        <span className="font-mono font-bold text-slate-900">
          {val?.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={statusColorMap[status] || 'default'} className="font-semibold">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  if (isLoadingProducts || isLoadingOrders || isLoadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" tip="Đang tải dữ liệu Thống kê..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <Title level={3} style={{ margin: 0 }}>
          Dashboard Quản trị
        </Title>
        <Text className="text-slate-500">
          Tổng quan chỉ số hoạt động kinh doanh và người dùng trong hệ thống
        </Text>
      </div>

      {/* Statistic Cards */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl border border-slate-200 hover:shadow-md transition-all">
            <Statistic
              title={<span className="text-slate-500 font-medium">Tổng Sản phẩm</span>}
              value={products.length}
              prefix={
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mr-3">
                  <ShoppingOutlined />
                </div>
              }
              valueStyle={{ fontWeight: 'bold', color: '#0f172a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl border border-slate-200 hover:shadow-md transition-all">
            <Statistic
              title={<span className="text-slate-500 font-medium">Tổng Đơn hàng</span>}
              value={orders.length}
              prefix={
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mr-3">
                  <ShopOutlined />
                </div>
              }
              valueStyle={{ fontWeight: 'bold', color: '#0f172a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl border border-slate-200 hover:shadow-md transition-all">
            <Statistic
              title={<span className="text-slate-500 font-medium">Người dùng hệ thống</span>}
              value={users.length}
              prefix={
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mr-3">
                  <UserOutlined />
                </div>
              }
              valueStyle={{ fontWeight: 'bold', color: '#0f172a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl border border-slate-200 hover:shadow-md transition-all">
            <Statistic
              title={<span className="text-slate-500 font-medium">Tổng Doanh thu</span>}
              value={totalRevenue}
              suffix="₫"
              prefix={
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mr-3">
                  <DollarOutlined />
                </div>
              }
              valueStyle={{ fontWeight: 'bold', color: '#4f46e5' }}
              formatter={(val) => Number(val).toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Section */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">Đơn hàng mới nhất</span>
            <Text className="text-xs text-slate-400">5 đơn gần đây</Text>
          </div>
        }
        className="shadow-sm rounded-xl"
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={recentOrders}
          rowKey="id"
          pagination={false}
          className="rounded-xl overflow-hidden"
        />
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
