import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CalendarCheck, QrCode, ShieldCheck } from 'lucide-react';
import { LoginPage as KitLoginPage } from '@/components/blocks/dashboard';
import { getErrorMessage } from '@/lib/api';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(values: { username: string; password: string }) {
    setError(null);
    setBusy(true);

    try {
      await login(values.username.trim(), values.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-full">
      <KitLoginPage
        org="Trường Đại học Đồng Tháp"
        headline={
          <>
            Ngày công tác xã hội <span>minh bạch và gọn gàng</span>
          </>
        }
        description="Đăng ký hoạt động, điểm danh bằng mã QR và theo dõi số ngày được cán bộ xác nhận."
        features={[
          { icon: <CalendarCheck />, title: 'Đăng ký hoạt động', description: 'SV001 / Sv@12345' },
          { icon: <QrCode />, title: 'Điểm danh bằng QR', description: 'GV001 / Org@12345' },
          { icon: <ShieldCheck />, title: 'Xác nhận hai lớp', description: 'admin / Admin@123' },
        ]}
        footer="CTXH · Quản lý và xác thực ngày công tác xã hội / ngày lao động"
        brand={
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-primary text-emph font-bold text-primary-foreground">
                C
              </span>
              <span className="leading-tight">
                <strong className="block text-emph font-bold text-foreground">CTXH</strong>
                <small className="block text-micro text-muted-foreground">Ngày công tác xã hội</small>
              </span>
            </div>
            <Link to="/register" className="text-small font-medium text-primary hover:underline">
              Đăng ký sinh viên
            </Link>
          </div>
        }
        title="Đăng nhập"
        subtitle="Dùng mã sinh viên hoặc tài khoản được cấp"
        submitting={busy}
        error={error ?? undefined}
        ssoLabel="Đăng nhập bằng tài khoản trường"
        onSubmit={onSubmit}
        onSso={() => setError('Đăng nhập SSO chưa được cấu hình cho hệ thống này.')}
        onForgot={() =>
          setError('Vui lòng liên hệ cán bộ Đoàn - Hội để được đặt lại mật khẩu.')
        }
        onSupport={() =>
          setError('Liên hệ cán bộ Đoàn - Hội hoặc quản trị viên để được hỗ trợ.')
        }
      />
    </div>
  );
}
