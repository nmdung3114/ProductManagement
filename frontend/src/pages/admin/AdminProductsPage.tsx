import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Popconfirm,
  message,
  Typography,
  Card,
  Drawer,
  Form,
  InputNumber,
  Tooltip,
  Image
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { productApi, CreateProductRequest } from '../../features/products/api/productApi';
import { categoryApi } from '../../features/categories/api/categoryApi';
import { Product, Category } from '../../types';
import Can from '../../components/common/Can';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const AdminProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>(undefined);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form] = Form.useForm();

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => productApi.getProducts(),
  });

  // Fetch categories for select
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoryApi.getCategories,
  });

  // Mutation: Create
  const createMutation = useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      message.success('Thêm sản phẩm mới thành công!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      handleCloseDrawer();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Tạo sản phẩm thất bại!');
    },
  });

  // Mutation: Update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateProductRequest }) =>
      productApi.updateProduct(id, data),
    onSuccess: () => {
      message.success('Cập nhật sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      handleCloseDrawer();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Cập nhật thất bại!');
    },
  });

  // Mutation: Delete
  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      message.success('Xoá sản phẩm thành công!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Xoá thất bại!');
    },
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      description: product.description,
    });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleSubmit = (values: CreateProductRequest) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  // Filter products locally
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory = selectedCategoryFilter
      ? p.categoryId === selectedCategoryFilter
      : true;

    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (url?: string) => (
        url ? (
          <Image
            src={url}
            alt="Product"
            width={48}
            height={48}
            className="rounded-lg object-cover border border-slate-200"
            fallback="https://placehold.co/100x100?text=No+Image"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
            <PictureOutlined />
          </div>
        )
      ),
    },
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Product) => (
        <div>
          <span className="font-bold text-slate-800 block">{name}</span>
          <span className="text-xs text-slate-400 font-mono">SKU: {record.sku}</span>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (catId: string, record: Product) => {
        const catName = record.categoryName || categories.find(c => c.id === catId)?.name || 'Chưa rõ';
        return <Tag color="blue" className="font-medium">{catName}</Tag>;
      }
    },
    {
      title: 'Giá bán (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <span className="font-bold text-indigo-600 font-mono">
          {price.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock > 0 ? `Còn ${stock} sp` : 'Hết hàng'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space size="small">
          <Can permission="Product.Update">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined className="text-indigo-600" />}
                onClick={() => handleOpenEdit(record)}
              />
            </Tooltip>
          </Can>

          <Can permission="Product.Delete">
            <Popconfirm
              title="Xoá sản phẩm này?"
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
            Quản lý Sản phẩm
          </Title>
          <Text className="text-slate-500">
            Danh sách tất cả sản phẩm, tồn kho và bảng giá
          </Text>
        </div>

        <Can permission="Product.Create">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="bg-indigo-600 hover:bg-indigo-500"
            onClick={handleOpenCreate}
          >
            Thêm sản phẩm mới
          </Button>
        </Can>
      </div>

      {/* Filter / Search Bar */}
      <Card className="shadow-sm rounded-xl">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Tìm theo Tên hoặc Mã SKU..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="large"
            className="max-w-md"
          />

          <Select
            placeholder="Lọc theo Danh mục"
            allowClear
            size="large"
            className="w-full sm:w-64"
            value={selectedCategoryFilter}
            onChange={(val) => setSelectedCategoryFilter(val)}
            options={categories.map(c => ({ label: c.name, value: c.id }))}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-sm rounded-xl" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={isLoadingProducts}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="rounded-xl overflow-hidden"
        />
      </Card>

      {/* Drawer Product Form */}
      <Drawer
        title={editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
        width={540}
        onClose={handleCloseDrawer}
        open={isDrawerOpen}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input placeholder="Ví dụ: iPhone 15 Pro Max 256GB" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="sku"
              label="Mã SKU"
              rules={[{ required: true, message: 'Vui lòng nhập mã SKU!' }]}
            >
              <Input placeholder="IP15PM-256" />
            </Form.Item>

            <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <Select
                placeholder="Chọn danh mục"
                options={categories.map(c => ({ label: c.name, value: c.id }))}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="price"
              label="Giá bán (VNĐ)"
              rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value?.replace(/\$\s?|(,*)/g, '') as any}
                placeholder="29900000"
              />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Số lượng tồn kho"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="100" />
            </Form.Item>
          </div>

          <Form.Item
            name="imageUrl"
            label="Đường dẫn Ảnh (URL)"
          >
            <Input placeholder="https://images.unsplash.com/photo-..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả sản phẩm"
          >
            <TextArea rows={4} placeholder="Nhập mô tả chi tiết về sản phẩm..." />
          </Form.Item>

          <div className="pt-4 border-t border-slate-200 text-right">
            <Space size="middle">
              <Button onClick={handleCloseDrawer}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                {editingProduct ? 'Lưu cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default AdminProductsPage;
