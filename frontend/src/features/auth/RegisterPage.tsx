import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ErrorBanner } from '../../components/ErrorBanner';
import { Spinner } from '../../components/PageLoader';
import { getErrorMessage } from '../../lib/api';
import { useAuth } from './AuthContext';

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [studentCode, setStudentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setBusy(true);
    try {
      await register(studentCode.trim(), fullName.trim(), password);
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
        <h1>Đăng ký sinh viên</h1>
        <p className="muted">Tạo tài khoản để đăng ký và điểm danh hoạt động.</p>

        {error && <ErrorBanner message={error} />}

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span>Mã sinh viên</span>
            <input
              value={studentCode}
              onChange={(event) => setStudentCode(event.target.value)}
              placeholder="VD: SV002"
              autoCapitalize="none"
              required
            />
          </label>

          <label className="field">
            <span>Họ và tên</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nguyễn Văn B"
              required
            />
          </label>

          <label className="field">
            <span>Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ít nhất 8 ký tự"
              autoComplete="new-password"
              required
            />
          </label>

          <label className="field">
            <span>Xác nhận mật khẩu</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              required
            />
          </label>

          <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
            {busy ? <Spinner /> : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
