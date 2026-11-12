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

const demoAccounts = [
  { code: 'SV001', password: 'Sv@12345', label: 'Sinh viên' },
  { code: 'GV001', password: 'Org@12345', label: 'Cán bộ' },
  { code: 'admin', password: 'Admin@123', label: 'Admin' },
];

export function LoginScreen() {
  const { login } = useAuth();
  const [studentCode, setStudentCode] = useState('SV001');
  const [password, setPassword] = useState('Sv@12345');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);

    try {
      await login(studentCode.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>C</Text>
        </View>
        <Text style={styles.brand}>CTXH</Text>
        <Text style={styles.subtitle}>
          Quản lý và xác thực ngày công tác xã hội / ngày lao động.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Đăng nhập</Text>

        {error && <ErrorNotice message={error} />}

        <FormField
          label="Mã sinh viên"
          value={studentCode}
          onChangeText={setStudentCode}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="VD: SV001"
        />
        <FormField
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <Button title="Đăng nhập" onPress={() => void submit()} loading={busy} />

        <View style={styles.demo}>
          <Text style={styles.demoLabel}>Tài khoản demo</Text>
          <View style={styles.chipRow}>
            {demoAccounts.map((account) => (
              <Pressable
                key={account.code}
                onPress={() => {
                  setStudentCode(account.code);
                  setPassword(account.password);
                }}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{account.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable onPress={() => router.push('/register')} hitSlop={8}>
          <Text style={styles.link}>Chưa có tài khoản? Đăng ký sinh viên</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 8, marginTop: 36, marginBottom: 26 },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  brand: { fontSize: 26, fontWeight: '800', letterSpacing: 2, color: colors.text },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 300,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  demo: { gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  demoLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontSize: 12, color: '#334155', fontWeight: '600' },
  link: { textAlign: 'center', color: colors.primary, fontWeight: '600', fontSize: 13 },
});
