import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ErrorBanner } from '../../components/ErrorBanner';
import { PageHeader } from '../../components/PageHeader';
import { Spinner } from '../../components/PageLoader';
import { getErrorMessage } from '../../lib/api';
import { defaultActivityWindow } from '../../lib/format';
import type { ActivityType } from '../../lib/types';
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
    <>
      <PageHeader
        title="Tạo hoạt động"
        description="Sau khi tạo, hệ thống sinh mã QR để sinh viên điểm danh tại địa điểm."
      />

      {error && <ErrorBanner message={error} />}

      <form className="card form form-grid" onSubmit={onSubmit}>
        <label className="field field-span-2">
          <span>Tên hoạt động</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="VD: Mùa hè xanh - Dọn vệ sinh bờ sông"
            required
          />
        </label>

        <label className="field">
          <span>Loại hoạt động</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as ActivityType)}
          >
            <option value="CongTacXaHoi">Công tác xã hội</option>
            <option value="LaoDong">Ngày lao động</option>
          </select>
        </label>

        <label className="field">
          <span>Số ngày được cộng</span>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={days}
            onChange={(event) => setDays(event.target.value)}
            required
          />
        </label>

        <label className="field field-span-2">
          <span>Địa điểm</span>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="VD: Cao Lãnh"
            required
          />
        </label>

        <label className="field">
          <span>Bắt đầu</span>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Kết thúc</span>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
            required
          />
        </label>

        <div className="form-actions field-span-2">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? <Spinner /> : 'Tạo hoạt động'}
          </button>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => navigate('/')}
            disabled={busy}
          >
            Hủy
          </button>
        </div>
      </form>
    </>
  );
}
