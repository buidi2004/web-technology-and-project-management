import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { PageHeader } from '../../components/PageHeader';
import { PageLoader } from '../../components/PageLoader';
import { ActivityTypeBadge, ParticipationStatusBadge } from '../../components/StatusBadge';
import { getErrorMessage } from '../../lib/api';
import {
  activityPhaseLabels,
  formatDateTime,
  formatDays,
  getActivityPhase,
} from '../../lib/format';
import type { Activity, MyParticipation, Summary } from '../../lib/types';
import { useAuth } from '../auth/AuthContext';
import { participationsApi } from '../participations/participationsApi';
import { activitiesApi } from './activitiesApi';

export function ActivitiesPage() {
  const { user } = useAuth();
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

  return (
    <>
      <PageHeader
        title={`Xin chào, ${user?.fullName ?? 'bạn'}`}
        description="Danh sách hoạt động công tác xã hội và ngày lao động."
      >
        {(user?.role === 'Organizer' || user?.role === 'Admin') && (
          <Link className="btn btn-primary" to="/activities/new">
            + Tạo hoạt động
          </Link>
        )}
      </PageHeader>

      {isStudent && summary && (
        <section className="stat-grid" aria-label="Tiến độ của tôi">
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

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <ErrorBanner message={error} onRetry={() => void load()} />}

      {loading ? (
        <PageLoader />
      ) : activities.length === 0 ? (
        <EmptyState
          title="Chưa có hoạt động nào"
          description="Cán bộ Đoàn - Hội có thể tạo hoạt động mới để sinh viên đăng ký."
        />
      ) : (
        <section className="activity-grid">
          {activities.map((activity) => {
            const phase = getActivityPhase(activity.startAt, activity.endAt);
            const myParticipation = mineByActivity.get(activity.id);

            return (
              <article className="activity-card" key={activity.id}>
                <div className="activity-card-head">
                  <ActivityTypeBadge type={activity.type} />
                  <span className={`phase phase-${phase.toLowerCase()}`}>
                    {activityPhaseLabels[phase]}
                  </span>
                </div>

                <h3>
                  <Link to={`/activities/${activity.id}`}>{activity.title}</Link>
                </h3>

                <dl className="meta-list">
                  <div>
                    <dt>Địa điểm</dt>
                    <dd>{activity.location}</dd>
                  </div>
                  <div>
                    <dt>Thời gian</dt>
                    <dd>
                      {formatDateTime(activity.startAt)} → {formatDateTime(activity.endAt)}
                    </dd>
                  </div>
                  <div>
                    <dt>Điểm cộng</dt>
                    <dd>{formatDays(activity.days)}</dd>
                  </div>
                </dl>

                <div className="activity-card-foot">
                  {myParticipation ? (
                    <ParticipationStatusBadge status={myParticipation.status} />
                  ) : isStudent ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={busyId === activity.id}
                      onClick={() => void onRegister(activity.id)}
                    >
                      {busyId === activity.id ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                  ) : (
                    <span />
                  )}

                  <Link className="btn btn-ghost btn-sm" to={`/activities/${activity.id}`}>
                    Chi tiết
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </>
  );
}
