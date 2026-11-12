import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';

export function ErrorNotice({
  message,
  onRetry,
  tone = 'error',
}: {
  message: string;
  onRetry?: () => void;
  tone?: 'error' | 'success';
}) {
  const isSuccess = tone === 'success';

  return (
    <View style={[styles.box, isSuccess ? styles.success : styles.error]}>
      <Text style={[styles.text, isSuccess ? styles.successText : styles.errorText]}>
        {message}
      </Text>
      {onRetry && (
        <Pressable onPress={onRetry} hitSlop={8}>
          <Text style={styles.retry}>Thử lại</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 4,
  },
  error: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  success: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  text: { fontSize: 13, lineHeight: 19 },
  errorText: { color: '#991b1b' },
  successText: { color: '#065f46' },
  retry: { color: colors.primary, fontWeight: '700', fontSize: 13 },
});
