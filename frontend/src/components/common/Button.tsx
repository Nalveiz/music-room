import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useThemeColors } from '@/src/theme/ThemeProvider';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textColor?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textColor,
}: ButtonProps) {
  const colors = useThemeColors();

  const bg =
    variant === 'primary'
      ? colors.primary[600]
      : variant === 'secondary'
        ? colors.secondary[600]
        : variant === 'outline'
          ? 'transparent'
          : 'transparent';

  const fg = textColor
    ? textColor
    : variant === 'primary' || variant === 'secondary'
      ? '#ffffff'
      : colors.primary[600];

  const border =
    variant === 'outline' ? { borderWidth: 1.5, borderColor: colors.primary[600] } : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.base, { backgroundColor: bg, opacity: disabled ? 0.5 : 1 }, border, style]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
