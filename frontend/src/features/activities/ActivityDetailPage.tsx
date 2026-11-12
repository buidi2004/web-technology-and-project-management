import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, X } from 'lucide-react';
import { DataTable, PageHead, type Column } from '@/components/blocks/shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorNotice, SuccessNotice } from '@/components/Notice';
import {
  ActivityPhaseBadge,
  ActivityTypeBadge,
  ParticipationStatusBadge,
} from '@/components/StatusBadge';
import { getErrorMessage } from '@/lib/api';
import { formatDateTime, formatDays, getActivityPhase } from '@/lib/format';
import { parseQrPayload } from '@/lib/qr';
import type { Activity, ActivityParticipation, MyParticipation } from '@/lib/types';
import { useAuth } from '../auth/AuthContext';
import { participationsApi } from '../participations/participationsApi';
import { activitiesApi } from './activitiesApi';

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-micro font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-body text-foreground">{value}</dd>
    </div>
  );
}

export function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const activityId = Number(id);
  const { user } = useAuth();
  const isStaff = user?.role === 'Organizer' || user?.role === 'Admin';

  const [activity, setActivity] = useState<Activity | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ActivityParticipation[]>([]);
  const [mine, setMine] = useState<MyParticipation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [checkInCode, setCheckInCode] = useState('');

  const load = useCallback(async () => {
    if (!Number.isInteger(activityId) || activityId <= 0) {
      setError('Mã hoạt động không hợp lệ');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const detail = await activitiesApi.get(activityId);

      const [qrResult, participantList, myParticipations] = await Promise.all([
        isStaff ? activitiesApi.qr(activityId) : Promise.resolve(null),
        isStaff
          ? activitiesApi.participations(activityId)
          : Promise.resolve<ActivityParticipation[]>([]),
        isStaff ? Promise.resolve<MyParticipation[]>([]) : participationsApi.mine(),
      ]);

      setActivity(detail);
      setQr(qrResult?.qr ?? null);
      setParticipants(participantList);
      setMine(myParticipations.find((item) => item.activityId === activityId) ?? null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [activityId, isStaff]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onRegister() {
    setError(null);
    setNotice(null);

    try {
      await activitiesApi.register(activityId);
      setNotice('Đăng ký hoạt động thành công. Bạn có thể điểm danh khi đến thời gian.');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const parsed = parseQrPayload(checkInCode);
    const code = parsed?.code ?? checkInCode.trim();

    if (parsed && parsed.activityId !== activityId) {
      setError('Mã QR này thuộc về hoạt động khác');
      return;
    }

    if (!code) {
      setError('Nhập mã QR hoặc mã điểm danh');
      return;
    }

    try {
      await activitiesApi.checkIn(activityId, code);
      setCheckInCode('');
      setNotice('Điểm danh thành công. Chờ cán bộ xác nhận.');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onVerify(participationId: number, approve: boolean) {
    setBusyId(participationId);
    setError(null);
    setNotice(null);

    try {
      await participationsApi.verify(participationId, approve);
      setNotice(approve ? 'Đã xác nhận lượt tham gia.' : 'Đã từ chối lượt tham gia.');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function copyQr() {
    if (!qr) return;
    try {
      await navigator.clipboard.writeText(qr);
      setNotice('Đã sao chép nội dung QR.');
    } catch {
      setError('Không thể sao chép. Hãy chọn và sao chép mã bên dưới.');
    }
  }

  const backButton = (
    <Button size="icon-sm" variant="ghost" asChild>
      <Link to="/" aria-label="Về danh sách hoạt động">
        <ArrowLeft />
      </Link>
    </Button>
  );

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-3 sm:p-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
          <PageHead leading={backButton} title="Đang tải hoạt động..." />
          <Card>
            <CardContent className="grid gap-3 py-4">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="h-full overflow-y-auto p-3 sm:p-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
          <PageHead leading={backButton} title="Không tìm thấy hoạt động" />
          <ErrorNotice message={error ?? 'Không tìm thấy hoạt động'} onRetry={() => void load()} />
        </div>
      </div>
    );
  }

  const phase = getActivityPhase(activity.startAt, activity.endAt);

  const columns: Column<ActivityParticipation>[] = [
    {
      key: 'student',
      header: 'Sinh viên',
      cell: (participation) => (
        <div className="min-w-0">
          <span className="font-semibold text-foreground">{participation.fullName}</span>
          <span className="text-muted-foreground"> · {participation.studentCode}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      cell: (participation) => <ParticipationStatusBadge status={participation.status} />,
    },
    {
      key: 'checkedInAt',
      header: 'Điểm danh',
      cell: (participation) => formatDateTime(participation.checkedInAt),
    },
    {
      key: '__actions',
      header: <span className="sr-only">Thao tác</span>,
      align: 'right',
      cell: (participation) =>
        participation.status === 'CheckedIn' ? (
          <div className="flex justify-end gap-1.5">
            <Button
              size="xs"
              disabled={busyId === participation.id}
              onClick={() => void onVerify(participation.id, true)}
            >
              <Check />
              Xác nhận
            </Button>
            <Button
              size="xs"
              variant="destructive"
              disabled={busyId === participation.id}
              onClick={() => void onVerify(participation.id, false)}
            >
              <X />
              Từ chối
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
        <PageHead
          leading={backButton}
          title={activity.title}
          description={formatDays(activity.days)}
          actions={
            <div className="flex items-center gap-2">
              <ActivityTypeBadge type={activity.type} />
              <ActivityPhaseBadge phase={phase} />
            </div>
          }
        />

        {notice && <SuccessNotice message={notice} />}
        {error && <ErrorNotice message={error} onRetry={() => void load()} />}

        <Card>
          <CardContent className="py-4">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetaItem label="Địa điểm" value={activity.location} />
              <MetaItem label="Bắt đầu" value={formatDateTime(activity.startAt)} />
              <MetaItem label="Kết thúc" value={formatDateTime(activity.endAt)} />
              <MetaItem label="Điểm cộng" value={formatDays(activity.days)} />
            </dl>
          </CardContent>
        </Card>

        {isStaff ? (
          <div className="grid gap-3 lg:grid-cols-[320px_minmax(0,1fr)]">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lead">Mã QR điểm danh</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <p className="m-0 text-body text-muted-foreground">
                  Cho sinh viên quét mã này tại hoạt động. Sinh viên phải đăng ký trước khi
                  điểm danh.
                </p>

                {qr ? (
                  <>
                    <div className="grid place-items-center rounded-lg border bg-card p-4">
                      <QRCodeSVG value={qr} size={196} />
                    </div>
                    <code className="block truncate rounded-md bg-secondary px-2.5 py-1.5 font-mono text-caption text-foreground">
                      {qr}
                    </code>
                    <Button size="sm" variant="outline" onClick={() => void copyQr()}>
                      <Copy />
                      Sao chép nội dung
                    </Button>
                  </>
                ) : (
                  <p className="m-0 text-body text-muted-foreground">Chưa tải được mã QR.</p>
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader>
                <CardTitle className="text-lead">
                  Danh sách tham gia ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {participants.length === 0 ? (
                  <EmptyState title="Chưa có sinh viên đăng ký" />
                ) : (
                  <DataTable
                    label="Danh sách sinh viên tham gia"
                    columns={columns}
                    rows={participants}
                    getRowId={(participation) => String(participation.id)}
                    pageSize={10}
                    hideFooter={participants.length <= 10}
                    minWidthClass="min-w-[36rem]"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lead">Trạng thái của bạn</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {mine ? (
                  <>
                    <div>
                      <ParticipationStatusBadge status={mine.status} />
                    </div>
                    <dl className="grid gap-2 text-body">
                      <MetaItem label="Điểm danh" value={formatDateTime(mine.checkedInAt)} />
                      <MetaItem label="Xác nhận" value={formatDateTime(mine.verifiedAt)} />
                    </dl>
                  </>
                ) : (
                  <>
                    <p className="m-0 text-body text-foreground">
                      Bạn chưa đăng ký hoạt động này.
                    </p>
                    <Button className="w-fit" onClick={() => void onRegister()}>
                      Đăng ký tham gia
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {mine?.status === 'Registered' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lead">Điểm danh</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onCheckIn} className="grid gap-3">
                    <p className="m-0 text-body text-muted-foreground">
                      Quét QR bằng ứng dụng mobile, hoặc dán nội dung QR / nhập mã điểm danh.
                    </p>
                    <div className="grid gap-1.5">
                      <Label htmlFor="check-in-code">Mã QR hoặc mã điểm danh</Label>
                      <Input
                        id="check-in-code"
                        value={checkInCode}
                        onChange={(event) => setCheckInCode(event.target.value)}
                        placeholder="ctxh:1:demo-ctxh-2026"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-fit">
                      Điểm danh
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {mine?.status === 'CheckedIn' && (
              <Card>
                <CardContent className="py-4">
                  <p className="m-0 text-body text-muted-foreground">
                    Bạn đã điểm danh. Vui lòng chờ cán bộ xác nhận.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
