import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Typography,
  Card,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { categoryApi, CreateCategoryRequest } from '../../features/categories/api/categoryApi';
import { Category } from '../../types';
import Can from '../../components/common/Can';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const AdminCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  });

  // Mutation: Create
  const createMutation = useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: () => {
      message.success('Thêm danh mục mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Tạo danh mục thất bại!');
    },
  });

  // Mutation: Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCategoryRequest }) =>
      categoryApi.updateCategory(id, data),
    onSuccess: () => {
      message.success('Cập nhật danh mục thành công!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Cập nhật thất bại!');
    },
  });

  // Mutation: Delete
  const deleteMutation = useMutation({
    mutationFn: categoryApi.deleteCategory,
    onSuccess: () => {
      message.success('Xoá danh mục thành công!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Xoá thất bại! Có thể danh mục đang có sản phẩm.');
    },
  });

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleSubmit = (values: CreateCategoryRequest) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <AppstoreOutlined />
          </div>
          <span className="font-bold text-slate-800">{text}</span>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text?: string) => (
        <span className="text-slate-600 text-sm">
          {text || <span className="text-slate-400 italic">Chưa có mô tả</span>}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: Category) => (
        <Space size="small">
          <Can permission="Category.Update">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined className="text-indigo-600" />}
                onClick={() => handleOpenEditModal(record)}
              />
            </Tooltip>
          </Can>

          <Can permission="Category.Delete">
            <Popconfirm
              title="Xoá danh mục này?"
              description="Hành động này không thể hoàn tác!"
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="Xoá"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xoá">
                <Button type="text" danger icon={<DeleteOutlined />} />
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
            Quản lý Danh mục Sản phẩm
          </Title>
          <Text className="text-slate-500">
            Danh sách các nhóm ngành hàng sản phẩm trong hệ thống
          </Text>
        </div>

        <Can permission="Category.Create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="bg-indigo-600 hover:bg-indigo-500"
            onClick={handleOpenCreateModal}
          >
            Thêm danh mục mới
          </Button>
        </Can>
      </div>

      {/* Search */}
      <Card className="shadow-sm rounded-xl">
        <div className="flex items-center gap-4 max-w-md">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Tìm theo tên hoặc mô tả danh mục..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="large"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-sm rounded-xl" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 8 }}
          className="rounded-xl overflow-hidden"
        />
      </Card>

      {/* Modal CRUD Category */}
      <Modal
        title={editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Ví dụ: Điện thoại, Laptop, Phụ kiện..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Mô tả danh mục sản phẩm..." />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCloseModal}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategoriesPage;
