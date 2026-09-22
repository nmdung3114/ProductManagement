import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Tag,
  Select,
  Drawer,
  message,
  Typography,
  Card,
  Descriptions,
  Divider,
  List,
  Avatar
} from 'antd';
import {
  EyeOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { orderApi } from '../../features/orders/api/orderApi';
import { Order, OrderStatus } from '../../types';
import Can from '../../components/common/Can';

const { Title, Text } = Typography;

const statusOptions: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const statusColorMap: Record<OrderStatus, string> = {
  Pending: 'orange',
  Processing: 'blue',
  Shipped: 'cyan',
  Delivered: 'green',
  Cancelled: 'red',
};

export const AdminOrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: orderApi.getOrders,
  });

  // Mutation: Update Order Status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderApi.updateOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      message.success('Cập nhật trạng thái đơn hàng thành công!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      if (selectedOrder && selectedOrder.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      }
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Cập nhật trạng thái thất bại!');
    },
  });

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const columns = [
    {
      title: 'Mã Đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (code: string, record: Order) => (
        <a onClick={() => handleOpenDetail(record)} className="font-mono font-bold text-indigo-600">
          #{code}
        </a>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (name?: string, record?: Order) => (
        <div>
          <span className="font-bold text-slate-800 block">{name || 'Khách vãng lai'}</span>
          <span className="text-xs text-slate-400 font-mono">{record?.userEmail}</span>
        </div>
      ),
    },
    {
      title: 'Tổng thanh toán',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (val: number) => (
        <span className="font-mono font-bold text-slate-900 text-base">
          {val?.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus, record: Order) => (
        <Can
          permission="Order.UpdateStatus"
          fallback={
            <Tag color={statusColorMap[status]} className="font-semibold px-2.5 py-1">
              {status}
            </Tag>
          }
        >
          <Select
            value={status}
            onChange={(newStatus) => updateStatusMutation.mutate({ id: record.id, status: newStatus })}
            className="w-36"
            size="small"
            options={statusOptions.map(st => ({
              label: <Tag color={statusColorMap[st]} className="m-0">{st}</Tag>,
              value: st
            }))}
          />
        </Can>
      ),
    },
    {
      title: 'Ngày đặt hàng',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Button
          type="text"
          icon={<EyeOutlined className="text-indigo-600" />}
          onClick={() => handleOpenDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <Title level={3} style={{ margin: 0 }}>
          Quản lý Đơn hàng
        </Title>
        <Text className="text-slate-500">
          Danh sách tất cả đơn hàng từ khách hàng, xử lý giao nhận và cập nhật trạng thái
        </Text>
      </div>

      {/* Orders Table */}
      <Card className="shadow-sm rounded-xl" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="rounded-xl overflow-hidden"
        />
      </Card>

      {/* Order Detail Drawer */}
      <Drawer
        title={`Chi tiết Đơn hàng #${selectedOrder?.orderCode}`}
        width={560}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        destroyOnClose
      >
        {selectedOrder && (
          <div className="space-y-6">
            <Descriptions title="Thông tin Đơn hàng" bordered column={1} size="small">
              <Descriptions.Item label="Mã Đơn">
                <span className="font-mono font-bold text-indigo-600">#{selectedOrder.orderCode}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.userFullName || 'N/A'} ({selectedOrder.userEmail})
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng">
                {selectedOrder.shippingAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                <Tag color="blue">{selectedOrder.paymentMethod}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusColorMap[selectedOrder.status]} className="font-semibold">
                  {selectedOrder.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian tạo">
                {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <Title level={5} className="mb-3">Danh sách Sản phẩm trong đơn</Title>
              <List
                itemLayout="horizontal"
                dataSource={selectedOrder.items || []}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          shape="square"
                          size={48}
                          src={item.productImage}
                          icon={<ShopOutlined />}
                        />
                      }
                      title={<span className="font-semibold text-slate-800">{item.productName}</span>}
                      description={
                        <div className="text-xs text-slate-500">
                          {item.price.toLocaleString('vi-VN')} ₫ × {item.quantity}
                        </div>
                      }
                    />
                    <div className="font-mono font-bold text-slate-900">
                      {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                    </div>
                  </List.Item>
                )}
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-700">Tổng thanh toán:</span>
              <span className="font-mono text-xl font-extrabold text-indigo-600">
                {selectedOrder.totalAmount?.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminOrdersPage;
