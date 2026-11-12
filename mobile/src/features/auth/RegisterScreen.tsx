import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/Button';
import { ErrorNotice } from '../../components/ErrorNotice';
import { FormField } from '../../components/FormField';
import { Screen } from '../../components/Screen';
import { colors } from '../../lib/theme';
import { useAuth } from './AuthContext';

export function RegisterScreen() {
  const { register } = useAuth();
  const [studentCode, setStudentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setBusy(true);
    try {
      await register(studentCode.trim(), fullName.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Đăng ký sinh viên</Text>
        <Text style={styles.subtitle}>Tạo tài khoản để đăng ký và điểm danh hoạt động.</Text>
      </View>

      <View style={styles.card}>
        {error && <ErrorNotice message={error} />}

        <FormField
          label="Mã sinh viên"
          value={studentCode}
          onChangeText={setStudentCode}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="VD: SV002"
        />
        <FormField
          label="Họ và tên"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nguyễn Văn B"
        />
        <FormField
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Ít nhất 8 ký tự"
        />
        <FormField
          label="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Nhập lại mật khẩu"
        />

        <Button title="Tạo tài khoản" onPress={() => void submit()} loading={busy} />

        <Pressable onPress={() => router.replace('/login')} hitSlop={8}>
          <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 4, marginTop: 20, marginBottom: 18 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
  },
  link: { textAlign: 'center', color: colors.primary, fontWeight: '600', fontSize: 13 },
});
