import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { PageHeader } from '../../components/PageHeader';
import { PageLoader } from '../../components/PageLoader';
import { ActivityTypeBadge, ParticipationStatusBadge } from '../../components/StatusBadge';
import { getErrorMessage } from '../../lib/api';
import { formatDateTime, formatDays } from '../../lib/format';
import type { MyParticipation, Summary } from '../../lib/types';
import { participationsApi } from './participationsApi';

export function MyParticipationsPage() {
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

  return (
    <>
      <PageHeader
        title="Tiến độ của tôi"
        description="Chỉ các lượt tham gia đã được cán bộ xác nhận mới được cộng ngày."
      />

      {error && <ErrorBanner message={error} onRetry={() => void load()} />}

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {summary && (
            <section className="stat-grid">
              <div className="stat-card">
                <span>Ngày CTXH</span>
                <strong>{formatDays(summary.ctxhDays)}</strong>
              </div>
              <div className="stat-card">
                <span>Ngày lao động</span>
                <strong>{formatDays(summary.laoDongDays)}</strong>
              </div>
              <div className="stat-card">
                <span>Hoạt động đã xác nhận</span>
                <strong>{summary.verifiedActivities}</strong>
              </div>
            </section>
          )}

          {items.length === 0 ? (
            <EmptyState
              title="Bạn chưa tham gia hoạt động nào"
              description="Đăng ký một hoạt động ở trang chủ để bắt đầu."
              action={
                <Link className="btn btn-primary" to="/">
                  Xem hoạt động
                </Link>
              }
            />
          ) : (
            <div className="table-wrap card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Hoạt động</th>
                    <th>Loại</th>
                    <th>Điểm</th>
                    <th>Trạng thái</th>
                    <th>Điểm danh</th>
                    <th>Xác nhận</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/activities/${item.activityId}`}>{item.title}</Link>
                        <div className="muted small">{formatDateTime(item.startAt)}</div>
                      </td>
                      <td>
                        <ActivityTypeBadge type={item.type} />
                      </td>
                      <td>{formatDays(item.days)}</td>
                      <td>
                        <ParticipationStatusBadge status={item.status} />
                      </td>
                      <td>{formatDateTime(item.checkedInAt)}</td>
                      <td>{formatDateTime(item.verifiedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
