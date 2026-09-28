import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, User, Settings } from 'lucide-react-native';
import { useThemeColors } from '@/src/theme/ThemeProvider';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 28)
    : Math.max(insets.bottom, 24);

  const dynamicTabBarHeight = 56 + bottomInset;

  const activeColor = colors.isDark ? colors.text : colors.primary[600];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: dynamicTabBarHeight,
          paddingBottom: bottomInset,
          paddingTop: 10,
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />}
              <Home size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />}
              <User size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Uygulama Ayarları',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />}
              <Settings size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  activeIndicator: {
    position: 'absolute',
    top: -10,
    width: 32,
    height: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
