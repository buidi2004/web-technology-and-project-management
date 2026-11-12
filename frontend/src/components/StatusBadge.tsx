import type { ActivityType, ParticipationStatus } from '../lib/types';
import { activityTypeLabels, participationStatusLabels } from '../lib/api';
import { Badge, type BadgeTone } from './Badge';

const statusTone: Record<ParticipationStatus, BadgeTone> = {
  Registered: 'blue',
  CheckedIn: 'amber',
  Verified: 'green',
  Rejected: 'red',
};

export function ParticipationStatusBadge({ status }: { status: ParticipationStatus }) {
  return <Badge tone={statusTone[status]}>{participationStatusLabels[status]}</Badge>;
}

export function ActivityTypeBadge({ type }: { type: ActivityType }) {
  return (
    <Badge tone={type === 'CongTacXaHoi' ? 'purple' : 'amber'}>
      {activityTypeLabels[type]}
    </Badge>
  );
}
