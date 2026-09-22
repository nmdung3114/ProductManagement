import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerSchema, RegisterFormData } from '../validation/authSchema';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../../../utils/errorHandler';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setApiError(null);
      setSuccessMessage(null);
      
      // Gọi API Đăng ký từ authApi
      const result = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      setSuccessMessage(result.message || 'Đăng ký tài khoản thành công!');
      
      // Sau 1.5s tự động gọi onSuccess hoặc chuyển sang form Đăng nhập
      setTimeout(() => {
        if (onSuccess) onSuccess();
        else if (onSwitchToLogin) onSwitchToLogin();
      }, 1500);
    } catch (error) {
      setApiError(getErrorMessage(error));
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Tạo tài khoản</h2>
        <p style={styles.subtitle}>Đăng ký ngay để trải nghiệm đầy đủ tính năng.</p>
      </div>

      {/* Thông báo Thành công màu xanh */}
      {successMessage && (
        <div style={styles.alertSuccess}>
          <CheckCircle2 size={18} style={{ marginRight: 8, flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Thông báo Lỗi màu đỏ */}
      {apiError && (
        <div style={styles.alertError}>
          <AlertCircle size={18} style={{ marginRight: 8, flexShrink: 0 }} />
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
        {/* Họ và tên */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Họ và tên</label>
          <div style={styles.inputWrapper}>
            <UserIcon size={18} style={styles.inputIcon} />
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              {...register('fullName')}
              style={{
                ...styles.input,
                borderColor: errors.fullName ? '#ef4444' : '#d1d5db',
              }}
            />
          </div>
          {errors.fullName && <span style={styles.errorText}>{errors.fullName.message}</span>}
        </div>

        {/* Email */}
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

        {/* Mật khẩu */}
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

        {/* Xác nhận Mật khẩu */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Xác nhận mật khẩu</label>
          <div style={styles.inputWrapper}>
            <Lock size={18} style={styles.inputIcon} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              style={{
                ...styles.input,
                borderColor: errors.confirmPassword ? '#ef4444' : '#d1d5db',
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span style={styles.errorText}>{errors.confirmPassword.message}</span>
          )}
        </div>

        {/* Nút Đăng ký */}
        <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="spinner" style={{ marginRight: 8 }} />
              Đang đăng ký...
            </>
          ) : (
            'Đăng ký tài khoản'
          )}
        </button>
      </form>

      {/* Chuyển tới Đăng nhập */}
      {onSwitchToLogin && (
        <div style={styles.footer}>
          <span>Đã có tài khoản? </span>
          <button type="button" onClick={onSwitchToLogin} style={styles.linkBtn}>
            Đăng nhập ngay
          </button>
        </div>
      )}
    </div>
  );
};

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
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
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
    gap: '14px',
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
    backgroundColor: '#16a34a', // Màu xanh lá cho nút Đăng ký
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
