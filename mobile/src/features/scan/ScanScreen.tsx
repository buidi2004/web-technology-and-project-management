import { router } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { activitiesApi } from '../../api/activities';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/Button';
import { ErrorNotice } from '../../components/ErrorNotice';
import { FormField } from '../../components/FormField';
import { Screen } from '../../components/Screen';
import { parseQrPayload } from '../../lib/qr';
import { colors } from '../../lib/theme';

export function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);

  async function submit(raw: string) {
    if (locked.current) return;

    const parsed = parseQrPayload(raw);

    if (!parsed) {
      setError('Mã QR không hợp lệ. Định dạng đúng: ctxh:{id}:{ma-diem-danh}');
      return;
    }

    locked.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      await activitiesApi.checkIn(parsed.activityId, parsed.code);
      setNotice('Điểm danh thành công. Chờ cán bộ xác nhận.');
      setManual('');

      Alert.alert('Điểm danh thành công', 'Lượt tham gia của bạn đang chờ cán bộ xác nhận.', [
        { text: 'Xem hoạt động', onPress: () => router.replace(`/activities/${parsed.activityId}`) },
        { text: 'Ở lại', style: 'cancel' },
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }

  function onScanned(result: BarcodeScanningResult) {
    void submit(result.data);
  }

  return (
    <Screen>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        hitSlop={8}
      >
        <Text style={styles.back}>← Quay lại</Text>
      </Pressable>

      <Text style={styles.title}>Quét QR điểm danh</Text>
      <Text style={styles.subtitle}>
        Đưa mã QR của hoạt động vào khung hình. Bạn cần đăng ký hoạt động trước khi điểm danh.
      </Text>

      {notice && <ErrorNotice message={notice} tone="success" />}
      {error && <ErrorNotice message={error} />}

      <View style={styles.cameraBox}>
        {!permission ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Đang kiểm tra quyền camera...</Text>
          </View>
        ) : !permission.granted ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Ứng dụng cần quyền camera để quét mã QR điểm danh.
            </Text>
            <Button title="Cấp quyền camera" onPress={() => void requestPermission()} small />
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={busy ? undefined : onScanned}
          />
        )}
        <View pointerEvents="none" style={styles.frame} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Nhập mã thủ công</Text>
        <Text style={styles.hint}>
          Nếu camera không dùng được, dán nội dung QR hoặc mã điểm danh do cán bộ cung cấp.
        </Text>
        <FormField
          label="Nội dung QR / mã điểm danh"
          value={manual}
          onChangeText={setManual}
          placeholder="ctxh:1:demo-ctxh-2026"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Button
          title="Điểm danh"
          onPress={() => void submit(manual)}
          loading={busy}
          disabled={!manual.trim()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { fontSize: 14, fontWeight: '700', color: colors.muted, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, lineHeight: 19, marginTop: 6, marginBottom: 16 },
  cameraBox: {
    height: 280,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    marginBottom: 16,
    justifyContent: 'center',
  },
  camera: { flex: 1 },
  placeholder: { alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  placeholderText: { color: '#e2e8f0', fontSize: 13, textAlign: 'center', lineHeight: 19 },
  frame: {
    position: 'absolute',
    alignSelf: 'center',
    width: 190,
    height: 190,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#a5b4fc',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    gap: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  hint: { fontSize: 12, color: colors.muted, lineHeight: 18 },
});
