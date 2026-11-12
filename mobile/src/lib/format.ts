import type { ActivityPhase, ActivityType, ParticipationStatus } from '../api/types';

export const activityTypeLabels: Record<ActivityType, string> = {
  CongTacXaHoi: 'Công tác xã hội',
  LaoDong: 'Ngày lao động',
};

export const participationStatusLabels: Record<ParticipationStatus, string> = {
  Registered: 'Đã đăng ký',
  CheckedIn: 'Đã điểm danh',
  Verified: 'Đã xác nhận',
  Rejected: 'Bị từ chối',
};

export const activityPhaseLabels: Record<ActivityPhase, string> = {
  SapDienRa: 'Sắp diễn ra',
  DangDienRa: 'Đang diễn ra',
  DaKetThuc: 'Đã kết thúc',
};

const pad = (value: number) => String(value).padStart(2, '0');

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function formatDays(days: number): string {
  const text = Number.isInteger(days) ? String(days) : days.toFixed(1).replace('.', ',');
  return `${text} ngày`;
}

export function getActivityPhase(
  startAt: string,
  endAt: string,
  now = new Date(),
): ActivityPhase {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (now < start) return 'SapDienRa';
  if (now > end) return 'DaKetThuc';
  return 'DangDienRa';
}
