import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';

type Tone = 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'purple';

const tones: Record<Tone, { backgroundColor: string; color: string }> = {
  green: { backgroundColor: colors.greenSoft, color: colors.green },
  blue: { backgroundColor: colors.blueSoft, color: colors.blue },
  amber: { backgroundColor: colors.amberSoft, color: colors.amber },
  red: { backgroundColor: colors.redSoft, color: colors.red },
  gray: { backgroundColor: '#e2e8f0', color: '#475569' },
  purple: { backgroundColor: colors.purpleSoft, color: colors.purple },
};

export function Badge({ label, tone = 'gray' }: { label: string; tone?: Tone }) {
  return (
    <View style={[styles.badge, { backgroundColor: tones[tone].backgroundColor }]}>
      <Text style={[styles.text, { color: tones[tone].color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: { fontSize: 11, fontWeight: '700' },
});
