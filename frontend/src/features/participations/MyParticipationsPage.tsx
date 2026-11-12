import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Clock } from 'lucide-react';
import { DataTable, PageHead, type Column } from '@/components/blocks/shell';
import { StatCard } from '@/components/blocks/dashboard';
import { bdTokens } from '@/components/blocks/dashboard/tokens';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorNotice } from '@/components/Notice';
import { ActivityTypeBadge, ParticipationStatusBadge } from '@/components/StatusBadge';
import { getErrorMessage } from '@/lib/api';
import { formatDateTime, formatDays } from '@/lib/format';
import type { MyParticipation, Summary } from '@/lib/types';
import { participationsApi } from './participationsApi';

export function MyParticipationsPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [items, setItems] = useState<MyParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [mySummary, myParticipations] = await Promise.all([
        participationsApi.summary(),
        participationsApi.mine(),
      ]);
      setSummary(mySummary);
      setItems(myParticipations);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: Column<MyParticipation>[] = [
    {
      key: 'activity',
      header: 'Hoạt động',
      cell: (item) => (
        <div className="min-w-0">
          <Link to={`/activities/${item.activityId}`} className="font-semibold text-primary">
            {item.title}
          </Link>
          <div className="text-caption text-muted-foreground">{formatDateTime(item.startAt)}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Loại',
      cell: (item) => <ActivityTypeBadge type={item.type} />,
    },
    {
      key: 'days',
      header: 'Điểm',
      cell: (item) => formatDays(item.days),
      align: 'right',
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (item) => <ParticipationStatusBadge status={item.status} />,
    },
    {
      key: 'checkedInAt',
      header: 'Điểm danh',
      cell: (item) => formatDateTime(item.checkedInAt),
    },
    {
      key: 'verifiedAt',
      header: 'Xác nhận',
      cell: (item) => formatDateTime(item.verifiedAt),
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
        <PageHead
          title="Tiến độ của tôi"
          description="Chỉ các lượt tham gia đã được cán bộ xác nhận mới được cộng ngày."
          actions={
            <Button size="toolbar" variant="outline" onClick={() => navigate('/')}>
              Xem hoạt động
            </Button>
          }
        />

        {error && <ErrorNotice message={error} onRetry={() => void load()} />}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-[104px] w-full rounded-[14px]" />
            <Skeleton className="h-[104px] w-full rounded-[14px]" />
            <Skeleton className="h-[104px] w-full rounded-[14px]" />
          </div>
        ) : (
          <>
            {summary && (
              <section aria-label="Tổng hợp tiến độ" className="grid gap-3 sm:grid-cols-3">
                <StatCard
                  className={bdTokens}
                  label="Ngày CTXH"
                  value={summary.ctxhDays.toLocaleString('vi-VN')}
                  unit="ngày"
                  description="Đã được xác nhận"
                />
                <StatCard
                  className={bdTokens}
                  label="Ngày lao động"
                  value={summary.laoDongDays.toLocaleString('vi-VN')}
                  unit="ngày"
                  description="Đã được xác nhận"
                />
                <StatCard
                  className={bdTokens}
                  label="Hoạt động đã xác nhận"
                  value={summary.verifiedActivities}
                  description="Tính vào tiến độ"
                  highlight
                />
              </section>
            )}

            {items.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<CalendarDays />}
                  title="Bạn chưa tham gia hoạt động nào"
                  description="Đăng ký một hoạt động ở trang chủ để bắt đầu."
                  action={<Button onClick={() => navigate('/')}>Xem hoạt động</Button>}
                />
              </Card>
            ) : (
              <Card className="overflow-hidden py-0">
                <DataTable
                  label="Các lượt tham gia của tôi"
                  columns={columns}
                  rows={items}
                  getRowId={(item) => String(item.id)}
                  pageSize={10}
                  hideFooter={items.length <= 10}
                  minWidthClass="min-w-[52rem]"
                  density="normal"
                  striped
                />
              </Card>
            )}

            <p className="m-0 flex flex-wrap items-center gap-4 px-1 text-caption text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden className="size-3.5" />
                Đã đăng ký / đã điểm danh: chờ cán bộ xác nhận
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 aria-hidden className="size-3.5" />
                Đã xác nhận: được cộng vào tiến độ
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
