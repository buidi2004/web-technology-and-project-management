import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Activity, MyParticipation } from '../../api/types';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import {
  activityPhaseLabels,
  activityTypeLabels,
  formatDateTime,
  formatDays,
  getActivityPhase,
  participationStatusLabels,
} from '../../lib/format';
import { colors } from '../../lib/theme';

const statusTone = {
  Registered: 'blue',
  CheckedIn: 'amber',
  Verified: 'green',
  Rejected: 'red',
} as const;

export function ActivityCard({
  activity,
  participation,
  canRegister,
  busy,
  onOpen,
  onRegister,
}: {
  activity: Activity;
  participation?: MyParticipation;
  canRegister: boolean;
  busy: boolean;
  onOpen: () => void;
  onRegister: () => void;
}) {
  const phase = getActivityPhase(activity.startAt, activity.endAt);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Badge
          label={activityTypeLabels[activity.type]}
          tone={activity.type === 'CongTacXaHoi' ? 'purple' : 'amber'}
        />
        <Badge
          label={activityPhaseLabels[phase]}
          tone={phase === 'DangDienRa' ? 'green' : phase === 'SapDienRa' ? 'blue' : 'gray'}
        />
        <View style={styles.spacer} />
        <Text style={styles.days}>+{formatDays(activity.days)}</Text>
      </View>

      <Pressable onPress={onOpen} hitSlop={4}>
        <Text style={styles.title}>{activity.title}</Text>
      </Pressable>

      <Text style={styles.meta}>📍 {activity.location}</Text>
      <Text style={styles.meta}>🕒 {formatDateTime(activity.startAt)}</Text>

      <View style={styles.foot}>
        {participation ? (
          <Badge
            label={participationStatusLabels[participation.status]}
            tone={statusTone[participation.status]}
          />
        ) : (
          <Text style={styles.open}>Chi tiết hoạt động →</Text>
        )}

        <View style={styles.actions}>
          {!participation && canRegister && (
            <Button title="Đăng ký" onPress={onRegister} loading={busy} small />
          )}
          <Button title="Xem" onPress={onOpen} variant="ghost" small />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  spacer: { flex: 1 },
  days: { fontSize: 12, fontWeight: '800', color: colors.primary },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, lineHeight: 22 },
  meta: { fontSize: 13, color: colors.muted },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 8,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  open: { fontSize: 12, color: colors.muted },
  actions: { flexDirection: 'row', gap: 8 },
});
