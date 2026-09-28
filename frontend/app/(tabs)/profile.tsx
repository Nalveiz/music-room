import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useGetProfileQuery } from '@/src/store/api/authApi';
import { BaseComponent } from '@/src/core/base/BaseComponent';
import { useThemeColors } from '@/src/theme/ThemeProvider';
import { ErrorHandler } from '@/src/core/exceptions/ErrorHandler';
import { Button } from '@/src/components/common/Button';
import { useAuth } from '@/src/core/auth/AuthProvider';
import { LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { user, signOut } = useAuth();

  const userId = user?.id;
  const { data, isLoading, isError, error, refetch, } = useGetProfileQuery(userId!, {skip: !userId,});

  const handleRetry= useCallback(() => refetch(), [refetch]);

  if (isError) {
    ErrorHandler.log(error, 'ProfileScreen.getProfile');
  }

  return (
    <BaseComponent
      isLoading={isLoading}
      isError={isError}
      errorMessage={(error as Error)?.message ?? 'Profil yüklenemedi.'}
      onRetry={handleRetry}
      skeletonVariant="profile"
      skeletonCount={1}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profil</Text>
      </View>

      {data && (
        <>
        {/* Public infos */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Herkese Açık Bilgiler</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.label, {color: colors.textMuted}]}>Ad</Text>
            <Text style={[styles.value, {color: colors.text}]}>{data.name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, {color: colors.textMuted}]}>Soyad</Text>
            <Text style={[styles.value, {color: colors.text}]}>{data.surname}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, {color: colors.textMuted}]}>Kullanıcı Adı</Text>
            <Text style={[styles.value, {color: colors.text}]}>@{data.username}</Text>
          </View>
        </View>

        {/* // Friends-only */}
        <View 
          style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.border,},]}
        >
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Sadece Arkadaşlar</Text>
          
          <View style={styles.photoRow}>
            {data.profile_photo ? (
              <Image
                source={{ uri: data.profile_photo }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary[600] }, ]}
              >
                <Text style={styles.avatarText}>{data.name[0]}{data.surname[0]}
                </Text>
              </View>
            )}

            <View style={styles.profileInfo}>
              <Text style={[styles.label,{ color: colors.textMuted },]}> Profil Fotoğrafı</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {data.profile_photo ? 'Eklendi' : 'Eklenmedi'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, {color: colors.textMuted}]}>Doğum Tarihi</Text>
            <Text style={[styles.value, {color: colors.text}]}>{formatBirthDate(data.birth_date)}</Text>
          </View>

        </View>
          
        {/* Private */}
        <View 
          style={[styles.card, {backgroundColor: colors.surface, borderColor: colors.border,},]}
        >
          <Text style={[styles.sectionTitle, {color: colors.text}]}>Gizli Bilgiler</Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.label, {color: colors.textMuted}]}>E-posta</Text>
            <Text style={[styles.value, {color: colors.text}]}numberOfLines={1}>{data.email ?? 'Not added'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, {color: colors.textMuted}]}>Giriş Yöntemi</Text>
            <Text style={[styles.value, {color: colors.text}]}>{data.auth_provider ? data.auth_provider : 'Email'}</Text>
          </View>


        </View>
      </>
      )}

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
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 20,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
    fontWeight: '400',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  logoutBtn: {
    marginTop: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },

   label: {
    fontSize: 14,
    fontWeight: '500',
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },

   photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

});


const formatBirthDate = (date?: string | null) => {
  if (!date) return 'Belirtilmemiş';

  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return 'Belirtilmemiş';
  }

  return parsedDate.toLocaleDateString('tr-TR');
};