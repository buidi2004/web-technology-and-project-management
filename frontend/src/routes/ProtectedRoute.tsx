import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from '../components/PageLoader';
import { useAuth } from '../features/auth/AuthContext';

export function ProtectedRoute() {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="route-loader">
        <PageLoader label="Đang kiểm tra đăng nhập..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
