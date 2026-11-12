import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../lib/api';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Spinner } from '../../components/PageLoader';
import { useAuth } from './AuthContext';

const demoAccounts = [
  { code: 'SV001', password: 'Sv@12345', label: 'Sinh viên' },
  { code: 'GV001', password: 'Org@12345', label: 'Cán bộ' },
  { code: 'admin', password: 'Admin@123', label: 'Admin' },
];

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [studentCode, setStudentCode] = useState('SV001');
  const [password, setPassword] = useState('Sv@12345');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      await login(studentCode.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">CTXH</div>
        <h1>Đăng nhập</h1>
        <p className="muted">Quản lý và xác thực ngày công tác xã hội / ngày lao động.</p>

        {error && <ErrorBanner message={error} />}

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span>Mã sinh viên</span>
            <input
              value={studentCode}
              onChange={(event) => setStudentCode(event.target.value)}
              placeholder="VD: SV001"
              autoCapitalize="none"
              autoComplete="username"
              required
            />
          </label>

          <label className="field">
            <span>Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
            {busy ? <Spinner /> : 'Đăng nhập'}
          </button>
        </form>

        <div className="demo-accounts">
          <span className="muted">Tài khoản demo:</span>
          <div className="chip-row">
            {demoAccounts.map((account) => (
              <button
                key={account.code}
                type="button"
                className="chip"
                onClick={() => {
                  setStudentCode(account.code);
                  setPassword(account.password);
                }}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>

        <p className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký sinh viên</Link>
        </p>
      </div>
    </div>
  );
}
