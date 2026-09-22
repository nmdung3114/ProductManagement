import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { useAuth } from '../../../context/AuthContext';

export const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Nếu người dùng đã đăng nhập rồi, tự động cho vào trang Dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Xử lý sau khi Đăng nhập thành công
  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {isLoginMode ? (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setIsLoginMode(false)}
          />
        ) : (
          <RegisterForm
            onSuccess={() => setIsLoginMode(true)}
            onSwitchToLogin={() => setIsLoginMode(true)}
          />
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    boxSizing: 'border-box',
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
};
