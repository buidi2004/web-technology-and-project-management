import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { PageLoader } from '../../components/PageLoader';
import {
  ActivityTypeBadge,
  ParticipationStatusBadge,
} from '../../components/StatusBadge';
import { getErrorMessage } from '../../lib/api';
import {
  activityPhaseLabels,
  formatDateTime,
  formatDays,
  getActivityPhase,
} from '../../lib/format';
import { parseQrPayload } from '../../lib/qr';
import type {
  Activity,
  ActivityParticipation,
  MyParticipation,
} from '../../lib/types';
import { useAuth } from '../auth/AuthContext';
import { participationsApi } from '../participations/participationsApi';
import { activitiesApi } from './activitiesApi';

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

  if (loading) return <PageLoader label="Đang tải hoạt động..." />;

  if (!activity) {
    return (
      <>
        <Link className="back-link" to="/">
          ← Về danh sách
        </Link>
        <ErrorBanner message={error ?? 'Không tìm thấy hoạt động'} />
      </>
    );
  }

  const phase = getActivityPhase(activity.startAt, activity.endAt);

  return (
    <>
      <Link className="back-link" to="/">
        ← Về danh sách
      </Link>

      <section className="card activity-hero">
        <div className="activity-card-head">
          <ActivityTypeBadge type={activity.type} />
          <span className={`phase phase-${phase.toLowerCase()}`}>
            {activityPhaseLabels[phase]}
          </span>
        </div>

        <h1>{activity.title}</h1>

        <dl className="meta-list meta-list-inline">
          <div>
            <dt>Địa điểm</dt>
            <dd>{activity.location}</dd>
          </div>
          <div>
            <dt>Bắt đầu</dt>
            <dd>{formatDateTime(activity.startAt)}</dd>
          </div>
          <div>
            <dt>Kết thúc</dt>
            <dd>{formatDateTime(activity.endAt)}</dd>
          </div>
          <div>
            <dt>Điểm cộng</dt>
            <dd>{formatDays(activity.days)}</dd>
          </div>
        </dl>
      </section>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <ErrorBanner message={error} onRetry={() => void load()} />}

      {isStaff ? (
        <div className="detail-grid">
          <section className="card">
            <h2>Mã QR điểm danh</h2>
            <p className="muted">
              Cho sinh viên quét mã này tại hoạt động. Sinh viên phải đăng ký trước khi
              điểm danh.
            </p>

            {qr ? (
              <>
                <div className="qr-box">
                  <QRCodeSVG value={qr} size={196} />
                </div>
                <code className="qr-value">{qr}</code>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => void copyQr()}>
                  Sao chép nội dung
                </button>
              </>
            ) : (
              <p className="muted">Chưa tải được mã QR.</p>
            )}
          </section>

          <section className="card">
            <h2>Danh sách tham gia ({participants.length})</h2>

            {participants.length === 0 ? (
              <EmptyState title="Chưa có sinh viên đăng ký" />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Sinh viên</th>
                      <th>Trạng thái</th>
                      <th>Điểm danh</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participation) => (
                      <tr key={participation.id}>
                        <td>
                          <strong>{participation.fullName}</strong>
                          <span className="muted"> · {participation.studentCode}</span>
                        </td>
                        <td>
                          <ParticipationStatusBadge status={participation.status} />
                        </td>
                        <td>{formatDateTime(participation.checkedInAt)}</td>
                        <td className="row-actions">
                          {participation.status === 'CheckedIn' && (
                            <>
                              <button
                                type="button"
                                className="btn btn-success btn-sm"
                                disabled={busyId === participation.id}
                                onClick={() => void onVerify(participation.id, true)}
                              >
                                Xác nhận
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                disabled={busyId === participation.id}
                                onClick={() => void onVerify(participation.id, false)}
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="detail-grid">
          <section className="card">
            <h2>Trạng thái của bạn</h2>
            {mine ? (
              <>
                <p>
                  <ParticipationStatusBadge status={mine.status} />
                </p>
                <p className="muted">
                  Điểm danh: {formatDateTime(mine.checkedInAt)}
                  <br />
                  Xác nhận: {formatDateTime(mine.verifiedAt)}
                </p>
              </>
            ) : (
              <>
                <p>Bạn chưa đăng ký hoạt động này.</p>
                <button type="button" className="btn btn-primary" onClick={() => void onRegister()}>
                  Đăng ký tham gia
                </button>
              </>
            )}

            {mine?.status === 'Registered' && (
              <form className="form checkin-form" onSubmit={onCheckIn}>
                <h3>Điểm danh</h3>
                <p className="muted">
                  Quét QR bằng ứng dụng mobile, hoặc dán nội dung QR / nhập mã điểm danh.
                </p>
                <label className="field">
                  <span>Mã QR hoặc mã điểm danh</span>
                  <input
                    value={checkInCode}
                    onChange={(event) => setCheckInCode(event.target.value)}
                    placeholder="ctxh:1:demo-ctxh-2026"
                    required
                  />
                </label>
                <button type="submit" className="btn btn-primary">
                  Điểm danh
                </button>
              </form>
            )}

            {mine?.status === 'CheckedIn' && (
              <p className="muted">Bạn đã điểm danh. Vui lòng chờ cán bộ xác nhận.</p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
