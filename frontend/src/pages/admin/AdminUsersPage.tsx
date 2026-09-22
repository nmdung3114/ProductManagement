import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Typography,
  Card,
  Badge,
  Tooltip
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  KeyOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { userApi, CreateUserRequest } from '../../features/users/api/userApi';
import { roleApi } from '../../features/roles/api/roleApi';
import { User, Role } from '../../types';
import Can from '../../components/common/Can';

const { Title, Text } = Typography;

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [createForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: userApi.getUsers,
  });

  // Fetch roles for selection
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: roleApi.getRoles,
  });

  // Mutation: Create user
  const createUserMutation = useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      message.success('Tạo người dùng thành công!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateModalOpen(false);
      createForm.resetFields();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Tạo người dùng thất bại!');
    },
  });

  // Mutation: Update user roles
  const updateRolesMutation = useMutation({
    mutationFn: ({ userId, roleNames }: { userId: string; roleNames: string[] }) =>
      userApi.updateUserRoles(userId, roleNames),
    onSuccess: () => {
      message.success('Cập nhật vai trò người dùng thành công!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Cập nhật thất bại!');
    },
  });

  // Mutation: Toggle status (Lock / Unlock)
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isBlocked }: { userId: string; isBlocked: boolean }) =>
      userApi.toggleUserStatus(userId, isBlocked),
    onSuccess: (_, variables) => {
      message.success(variables.isBlocked ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Thao tác thất bại!');
    },
  });

  // Mutation: Reset password
  const resetPasswordMutation = useMutation({
    mutationFn: userApi.resetUserPassword,
    onSuccess: (data) => {
      Modal.info({
        title: 'Đặt lại mật khẩu thành công',
        content: (
          <div>
            <p>{data.message}</p>
            {data.newPassword && (
              <p>Mật khẩu mới: <strong className="text-indigo-600 font-mono text-base">{data.newPassword}</strong></p>
            )}
          </div>
        )
      });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Đặt lại mật khẩu thất bại!');
    },
  });

  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user);
    roleForm.setFieldsValue({ roles: user.roles || [] });
    setIsRoleModalOpen(true);
  };

  const handleSaveRoles = (values: { roles: string[] }) => {
    if (!selectedUser) return;
    updateRolesMutation.mutate({
      userId: selectedUser.id,
      roleNames: values.roles,
    });
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: User) => (
        <div>
          <span className="font-bold text-slate-800 block">{text}</span>
          <span className="text-xs text-slate-400 font-mono">ID: {record.id.slice(0, 8)}...</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <span className="font-mono text-slate-700">{email}</span>,
    },
    {
      title: 'Vai trò (Roles)',
      dataIndex: 'roles',
      key: 'roles',
      render: (userRoles: string[]) => (
        <Space wrap>
          {userRoles?.length > 0 ? (
            userRoles.map(role => (
              <Tag color={role === 'Admin' ? 'magenta' : 'blue'} key={role} className="font-semibold">
                {role}
              </Tag>
            ))
          ) : (
            <Tag color="default">Chưa gán</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isBlocked',
      key: 'isBlocked',
      render: (isBlocked: boolean) => (
        <Badge
          status={isBlocked ? 'error' : 'success'}
          text={isBlocked ? 'Đã khóa' : 'Hoạt động'}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size="middle">
          {/* Change Role Button */}
          <Can permission="User.ManageRole">
            <Tooltip title="Đổi vai trò">
              <Button
                type="text"
                icon={<EditOutlined className="text-indigo-600" />}
                onClick={() => handleOpenRoleModal(record)}
              />
            </Tooltip>
          </Can>

          {/* Reset Password */}
          <Can permission="User.ResetPassword">
            <Tooltip title="Reset mật khẩu">
              <Popconfirm
                title="Đặt lại mật khẩu cho người dùng này?"
                onConfirm={() => resetPasswordMutation.mutate(record.id)}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button
                  type="text"
                  icon={<KeyOutlined className="text-amber-600" />}
                />
              </Popconfirm>
            </Tooltip>
          </Can>

          {/* Toggle Lock/Unlock */}
          <Can permission="User.ManageStatus">
            <Popconfirm
              title={record.isBlocked ? "Mở khóa tài khoản này?" : "Khóa tài khoản này?"}
              onConfirm={() => toggleStatusMutation.mutate({ userId: record.id, isBlocked: !record.isBlocked })}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Tooltip title={record.isBlocked ? "Mở khóa" : "Khóa tài khoản"}>
                <Button
                  type="text"
                  danger={!record.isBlocked}
                  icon={record.isBlocked ? <UnlockOutlined className="text-emerald-600" /> : <LockOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </Can>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Người dùng
          </Title>
          <Text className="text-slate-500">
            Danh sách tài khoản người dùng, phân vai trò và quản lý trạng thái khóa
          </Text>
        </div>

        <Can permission="User.ManageRole">
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            size="large"
            className="bg-indigo-600 hover:bg-indigo-500"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo người dùng mới
          </Button>
        </Can>
      </div>

      {/* Filter / Search Bar */}
      <Card className="shadow-sm rounded-xl">
        <div className="flex items-center gap-4 max-w-md">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Tìm theo Tên hoặc Email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="large"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm rounded-xl" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={isLoadingUsers}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="rounded-xl overflow-hidden"
        />
      </Card>

      {/* Modal: Create User */}
      <Modal
        title="Tạo người dùng mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={(values) => createUserMutation.mutate(values as CreateUserRequest)}
          className="mt-4"
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input placeholder="Nguyen Van A" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Tối thiểu 6 ký tự!' }
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item
            name="roles"
            label="Gán vai trò"
          >
            <Select
              mode="multiple"
              placeholder="Chọn vai trò..."
              options={roles.map(r => ({ label: r.name, value: r.name }))}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createUserMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                Tạo người dùng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Change Role */}
      <Modal
        title={`Đổi vai trò người dùng: ${selectedUser?.fullName}`}
        open={isRoleModalOpen}
        onCancel={() => setIsRoleModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={handleSaveRoles}
          className="mt-4"
        >
          <Form.Item
            name="roles"
            label="Danh sách vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 vai trò!' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn vai trò..."
              options={roles.map(r => ({ label: r.name, value: r.name }))}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsRoleModalOpen(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateRolesMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                Lưu vai trò
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
