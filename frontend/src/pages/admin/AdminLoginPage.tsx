import React, { useState } from 'react';
import { Card, Form, Input, Button, Tabs, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../features/auth/api/authApi';
import { useAuthStore } from '../../store/useAuthStore';

const { Title, Text } = Typography;

export const AdminLoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const response = await authApi.login({
        email: values.usernameOrEmail,
        username: values.usernameOrEmail,
        password: values.password,
      });

      // Save to zustand & localStorage
      setAuth(response.token, response.user, response.user.permissions || []);
      message.success('Đăng nhập Hệ thống Quản trị thành công!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      await authApi.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });

      message.success('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
      setActiveTab('login');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white text-3xl shadow-lg shadow-indigo-500/30 mb-3">
            <SafetyCertificateOutlined />
          </div>
          <Title level={2} style={{ color: '#fff', margin: 0 }}>
            ADMIN PORTAL
          </Title>

          <Text className="text-slate-400">
            Hệ thống Quản trị Sản phẩm & Đơn hàng
          </Text>
        </div>

        <Card 
          bordered={false}
          className="shadow-2xl rounded-2xl overflow-hidden backdrop-blur-md bg-white/95"
          bodyStyle={{ padding: '32px 28px' }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as 'login' | 'register')}
            centered
            items={[
              {
                key: 'login',
                label: <span className="text-base font-semibold px-4">Đăng nhập</span>,
                children: (
                  <Form
                    name="admin_login"
                    layout="vertical"
                    onFinish={handleLogin}
                    size="large"
                    className="mt-4"
                  >
                    <Form.Item
                      name="usernameOrEmail"
                      rules={[{ required: true, message: 'Vui lòng nhập Email/Tài khoản!' }]}
                    >
                      <Input
                        prefix={<UserOutlined className="text-slate-400" />}
                        placeholder="Email hoặc Tên đăng nhập"
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                      <Input.Password
                        prefix={<LockOutlined className="text-slate-400" />}
                        placeholder="Mật khẩu"
                      />
                    </Form.Item>

                    <Form.Item className="mt-6">
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        className="h-12 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg text-base shadow-md"
                      >
                        Đăng nhập Quản trị
                      </Button>
                    </Form.Item>
                  </Form>
                )
              },
              {
                key: 'register',
                label: <span className="text-base font-semibold px-4">Đăng ký Admin</span>,
                children: (
                  <Form
                    name="admin_register"
                    layout="vertical"
                    onFinish={handleRegister}
                    size="large"
                    className="mt-4"
                  >
                    <Form.Item
                      name="fullName"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                      <Input
                        prefix={<UserOutlined className="text-slate-400" />}
                        placeholder="Họ và tên"
                      />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập Email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined className="text-slate-400" />}
                        placeholder="Email"
                      />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu!' },
                        { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined className="text-slate-400" />}
                        placeholder="Mật khẩu"
                      />
                    </Form.Item>

                    <Form.Item className="mt-6">
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        className="h-12 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-lg text-base shadow-md"
                      >
                        Tạo tài khoản Quản trị
                      </Button>
                    </Form.Item>
                  </Form>
                )
              }
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;
