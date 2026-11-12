import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export function ProtectedRoute() {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div
        className="bg-page grid h-full place-items-center text-body text-muted-foreground"
        role="status"
      >
        <span className="flex items-center gap-2">
          <Loader2 aria-hidden className="size-4 animate-spin text-primary" />
          Đang kiểm tra đăng nhập...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
