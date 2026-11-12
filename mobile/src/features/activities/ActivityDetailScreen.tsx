import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { activitiesApi } from '../../api/activities';
import { getErrorMessage } from '../../api/client';
import { participationsApi } from '../../api/participations';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { ErrorNotice } from '../../components/ErrorNotice';
import { FormField } from '../../components/FormField';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Screen } from '../../components/Screen';
import { useAsyncData } from '../../hooks/useAsyncData';
import {
  activityPhaseLabels,
  activityTypeLabels,
  formatDateTime,
  formatDays,
  getActivityPhase,
  participationStatusLabels,
} from '../../lib/format';
import { parseQrPayload } from '../../lib/qr';
import { colors } from '../../lib/theme';
import { useAuth } from '../auth/AuthContext';

export function ActivityDetailScreen({ activityId }: { activityId: number }) {
  const { user } = useAuth();
  const isStudent = user?.role === 'Student';

  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');

  const { data, loading, error, reload } = useAsyncData(
    async () => {
      const activity = await activitiesApi.get(activityId);
      const mine = isStudent
        ? ((await participationsApi.mine()).find((item) => item.activityId === activityId) ?? null)
        : null;

      return { activity, mine };
    },
    [activityId, isStudent],
  );

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  async function onRegister() {
    setBusy(true);
    setNotice(null);
    setActionError(null);

    try {
      await activitiesApi.register(activityId);
      setNotice('Đăng ký thành công. Bạn có thể điểm danh khi hoạt động bắt đầu.');
      await reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onCheckIn() {
    setNotice(null);
    setActionError(null);

    const parsed = parseQrPayload(code);
    const checkInCode = parsed?.code ?? code.trim();

    if (parsed && parsed.activityId !== activityId) {
      setActionError('Mã QR này thuộc về hoạt động khác');
      return;
    }

    if (!checkInCode) {
      setActionError('Nhập mã QR hoặc mã điểm danh');
      return;
    }

    setBusy(true);
    try {
      await activitiesApi.checkIn(activityId, checkInCode);
      setCode('');
      setNotice('Điểm danh thành công. Chờ cán bộ xác nhận.');
      await reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) return <LoadingScreen label="Đang tải hoạt động..." />;

  if (!data) {
    return (
      <Screen>
        <Pressable onPress={goBack}>
          <Text style={styles.back}>← Quay lại</Text>
        </Pressable>
        <ErrorNotice message={error ?? 'Không tìm thấy hoạt động'} onRetry={() => void reload()} />
      </Screen>
    );
  }

  const { activity, mine } = data;
  const phase = getActivityPhase(activity.startAt, activity.endAt);

  return (
    <Screen refreshing={loading} onRefresh={() => void reload()}>
      <Pressable onPress={goBack} hitSlop={8}>
        <Text style={styles.back}>← Quay lại</Text>
      </Pressable>

      <View style={styles.card}>
        <View style={styles.row}>
          <Badge
            label={activityTypeLabels[activity.type]}
            tone={activity.type === 'CongTacXaHoi' ? 'purple' : 'amber'}
          />
          <Badge
            label={activityPhaseLabels[phase]}
            tone={phase === 'DangDienRa' ? 'green' : phase === 'SapDienRa' ? 'blue' : 'gray'}
          />
        </View>

        <Text style={styles.title}>{activity.title}</Text>
        <Text style={styles.meta}>📍 {activity.location}</Text>
        <Text style={styles.meta}>🕒 {formatDateTime(activity.startAt)}</Text>
        <Text style={styles.meta}>🏁 {formatDateTime(activity.endAt)}</Text>
        <Text style={styles.days}>+{formatDays(activity.days)}</Text>
      </View>

      {notice && <ErrorNotice message={notice} tone="success" />}
      {actionError && <ErrorNotice message={actionError} />}

      {isStudent ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Trạng thái của bạn</Text>

          {mine ? (
            <>
              <Badge
                label={participationStatusLabels[mine.status]}
                tone={
                  mine.status === 'Verified'
                    ? 'green'
                    : mine.status === 'CheckedIn'
                      ? 'amber'
                      : mine.status === 'Rejected'
                        ? 'red'
                        : 'blue'
                }
              />
              <Text style={styles.meta}>Điểm danh: {formatDateTime(mine.checkedInAt)}</Text>
              <Text style={styles.meta}>Xác nhận: {formatDateTime(mine.verifiedAt)}</Text>
            </>
          ) : (
            <>
              <Text style={styles.meta}>Bạn chưa đăng ký hoạt động này.</Text>
              <Button title="Đăng ký tham gia" onPress={() => void onRegister()} loading={busy} />
            </>
          )}

          {mine?.status === 'Registered' && (
            <View style={styles.checkIn}>
              <Text style={styles.sectionTitle}>Điểm danh</Text>
              <Text style={styles.hint}>
                Quét QR ở màn hình tiếp theo, hoặc dán nội dung QR vào ô bên dưới.
              </Text>
              <Button
                title="📷 Quét QR điểm danh"
                onPress={() => router.push('/scan')}
                variant="ghost"
              />
              <FormField
                label="Nội dung QR / mã điểm danh"
                value={code}
                onChangeText={setCode}
                placeholder="ctxh:1:demo-ctxh-2026"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Button title="Điểm danh" onPress={() => void onCheckIn()} loading={busy} />
            </View>
          )}

          {mine?.status === 'CheckedIn' && (
            <Text style={styles.hint}>Bạn đã điểm danh. Vui lòng chờ cán bộ xác nhận.</Text>
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Chế độ cán bộ</Text>
          <Text style={styles.hint}>
            Dùng bản web để xem mã QR, danh sách sinh viên và xác nhận lượt tham gia.
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { fontSize: 14, fontWeight: '700', color: colors.muted, marginBottom: 12 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    gap: 9,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, lineHeight: 27 },
  meta: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  days: { fontSize: 14, fontWeight: '800', color: colors.primary },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  hint: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  checkIn: { gap: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
});
