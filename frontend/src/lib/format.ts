import type { ActivityPhase } from './types';

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDays(days: number): string {
  return `${days.toLocaleString('vi-VN')} ngày`;
}

export function getActivityPhase(startAt: string, endAt: string, now = new Date()): ActivityPhase {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (now < start) return 'SapDienRa';
  if (now > end) return 'DaKetThuc';
  return 'DangDienRa';
}

export const activityPhaseLabels: Record<ActivityPhase, string> = {
  SapDienRa: 'Sắp diễn ra',
  DangDienRa: 'Đang diễn ra',
  DaKetThuc: 'Đã kết thúc',
};

export function toDateTimeLocal(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function defaultActivityWindow(): { startAt: string; endAt: string } {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);

  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  return { startAt: toDateTimeLocal(start), endAt: toDateTimeLocal(end) };
}
