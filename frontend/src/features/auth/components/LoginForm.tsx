import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { loginSchema, LoginFormData } from '../validation/authSchema';
import { useAuth } from '../../../context/AuthContext';
import { getErrorMessage } from '../../../utils/errorHandler';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Khởi tạo React Hook Form kết nối với Zod Schema
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  // Xử lý khi Form Submit
  const onSubmit = async (data: LoginFormData) => {
    try {
      setApiError(null);
      await login(data); // Gọi hàm login từ AuthContext
      if (onSuccess) onSuccess();
    } catch (error) {
      // Bóc tách lỗi từ API và hiển thị
      setApiError(getErrorMessage(error));
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Đăng nhập</h2>
        <p style={styles.subtitle}>Chào mừng bạn quay trở lại! Vui lòng nhập thông tin.</p>
      </div>

      {/* Hộp báo lỗi chung từ Backend nếu có */}
      {apiError && (
        <div style={styles.alertError}>
          <AlertCircle size={18} style={{ marginRight: 8, flexShrink: 0 }} />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
        {/* Trường Email */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Địa chỉ Email</label>
          <div style={styles.inputWrapper}>
            <Mail size={18} style={styles.inputIcon} />
            <input
              type="email"
              placeholder="example@domain.com"
              {...register('email')}
              style={{
                ...styles.input,
                borderColor: errors.email ? '#ef4444' : '#d1d5db',
              }}
            />
          </div>
          {errors.email && <span style={styles.errorText}>{errors.email.message}</span>}
        </div>

        {/* Trường Mật khẩu */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Mật khẩu</label>
          <div style={styles.inputWrapper}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              style={{
                ...styles.input,
                borderColor: errors.password ? '#ef4444' : '#d1d5db',
              }}
            />
            {/* Nút Ẩn/Hiện Mật khẩu */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span style={styles.errorText}>{errors.password.message}</span>}
        </div>

        {/* Nút Đăng nhập */}
        <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="spinner" style={{ marginRight: 8 }} />
              Đang xử lý...
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      {/* Chuyển hướng tới trang Đăng ký */}
      {onSwitchToRegister && (
        <div style={styles.footer}>
          <span>Chưa có tài khoản? </span>
          <button type="button" onClick={onSwitchToRegister} style={styles.linkBtn}>
            Tạo tài khoản mới
          </button>
        </div>
      )}
    </div>
  );
};

// Inline CSS Styles đẹp mắt chuyên nghiệp
const styles: Record<string, React.CSSProperties> = {
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 700,
    color: '#111827',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#9ca3af',
  },
  input: {
    width: '100%',
    padding: '10px 40px 10px 40px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  errorText: {
    fontSize: '12px',
    color: '#ef4444',
  },
  submitBtn: {
    marginTop: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background-color 0.2s',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280',
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
  },
};
