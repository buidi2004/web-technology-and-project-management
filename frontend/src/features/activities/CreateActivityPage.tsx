import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { PageHead } from '@/components/blocks/shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { ErrorNotice } from '@/components/Notice';
import { getErrorMessage } from '@/lib/api';
import { defaultActivityWindow } from '@/lib/format';
import type { ActivityType } from '@/lib/types';
import { useAuth } from '../auth/AuthContext';
import { activitiesApi } from './activitiesApi';

export function CreateActivityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [initialWindow] = useState(defaultActivityWindow);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('CongTacXaHoi');
  const [days, setDays] = useState('1');
  const [location, setLocation] = useState('');
  const [startAt, setStartAt] = useState(initialWindow.startAt);
  const [endAt, setEndAt] = useState(initialWindow.endAt);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user?.role !== 'Organizer' && user?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const daysValue = Number(days);
    if (!Number.isFinite(daysValue) || daysValue <= 0) {
      setError('Số ngày phải lớn hơn 0');
      return;
    }

    if (new Date(endAt) <= new Date(startAt)) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    setBusy(true);
    try {
      const created = await activitiesApi.create({
        title: title.trim(),
        type,
        days: daysValue,
        location: location.trim(),
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
      });

      navigate(`/activities/${created.id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <PageHead
          title="Tạo hoạt động"
          description="Sau khi tạo, hệ thống sinh mã QR để sinh viên điểm danh tại địa điểm."
        />

        {error && <ErrorNotice message={error} />}

        <Card>
          <form onSubmit={onSubmit} noValidate>
            <CardContent className="grid gap-4 py-4 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="activity-title">Tên hoạt động</Label>
                <Input
                  id="activity-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="VD: Mùa hè xanh - Dọn vệ sinh bờ sông"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="activity-type">Loại hoạt động</Label>
                <NativeSelect
                  id="activity-type"
                  value={type}
                  onChange={(event) => setType(event.target.value as ActivityType)}
                >
                  <option value="CongTacXaHoi">Công tác xã hội</option>
                  <option value="LaoDong">Ngày lao động</option>
                </NativeSelect>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="activity-days">Số ngày được cộng</Label>
                <Input
                  id="activity-days"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={days}
                  onChange={(event) => setDays(event.target.value)}
                  required
                />
              </div>

              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="activity-location">Địa điểm</Label>
                <Input
                  id="activity-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="VD: Cao Lãnh"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="activity-start">Bắt đầu</Label>
                <Input
                  id="activity-start"
                  type="datetime-local"
                  value={startAt}
                  onChange={(event) => setStartAt(event.target.value)}
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="activity-end">Kết thúc</Label>
                <Input
                  id="activity-end"
                  type="datetime-local"
                  value={endAt}
                  onChange={(event) => setEndAt(event.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="justify-end gap-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={busy}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={busy}>
                {busy && <Loader2 className="animate-spin" />}
                {busy ? 'Đang tạo...' : 'Tạo hoạt động'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
