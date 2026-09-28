import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { BaseComponent } from '@/src/core/base/BaseComponent';
import { useThemeColors, useThemeMode } from '@/src/theme/ThemeProvider';
import { AppThemeMode } from '@/src/types';
import { Button } from '@/src/components/common/Button';
import { useAuth } from '@/src/core/auth/AuthProvider';


const THEME_OPTIONS: { mode: AppThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
  { mode: 'system', label: 'System', icon: Monitor },
];

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { themeMode, setMode } = useThemeMode();
  const { user, signOut } = useAuth();


  return (
    <BaseComponent isLoading={false} isError={false} scrollable>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Theme & preferences
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {THEME_OPTIONS.map(({ mode, label, icon: Icon }, idx) => {
            const active = themeMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => setMode(mode)}
                style={[
                  styles.themeRow,
                  idx < THEME_OPTIONS.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <Icon size={20} color={active ? colors.primary[600] : colors.textMuted} />
                <Text
                  style={[
                    styles.themeLabel,
                    { color: active ? colors.primary[600] : colors.text },
                  ]}
                >
                  {label}
                </Text>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: active ? colors.primary[600] : colors.border,
                      backgroundColor: active ? colors.primary[600] : 'transparent',
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Button
            label="Çıkış Yap"
            variant="outline"
            onPress={() => signOut()}
            style={styles.logoutBtn}
          />

    </BaseComponent>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  themeLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
   logoutBtn: {
    marginTop: 16,
  },
});
