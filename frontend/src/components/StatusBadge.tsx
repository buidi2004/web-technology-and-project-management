import { Badge } from '@/components/ui/badge';
import { activityTypeLabels, participationStatusLabels } from '@/lib/api';
import { activityPhaseLabels } from '@/lib/format';
import type { ActivityPhase, ActivityType, ParticipationStatus } from '@/lib/types';

type StatusVariant = 'info' | 'warning' | 'success' | 'destructive';

const statusVariant: Record<ParticipationStatus, StatusVariant> = {
  Registered: 'info',
  CheckedIn: 'warning',
  Verified: 'success',
  Rejected: 'destructive',
};

export function ParticipationStatusBadge({ status }: { status: ParticipationStatus }) {
  return <Badge variant={statusVariant[status]}>{participationStatusLabels[status]}</Badge>;
}

export function ActivityTypeBadge({ type }: { type: ActivityType }) {
  return (
    <Badge variant={type === 'CongTacXaHoi' ? 'violet' : 'warning'}>
      {activityTypeLabels[type]}
    </Badge>
  );
}

const phaseVariant: Record<ActivityPhase, 'secondary' | 'success' | 'outline'> = {
  SapDienRa: 'outline',
  DangDienRa: 'success',
  DaKetThuc: 'secondary',
};

export function ActivityPhaseBadge({ phase }: { phase: ActivityPhase }) {
  return (
    <Badge variant={phaseVariant[phase]} dot>
      {activityPhaseLabels[phase]}
    </Badge>
  );
}
