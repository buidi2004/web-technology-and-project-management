import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { activitiesApi } from '../../api/activities';
import { getErrorMessage } from '../../api/client';
import { participationsApi } from '../../api/participations';
import type { MyParticipation, Summary } from '../../api/types';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ErrorNotice } from '../../components/ErrorNotice';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Screen } from '../../components/Screen';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatDays } from '../../lib/format';
import { colors } from '../../lib/theme';
import { useAuth } from '../auth/AuthContext';
import { ActivityCard } from './ActivityCard';

export function ActivitiesScreen() {
  const { user, logout } = useAuth();
  const isStudent = user?.role === 'Student';

  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const [activities, mine, summary] = await Promise.all([
        activitiesApi.list(),
        isStudent ? participationsApi.mine() : Promise.resolve<MyParticipation[]>([]),
        isStudent ? participationsApi.summary() : Promise.resolve<Summary | null>(null),
      ]);

      return { activities, mine, summary };
    },
    [isStudent],
  );

  async function onRegister(activityId: number) {
    setBusyId(activityId);
    setNotice(null);
    setActionError(null);

    try {
      await activitiesApi.register(activityId);
      setNotice('Đăng ký hoạt động thành công.');
      await reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function onLogout() {
    await logout();
    router.replace('/login');
  }

  if (loading && !data) return <LoadingScreen label="Đang tải hoạt động..." />;

  const mineByActivity = new Map((data?.mine ?? []).map((item) => [item.activityId, item]));

  return (
    <Screen refreshing={loading} onRefresh={() => void reload()}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.name}>{user?.fullName}</Text>
        </View>
        <Pressable onPress={() => void onLogout()} hitSlop={8}>
          <Text style={styles.logout}>Đăng xuất</Text>
        </Pressable>
      </View>

      {isStudent && data?.summary && (
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>CTXH</Text>
            <Text style={styles.statValue}>{formatDays(data.summary.ctxhDays)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Lao động</Text>
            <Text style={styles.statValue}>{formatDays(data.summary.laoDongDays)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Đã xác nhận</Text>
            <Text style={styles.statValue}>{data.summary.verifiedActivities}</Text>
          </View>
        </View>
      )}

      <Button title="📷 Quét QR điểm danh" onPress={() => router.push('/scan')} />
      <Text style={styles.hint}>
        Đăng ký hoạt động trước, sau đó quét mã QR tại nơi diễn ra để điểm danh.
      </Text>

      {notice && <ErrorNotice message={notice} tone="success" />}
      {actionError && <ErrorNotice message={actionError} />}
      {error && <ErrorNotice message={error} onRetry={() => void reload()} />}

      <Text style={styles.sectionTitle}>Hoạt động ({data?.activities.length ?? 0})</Text>

      {!data || data.activities.length === 0 ? (
        <EmptyState
          title="Chưa có hoạt động"
          description="Cán bộ Đoàn - Hội tạo hoạt động trên web, sau đó sinh viên đăng ký tại đây."
        />
      ) : (
        <View style={styles.list}>
          {data.activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              participation={mineByActivity.get(activity.id)}
              canRegister={isStudent}
              busy={busyId === activity.id}
              onOpen={() => router.push(`/activities/${activity.id}`)}
              onRegister={() => void onRegister(activity.id)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerText: { gap: 2 },
  greeting: { fontSize: 13, color: colors.muted },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  logout: { fontSize: 13, color: colors.red, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 9, marginBottom: 16 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 11,
  },
  statLabel: { fontSize: 10, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 4 },
  hint: { fontSize: 12, color: colors.muted, lineHeight: 18, marginTop: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 10 },
  list: { gap: 10 },
});
