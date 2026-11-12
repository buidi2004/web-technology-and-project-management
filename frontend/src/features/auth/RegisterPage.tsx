import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorNotice } from '@/components/Notice';
import { getErrorMessage } from '@/lib/api';
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
    <div className="bg-page flex min-h-full items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-1">
          <div className="mb-2 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-emph font-bold text-primary-foreground">
              C
            </span>
            <span className="leading-tight">
              <strong className="block text-emph font-bold text-foreground">CTXH</strong>
              <small className="block text-micro text-muted-foreground">Ngày công tác xã hội</small>
            </span>
          </div>
          <CardTitle className="text-heading">Đăng ký sinh viên</CardTitle>
          <CardDescription>
            Tạo tài khoản để đăng ký hoạt động và điểm danh tại địa điểm.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4" noValidate>
            {error && <ErrorNotice message={error} />}

            <div className="grid gap-1.5">
              <Label htmlFor="register-code">Mã sinh viên</Label>
              <Input
                id="register-code"
                value={studentCode}
                onChange={(event) => setStudentCode(event.target.value)}
                placeholder="VD: SV002"
                autoCapitalize="none"
                autoComplete="username"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="register-name">Họ và tên</Label>
              <Input
                id="register-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nguyễn Văn B"
                autoComplete="name"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="register-password">Mật khẩu</Label>
              <Input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ít nhất 8 ký tự"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="register-confirm">Xác nhận mật khẩu</Label>
              <Input
                id="register-confirm"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                required
              />
            </div>

            <Button type="submit" size="lg" className="mt-1 w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {busy ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-body text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link to="/login" className="ml-1 font-medium text-primary hover:underline">
            Đăng nhập
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
