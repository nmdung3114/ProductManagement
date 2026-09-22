import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield, Mail, Key } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, token, logout } = useAuth();

  return (
    <div style={styles.container}>
      {/* Header thanh trên cùng */}
      <header style={styles.header}>
        <div style={styles.brand}>Product Management App</div>
        <div style={styles.userInfoTop}>
          <span style={styles.welcomeText}>Xin chào, <strong>{user?.fullName}</strong></span>
          <button onClick={logout} style={styles.logoutBtn}>
            <LogOut size={16} style={{ marginRight: 6 }} />
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Thẻ thông tin cá nhân */}
      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🎉 Đăng nhập thành công!</h2>
          <p style={styles.cardDesc}>
            Dưới đây là thông tin tài khoản của bạn được khôi phục từ Backend C# ASP.NET Core Identity & JWT Token.
          </p>

          <div style={styles.infoList}>
            <div style={styles.infoItem}>
              <UserIcon style={styles.infoIcon} size={20} />
              <div>
                <span style={styles.infoLabel}>Họ và tên:</span>
                <span style={styles.infoValue}>{user?.fullName}</span>
              </div>
            </div>

            <div style={styles.infoItem}>
              <Mail style={styles.infoIcon} size={20} />
              <div>
                <span style={styles.infoLabel}>Email:</span>
                <span style={styles.infoValue}>{user?.email}</span>
              </div>
            </div>

            <div style={styles.infoItem}>
              <Shield style={styles.infoIcon} size={20} />
              <div>
                <span style={styles.infoLabel}>Vai trò (Roles):</span>
                <span style={styles.roleBadge}>{user?.roles.join(', ') || 'Customer'}</span>
              </div>
            </div>

            <div style={styles.infoItem}>
              <Key style={styles.infoIcon} size={20} />
              <div>
                <span style={styles.infoLabel}>User ID (Guid):</span>
                <code style={styles.codeValue}>{user?.id}</code>
              </div>
            </div>
          </div>

          <div style={styles.tokenBox}>
            <span style={styles.infoLabel}>JWT Access Token (Ví dụ 30 ký tự đầu):</span>
            <code style={styles.tokenCode}>{token?.substring(0, 35)}...</code>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  brand: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#2563eb',
  },
  userInfoTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  welcomeText: {
    fontSize: '14px',
    color: '#374151',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 14px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
  },
  main: {
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    width: '100%',
    maxWidth: '560px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '22px',
    color: '#16a34a',
  },
  cardDesc: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  infoIcon: {
    color: '#2563eb',
  },
  infoLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '2px',
  },
  infoValue: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#111827',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 600,
  },
  codeValue: {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#4b5563',
  },
  tokenBox: {
    padding: '12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    marginTop: '16px',
  },
  tokenCode: {
    display: 'block',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#6b7280',
    wordBreak: 'break-all',
    marginTop: '4px',
  },
};
