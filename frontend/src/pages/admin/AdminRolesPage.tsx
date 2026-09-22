import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Row,
  Col,
  List,
  Checkbox,
  Button,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Spin,
  Space,
  Badge
} from 'antd';
import {
  SafetyCertificateOutlined,
  PlusOutlined,
  SaveOutlined,
  DeleteOutlined,
  LockOutlined
} from '@ant-design/icons';
import { roleApi } from '../../features/roles/api/roleApi';
import { Role, PermissionGroup } from '../../types';
import Can from '../../components/common/Can';

const { Title, Text } = Typography;
const { TextArea } = Input;

const getPermissionIds = (role?: Role): string[] => {
  if (!role || !role.permissions) return [];
  return role.permissions.map((p: any) => (typeof p === 'string' ? p : p.id));
};

export const AdminRolesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Query roles
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: roleApi.getRoles,
  });

  // Query permissions grouped
  const { data: permissionGroups = [], isLoading: isLoadingPermissions } = useQuery<PermissionGroup[]>({
    queryKey: ['permissions'],
    queryFn: roleApi.getPermissions,
  });

  // Select initial role when data arrives
  React.useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
      setSelectedPermissions(getPermissionIds(roles[0]));
    }
  }, [roles]);

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  // Sync selected permissions when role changes
  const handleSelectRole = (role: Role) => {
    setSelectedRoleId(role.id);
    setSelectedPermissions(getPermissionIds(role));
  };

  // Mutation: Update permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
      roleApi.updateRolePermissions(roleId, permissions),
    onSuccess: () => {
      message.success('Cập nhật quyền cho Vai trò thành công!');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Cập nhật thất bại!');
    },
  });

  // Mutation: Create role
  const createRoleMutation = useMutation({
    mutationFn: roleApi.createRole,
    onSuccess: (newRole) => {
      message.success('Tạo vai trò mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsModalOpen(false);
      form.resetFields();
      setSelectedRoleId(newRole.id);
      setSelectedPermissions(getPermissionIds(newRole));
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Tạo vai trò thất bại!');
    },
  });

  // Mutation: Delete role
  const deleteRoleMutation = useMutation({
    mutationFn: roleApi.deleteRole,
    onSuccess: () => {
      message.success('Xoá vai trò thành công!');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setSelectedRoleId(null);
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Xoá thất bại!');
    },
  });

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };

  const handleSavePermissions = () => {
    if (!selectedRoleId) return;
    updatePermissionsMutation.mutate({
      roleId: selectedRoleId,
      permissions: selectedPermissions,
    });
  };

  const handleCreateRoleFinish = (values: any) => {
    createRoleMutation.mutate(values);
  };

  if (isLoadingRoles || isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" tip="Đang tải danh sách Vai trò & Phân quyền..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Quản lý Vai trò & Phân quyền
          </Title>
          <Text className="text-slate-500">
            Thiết lập vai trò hệ thống và gán nhóm quyền hạn truy cập cho từng vai trò
          </Text>
        </div>

        <Can permission="Role.Create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="bg-indigo-600 hover:bg-indigo-500"
            onClick={() => setIsModalOpen(true)}
          >
            Tạo vai trò mới
          </Button>
        </Can>
      </div>

      {/* 2 Column Layout */}
      <Row gutter={[24, 24]}>
        {/* Left Column: Role List */}
        <Col xs={24} md={8} lg={7}>
          <Card
            title={<span className="font-bold text-slate-800">Danh sách Vai trò</span>}
            bordered
            className="shadow-sm rounded-xl"
            bodyStyle={{ padding: 0 }}
          >
            <List
              itemLayout="horizontal"
              dataSource={roles}
              renderItem={(role) => {
                const isSelected = role.id === selectedRoleId;
                return (
                  <List.Item
                    onClick={() => handleSelectRole(role)}
                    className={`cursor-pointer px-4 py-3.5 transition-all border-b border-slate-100 hover:bg-indigo-50/50 ${
                      isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-600 font-semibold' : ''
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <SafetyCertificateOutlined />
                        </div>
                        <div>
                          <div className="text-slate-900 text-sm font-medium flex items-center gap-2">
                            {role.name}
                            {role.isSystemRole && (
                              <Tag color="gold" icon={<LockOutlined />} className="text-[10px] m-0 border-0">
                                System
                              </Tag>
                            )}
                          </div>
                          {role.description && (
                            <Text className="text-slate-400 text-xs truncate max-w-[150px] block">
                              {role.description}
                            </Text>
                          )}
                        </div>
                      </div>

                      <Badge 
                        count={role.permissions?.length || 0} 
                        overflowCount={99} 
                        style={{ backgroundColor: isSelected ? '#4f46e5' : '#94a3b8' }} 
                      />
                    </div>
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        {/* Right Column: Permission Checkboxes */}
        <Col xs={24} md={16} lg={17}>
          {selectedRole ? (
            <Card
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Title level={4} style={{ margin: 0 }}>
                      Phân quyền: <span className="text-indigo-600">{selectedRole.name}</span>
                    </Title>
                    {selectedRole.isSystemRole && (
                      <Tag color="orange" className="border-0">
                        Vai trò hệ thống mặc định
                      </Tag>
                    )}
                  </div>

                  <Space>
                    {!selectedRole.isSystemRole && (
                      <Can permission="Role.Delete">
                        <Popconfirm
                          title="Xoá vai trò này?"
                          description="Hành động này không thể hoàn tác!"
                          onConfirm={() => deleteRoleMutation.mutate(selectedRole.id)}
                          okText="Xoá"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true, loading: deleteRoleMutation.isPending }}
                        >
                          <Button danger icon={<DeleteOutlined />}>
                            Xoá vai trò
                          </Button>
                        </Popconfirm>
                      </Can>
                    )}

                    <Can permission="Role.Update">
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={updatePermissionsMutation.isPending}
                        onClick={handleSavePermissions}
                        className="bg-indigo-600 hover:bg-indigo-500"
                      >
                        Lưu thay đổi quyền
                      </Button>
                    </Can>
                  </Space>
                </div>
              }
              className="shadow-sm rounded-xl"
            >
              <div className="space-y-6">
                {permissionGroups.map((group) => (
                  <div key={group.groupName} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-800 text-base flex items-center gap-2">
                        Nhóm quyền: {group.groupName}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({group.permissions.filter(p => selectedPermissions.includes(p.id)).length} / {group.permissions.length} được chọn)
                      </span>
                    </div>

                    <Row gutter={[16, 12]}>
                      {group.permissions.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.id);
                        return (
                          <Col xs={24} sm={12} key={perm.id}>
                            <div className={`p-3 rounded-lg border transition-all ${
                              isChecked ? 'bg-indigo-50/70 border-indigo-200' : 'bg-white border-slate-200'
                            }`}>
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) => handlePermissionToggle(perm.id, e.target.checked)}
                                className="font-medium text-slate-800"
                              >
                                <span className="font-semibold text-slate-900">{perm.name}</span>
                                {perm.description && (
                                  <div className="text-slate-500 text-xs mt-0.5 font-normal">
                                    {perm.description}
                                  </div>
                                )}
                              </Checkbox>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <Text className="text-slate-400">Vui lòng chọn một vai trò bên trái để xem và phân quyền.</Text>
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal Create Role */}
      <Modal
        title="Tạo vai trò mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRoleFinish}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Tên vai trò"
            rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}
          >
            <Input placeholder="Ví dụ: Manager, Staff, ContentEditor..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Mô tả chức năng của vai trò này..." />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createRoleMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                Tạo mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminRolesPage;
