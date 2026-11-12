import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { roleLabels } from '../lib/api';
import { useAuth } from '../features/auth/AuthContext';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isStaff = user?.role === 'Organizer' || user?.role === 'Admin';

  function onLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="brand" to="/">
          <span className="brand-mark">C</span>
          <span>
            <strong>CTXH</strong>
            <small>Ngày công tác xã hội</small>
          </span>
        </Link>

        <nav className="app-nav">
          <NavLink to="/" end>
            Hoạt động
          </NavLink>
          {user?.role === 'Student' && <NavLink to="/me">Tiến độ của tôi</NavLink>}
          {isStaff && <NavLink to="/activities/new">Tạo hoạt động</NavLink>}
        </nav>

        <div className="user-box">
          <div className="user-info">
            <strong>{user?.fullName}</strong>
            <span>{user ? roleLabels[user.role] : ''}</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        CTXH · Quản lý &amp; xác thực ngày công tác xã hội / ngày lao động
      </footer>
    </div>
  );
}
