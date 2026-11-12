import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, CalendarClock, MapPin, Plus } from 'lucide-react';
import { PageHead } from '@/components/blocks/shell';
import { StatCard } from '@/components/blocks/dashboard';
import { bdTokens } from '@/components/blocks/dashboard/tokens';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorNotice, SuccessNotice } from '@/components/Notice';
import {
  ActivityPhaseBadge,
  ActivityTypeBadge,
  ParticipationStatusBadge,
} from '@/components/StatusBadge';
import { getErrorMessage } from '@/lib/api';
import {
  activityPhaseLabels,
  formatDateTime,
  formatDays,
  getActivityPhase,
} from '@/lib/format';
import type { Activity, MyParticipation, Summary } from '@/lib/types';
import { useAuth } from '../auth/AuthContext';
import { participationsApi } from '../participations/participationsApi';
import { activitiesApi } from './activitiesApi';

export function ActivitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.role === 'Student';

  const [activities, setActivities] = useState<Activity[]>([]);
  const [mine, setMine] = useState<MyParticipation[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [activityList, myParticipations, mySummary] = await Promise.all([
        activitiesApi.list(),
        isStudent ? participationsApi.mine() : Promise.resolve<MyParticipation[]>([]),
        isStudent ? participationsApi.summary() : Promise.resolve<Summary | null>(null),
      ]);

      setActivities(activityList);
      setMine(myParticipations);
      setSummary(mySummary);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [isStudent]);

  useEffect(() => {
    void load();
  }, [load]);

  const mineByActivity = useMemo(
    () => new Map(mine.map((item) => [item.activityId, item])),
    [mine],
  );

  async function onRegister(activityId: number) {
    setBusyId(activityId);
    setError(null);
    setNotice(null);

    try {
      await activitiesApi.register(activityId);
      setNotice('Đăng ký hoạt động thành công.');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  const isStaff = user?.role === 'Organizer' || user?.role === 'Admin';

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
        <PageHead
          title={`Xin chào, ${user?.fullName ?? 'bạn'}`}
          description="Danh sách hoạt động công tác xã hội và ngày lao động."
          actions={
            isStaff && (
              <Button size="toolbar" onClick={() => navigate('/activities/new')}>
                <Plus />
                Tạo hoạt động
              </Button>
            )
          }
        />

        {isStudent && summary && (
          <section aria-label="Tiến độ của tôi" className="grid gap-3 sm:grid-cols-3">
            <StatCard
              className={bdTokens}
              label="Ngày CTXH"
              value={summary.ctxhDays.toLocaleString('vi-VN')}
              unit="ngày"
              description="Đã được xác nhận"
              onClick={() => navigate('/me')}
            />
            <StatCard
              className={bdTokens}
              label="Ngày lao động"
              value={summary.laoDongDays.toLocaleString('vi-VN')}
              unit="ngày"
              description="Đã được xác nhận"
              onClick={() => navigate('/me')}
            />
            <StatCard
              className={bdTokens}
              label="Hoạt động đã xác nhận"
              value={summary.verifiedActivities}
              description="Tính vào tiến độ"
              highlight
              onClick={() => navigate('/me')}
            />
          </section>
        )}

        {notice && <SuccessNotice message={notice} />}
        {error && <ErrorNotice message={error} onRetry={() => void load()} />}

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3].map((index) => (
              <Card key={index}>
                <CardHeader className="gap-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <Card>
            <EmptyState
              title="Chưa có hoạt động nào"
              description="Cán bộ Đoàn - Hội có thể tạo hoạt động mới để sinh viên đăng ký."
              action={
                isStaff ? (
                  <Button onClick={() => navigate('/activities/new')}>
                    <Plus />
                    Tạo hoạt động
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {activities.map((activity) => {
              const phase = getActivityPhase(activity.startAt, activity.endAt);
              const myParticipation = mineByActivity.get(activity.id);

              return (
                <Card key={activity.id} className="flex flex-col">
                  <CardHeader className="gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <ActivityTypeBadge type={activity.type} />
                      <ActivityPhaseBadge phase={phase} />
                    </div>
                    <CardTitle className="text-title leading-snug">
                      <Link
                        to={`/activities/${activity.id}`}
                        className="text-foreground hover:text-primary"
                      >
                        {activity.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <dl className="grid gap-2 text-body">
                      <div className="flex items-start gap-2">
                        <MapPin aria-hidden className="mt-0.5 size-4 flex-none text-muted-foreground" />
                        <div className="min-w-0">
                          <dt className="sr-only">Địa điểm</dt>
                          <dd className="truncate text-foreground">{activity.location}</dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CalendarClock aria-hidden className="mt-0.5 size-4 flex-none text-muted-foreground" />
                        <div className="min-w-0">
                          <dt className="sr-only">Thời gian</dt>
                          <dd className="text-muted-foreground">
                            {formatDateTime(activity.startAt)} → {formatDateTime(activity.endAt)}
                          </dd>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Award aria-hidden className="mt-0.5 size-4 flex-none text-muted-foreground" />
                        <div>
                          <dt className="sr-only">Điểm cộng</dt>
                          <dd className="text-muted-foreground">{formatDays(activity.days)}</dd>
                        </div>
                      </div>
                    </dl>
                  </CardContent>

                  <CardFooter className="mt-auto flex-wrap justify-between gap-2 border-t pt-3">
                    {myParticipation ? (
                      <ParticipationStatusBadge status={myParticipation.status} />
                    ) : isStudent ? (
                      <Button
                        size="sm"
                        disabled={busyId === activity.id || phase === 'DaKetThuc'}
                        onClick={() => void onRegister(activity.id)}
                      >
                        {busyId === activity.id ? 'Đang đăng ký...' : 'Đăng ký'}
                      </Button>
                    ) : (
                      <span className="text-small text-muted-foreground">
                        {activityPhaseLabels[phase]}
                      </span>
                    )}

                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/activities/${activity.id}`}>Chi tiết</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
