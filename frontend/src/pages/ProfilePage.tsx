import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IdCard, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { PageHead } from '@/components/blocks/shell';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/AuthContext';
import { roleLabels } from '@/lib/api';

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5">
      <span aria-hidden className="mt-0.5 text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-micro font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </div>
        <div className="truncate text-body font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = user.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <PageHead
          leading={
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Quay lại"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft />
            </Button>
          }
          title="Thông tin cá nhân"
          description="Thông tin do nhà trường cấp, liên hệ cán bộ Đoàn - Hội nếu cần điều chỉnh."
        />

        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <Avatar className="size-14">
              <AvatarFallback className="text-lead font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="truncate text-title">{user.fullName}</CardTitle>
              <p className="m-0 mt-0.5 text-body text-muted-foreground">
                {roleLabels[user.role]}
              </p>
            </div>
            <Badge variant="info" className="ml-auto">
              {user.studentCode}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            <InfoRow icon={<IdCard />} label="Mã tài khoản" value={user.studentCode} />
            <InfoRow icon={<UserRound />} label="Họ và tên" value={user.fullName} />
            <InfoRow icon={<ShieldCheck />} label="Vai trò" value={roleLabels[user.role]} />
            <InfoRow icon={<Mail />} label="Hỗ trợ" value="Liên hệ cán bộ Đoàn - Hội" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
