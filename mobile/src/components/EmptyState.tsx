import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.icon}>📭</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 30,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  icon: { fontSize: 26 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  description: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 19 },
});
