import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../lib/theme';

type Variant = 'primary' | 'ghost' | 'success' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  small = false,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variants[variant],
        small && styles.small,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? colors.primary : '#fff'} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'ghost' && styles.textGhost,
            small && styles.textSmall,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const variants: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.primary },
  ghost: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  success: { backgroundColor: colors.green },
  danger: { backgroundColor: colors.red },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  small: { minHeight: 36, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 9 },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.85 },
  text: { color: '#fff', fontWeight: '700', fontSize: 15 },
  textSmall: { fontSize: 13 },
  textGhost: { color: '#334155' },
});
